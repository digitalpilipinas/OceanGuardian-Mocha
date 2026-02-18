import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { authMiddleware } from "../middleware";
import { getTursoClient } from "../db";
import { CreateSightingSchema, calculateLevel, type UserProfile } from "@/shared/types";
import type { Sighting } from "@/shared/types";
import { checkAndAwardBadges } from "./gamification";

type TursoClient = ReturnType<typeof getTursoClient>;

type RewardState = {
  xpEarned: number;
  leveledUp: boolean;
  oldLevel: number;
  newLevel: number;
  newBadges: unknown[];
};

const app = new Hono<{ Bindings: Env; Variables: { user: UserProfile | null } }>();
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB hard cap for uploads
const ALLOWED_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const IMAGE_EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

let requestIdSchemaReady = false;
let requestIdSchemaPromise: Promise<void> | null = null;

function validateImageFile(file: File): string | null {
  if (file.size > MAX_IMAGE_BYTES) {
    return "Image is too large. Maximum allowed size is 10MB.";
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
    return "Unsupported image format. Allowed formats: JPEG, PNG, WEBP.";
  }

  return null;
}

function isIgnorableClientRequestIdAlterError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("duplicate column name: client_request_id");
}

async function ensureClientRequestIdSchema(db: TursoClient): Promise<void> {
  if (requestIdSchemaReady) return;
  if (requestIdSchemaPromise) {
    await requestIdSchemaPromise;
    return;
  }

  requestIdSchemaPromise = (async () => {
    try {
      await db.execute({
        sql: "ALTER TABLE sightings ADD COLUMN client_request_id TEXT",
        args: [],
      });
    } catch (error) {
      if (!isIgnorableClientRequestIdAlterError(error)) {
        throw error;
      }
    }

    await db.execute({
      sql: `CREATE UNIQUE INDEX IF NOT EXISTS idx_sightings_user_request_id
            ON sightings(user_id, client_request_id)
            WHERE client_request_id IS NOT NULL`,
      args: [],
    });

    requestIdSchemaReady = true;
  })();

  try {
    await requestIdSchemaPromise;
  } finally {
    requestIdSchemaPromise = null;
  }
}

async function getSightingWithUser(db: TursoClient, sightingId: number): Promise<Record<string, unknown> | null> {
  const sighting = await db.execute({
    sql: `SELECT s.*, up.username as user_name, up.level as user_level
          FROM sightings s
          LEFT JOIN user_profiles up ON s.user_id = up.id
          WHERE s.id = ?`,
    args: [sightingId],
  });

  if (sighting.rows.length === 0) {
    return null;
  }

  return sighting.rows[0] as Record<string, unknown>;
}

async function applySightingRewardsIfNeeded(
  db: TursoClient,
  userId: string,
  sightingId: number,
  sightingType: string,
  subcategory: string
): Promise<RewardState> {
  const rewardLog = await db.execute({
    sql: `SELECT xp_earned
          FROM activity_log
          WHERE user_id = ?
            AND type = 'sighting'
            AND json_extract(metadata, '$.sighting_id') = ?
          ORDER BY id DESC
          LIMIT 1`,
    args: [userId, sightingId],
  });

  if (rewardLog.rows.length > 0) {
    const profile = await db.execute({
      sql: "SELECT level FROM user_profiles WHERE id = ?",
      args: [userId],
    });
    const currentLevel = Number(profile.rows[0]?.level || 1);

    return {
      xpEarned: Number(rewardLog.rows[0].xp_earned || 0),
      leveledUp: false,
      oldLevel: currentLevel,
      newLevel: currentLevel,
      newBadges: [],
    };
  }

  let xpEarned = 10;
  if (sightingType === "coral") xpEarned = 20;

  const profileResult = await db.execute({
    sql: "SELECT xp, total_sightings FROM user_profiles WHERE id = ?",
    args: [userId],
  });

  if (profileResult.rows.length === 0) {
    return {
      xpEarned: 0,
      leveledUp: false,
      oldLevel: 1,
      newLevel: 1,
      newBadges: [],
    };
  }

  const currentXp = Number(profileResult.rows[0].xp);
  const oldLevel = calculateLevel(currentXp);
  const updatedXp = currentXp + xpEarned;
  const newLevel = calculateLevel(updatedXp);
  const leveledUp = newLevel > oldLevel;
  const newSightings = Number(profileResult.rows[0].total_sightings) + 1;

  await db.execute({
    sql: `UPDATE user_profiles
          SET xp = ?, level = ?, total_sightings = ?, last_active = datetime('now')
          WHERE id = ?`,
    args: [updatedXp, newLevel, newSightings, userId],
  });

  await db.execute({
    sql: `INSERT INTO activity_log (user_id, type, description, xp_earned, metadata)
          VALUES (?, 'sighting', ?, ?, ?)`,
    args: [
      userId,
      `Reported ${sightingType}: ${subcategory}`,
      xpEarned,
      JSON.stringify({ sighting_id: sightingId, type: sightingType }),
    ],
  });

  if (leveledUp) {
    await db.execute({
      sql: `INSERT INTO activity_log (user_id, type, description, xp_earned, metadata)
            VALUES (?, 'level_up', ?, 0, ?)`,
      args: [
        userId,
        `Leveled up from ${oldLevel} to ${newLevel}!`,
        JSON.stringify({ old_level: oldLevel, new_level: newLevel }),
      ],
    });
  }

  const newBadges = await checkAndAwardBadges(db, userId);

  return {
    xpEarned,
    leveledUp,
    oldLevel,
    newLevel,
    newBadges,
  };
}

// Get all sightings
app.get("/api/sightings", async (c) => {
  const db = getTursoClient(c.env);

  const type = c.req.query("type");
  const status = c.req.query("status");
  const limit = parseInt(c.req.query("limit") || "100");

  let sql = `SELECT s.*, up.username as user_name, up.level as user_level
             FROM sightings s
             LEFT JOIN user_profiles up ON s.user_id = up.id
             WHERE 1=1`;
  const args: (string | number)[] = [];

  if (type) {
    sql += " AND s.type = ?";
    args.push(type);
  }

  if (status) {
    sql += " AND s.status = ?";
    args.push(status);
  } else {
    sql += " AND s.status != 'removed'";
  }

  sql += " ORDER BY s.created_at DESC LIMIT ?";
  args.push(limit);

  const result = await db.execute({ sql, args });
  return c.json(result.rows);
});

// Get a single sighting by ID
app.get("/api/sightings/:id", async (c) => {
  const id = c.req.param("id");
  const db = getTursoClient(c.env);

  const result = await db.execute({
    sql: `SELECT s.*, up.username as user_name, up.level as user_level
          FROM sightings s
          LEFT JOIN user_profiles up ON s.user_id = up.id
          WHERE s.id = ?`,
    args: [id],
  });

  if (result.rows.length === 0) {
    return c.json({ error: "Sighting not found" }, 404);
  }

  return c.json(result.rows[0] as unknown as Sighting);
});

// Create a new sighting
app.post(
  "/api/sightings",
  authMiddleware,
  zValidator("json", CreateSightingSchema),
  async (c) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const data = c.req.valid("json");
    const db = getTursoClient(c.env);

    await ensureClientRequestIdSchema(db);

    const clientRequestId = data.client_request_id?.trim() || null;
    if (clientRequestId) {
      const existingByRequest = await db.execute({
        sql: "SELECT id FROM sightings WHERE user_id = ? AND client_request_id = ? LIMIT 1",
        args: [user.id, clientRequestId],
      });

      if (existingByRequest.rows.length > 0) {
        const existingSightingId = Number(existingByRequest.rows[0].id);
        const existingSighting = await getSightingWithUser(db, existingSightingId);
        if (!existingSighting) {
          return c.json({ error: "Sighting not found" }, 404);
        }

        const rewardState = await applySightingRewardsIfNeeded(
          db,
          user.id,
          existingSightingId,
          String(existingSighting.type || data.type),
          String(existingSighting.subcategory || data.subcategory)
        );

        return c.json(
          {
            sighting: existingSighting,
            xp_earned: rewardState.xpEarned,
            leveled_up: rewardState.leveledUp,
            old_level: rewardState.oldLevel,
            new_level: rewardState.newLevel,
            new_badges: rewardState.newBadges,
            duplicate: true,
          },
          200
        );
      }
    }

    const rateCheck = await db.execute({
      sql: `SELECT COUNT(*) as count FROM activity_log
            WHERE user_id = ? AND type = 'sighting'
            AND created_at > datetime('now', '-1 hour')`,
      args: [user.id],
    });
    const recentCount = Number(rateCheck.rows[0]?.count || 0);
    if (recentCount >= 10) {
      return c.json({ error: "Rate limit exceeded. Max 10 reports per hour." }, 429);
    }

    if (data.type === "coral") {
      const profileCheck = await db.execute({
        sql: "SELECT level FROM user_profiles WHERE id = ?",
        args: [user.id],
      });
      const userLevel = Number(profileCheck.rows[0]?.level || 1);
      if (userLevel < 6) {
        return c.json({ error: "Coral reports require Level 6+. Keep reporting to level up!" }, 403);
      }
      if (data.latitude == null || data.longitude == null) {
        return c.json({ error: "Coral reports require GPS coordinates." }, 400);
      }
    }

    let imageKey: string | null = null;
    if (typeof data.image_key === "string" && data.image_key.trim().length > 0) {
      const normalizedKey = data.image_key.trim();
      const allowedPrefix = `coral-analysis/${user.id}/`;
      if (!normalizedKey.startsWith(allowedPrefix)) {
        return c.json({ error: "Invalid image key" }, 400);
      }
      imageKey = normalizedKey;
    }

    let sightingId: number | null = null;
    let createdNow = true;

    try {
      const insertResult = await db.execute({
        sql: `INSERT INTO sightings (
                user_id, type, subcategory, description, severity,
                latitude, longitude, address, bleach_percent, water_temp, depth,
                image_key, ai_analysis, client_request_id
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          user.id,
          data.type,
          data.subcategory,
          data.description,
          data.severity,
          data.latitude,
          data.longitude,
          data.address || null,
          data.bleach_percent || null,
          data.water_temp || null,
          data.depth || null,
          imageKey,
          data.ai_analysis || null,
          clientRequestId,
        ],
      });
      sightingId = Number(insertResult.lastInsertRowid);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const isRequestIdConflict = message.includes("client_request_id");
      if (!clientRequestId || !isRequestIdConflict) {
        throw error;
      }

      createdNow = false;
      const existingByRequest = await db.execute({
        sql: "SELECT id FROM sightings WHERE user_id = ? AND client_request_id = ? LIMIT 1",
        args: [user.id, clientRequestId],
      });

      if (existingByRequest.rows.length === 0) {
        throw error;
      }

      sightingId = Number(existingByRequest.rows[0].id);
    }

    if (!sightingId || sightingId <= 0) {
      return c.json({ error: "Failed to create sighting" }, 500);
    }

    const sighting = await getSightingWithUser(db, sightingId);
    if (!sighting) {
      return c.json({ error: "Sighting not found after create" }, 500);
    }

    const rewardState = await applySightingRewardsIfNeeded(
      db,
      user.id,
      sightingId,
      String(sighting.type || data.type),
      String(sighting.subcategory || data.subcategory)
    );

    return c.json(
      {
        sighting,
        xp_earned: rewardState.xpEarned,
        leveled_up: rewardState.leveledUp,
        old_level: rewardState.oldLevel,
        new_level: rewardState.newLevel,
        new_badges: rewardState.newBadges,
        duplicate: !createdNow,
      },
      createdNow ? 201 : 200
    );
  }
);

// Upload photo for a sighting
app.post("/api/sightings/:id/photo", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const db = getTursoClient(c.env);

  const sighting = await db.execute({
    sql: "SELECT id, image_key FROM sightings WHERE id = ? AND user_id = ?",
    args: [id, user.id],
  });

  if (sighting.rows.length === 0) {
    return c.json({ error: "Sighting not found or unauthorized" }, 404);
  }

  const formData = await c.req.formData();
  const file = formData.get("photo");

  if (!file || typeof file === "string") {
    return c.json({ error: "No photo provided" }, 400);
  }

  const fileData = file as unknown as File;
  const validationError = validateImageFile(fileData);
  if (validationError) {
    return c.json({ error: validationError }, 400);
  }

  const ext = IMAGE_EXTENSION_BY_MIME[fileData.type] || "jpg";
  const key = `sightings/${id}/${Date.now()}.${ext}`;

  await c.env.R2_BUCKET.put(key, fileData, {
    httpMetadata: { contentType: fileData.type },
  });

  const firstPhotoUpdate = await db.execute({
    sql: "UPDATE sightings SET image_key = ?, updated_at = datetime('now') WHERE id = ? AND image_key IS NULL",
    args: [key, id],
  });
  const isFirstPhotoForSighting = Number(firstPhotoUpdate.rowsAffected || 0) > 0;

  if (!isFirstPhotoForSighting) {
    await db.execute({
      sql: "UPDATE sightings SET image_key = ?, updated_at = datetime('now') WHERE id = ?",
      args: [key, id],
    });
  }

  let xpBonus = 0;
  let leveledUp = false;
  let oldLevel = 1;
  let newLevel = 1;
  let newBadges: unknown[] = [];

  if (isFirstPhotoForSighting) {
    const profileResult = await db.execute({
      sql: "SELECT xp FROM user_profiles WHERE id = ?",
      args: [user.id],
    });

    if (profileResult.rows.length > 0) {
      const currentXp = Number(profileResult.rows[0].xp);
      oldLevel = calculateLevel(currentXp);

      const updatedXp = currentXp + 5;
      xpBonus = 5;
      newLevel = calculateLevel(updatedXp);
      leveledUp = newLevel > oldLevel;

      await db.execute({
        sql: "UPDATE user_profiles SET xp = ?, level = ?, last_active = datetime('now') WHERE id = ?",
        args: [updatedXp, newLevel, user.id],
      });

      await db.execute({
        sql: `INSERT INTO activity_log (user_id, type, description, xp_earned, metadata)
              VALUES (?, 'sighting_photo', ?, ?, ?)`,
        args: [
          user.id,
          "Uploaded a verification photo",
          xpBonus,
          JSON.stringify({ sighting_id: Number(id) }),
        ],
      });

      if (leveledUp) {
        await db.execute({
          sql: `INSERT INTO activity_log (user_id, type, description, xp_earned, metadata)
                VALUES (?, 'level_up', ?, 0, ?)`,
          args: [
            user.id,
            `Leveled up from ${oldLevel} to ${newLevel}!`,
            JSON.stringify({ old_level: oldLevel, new_level: newLevel }),
          ],
        });
      }

      newBadges = await checkAndAwardBadges(db, user.id);
    }
  }

  return c.json({
    imageKey: key,
    xp_bonus: xpBonus,
    leveled_up: leveledUp,
    old_level: oldLevel,
    new_level: newLevel,
    new_badges: newBadges,
  });
});

// Get photo for a sighting
app.get("/api/sightings/:id/photo", async (c) => {
  const id = c.req.param("id");
  const db = getTursoClient(c.env);

  const result = await db.execute({
    sql: "SELECT image_key FROM sightings WHERE id = ?",
    args: [id],
  });

  if (result.rows.length === 0 || !result.rows[0].image_key) {
    return c.json({ error: "Photo not found" }, 404);
  }

  const seedMap: Record<string, string> = {
    "sightings/bottle.jpg": "https://images.unsplash.com/photo-1621451537084-482c73073a0f?q=80&w=800&auto=format&fit=crop",
    "sightings/coral_healthy.jpg": "https://images.unsplash.com/photo-1546026423-cc4642628d2b?q=80&w=800&auto=format&fit=crop",
    "sightings/turtle.jpg": "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?q=80&w=800&auto=format&fit=crop",
    "sightings/net.jpg": "https://images.unsplash.com/photo-1618477388954-7852f32655ec?q=80&w=800&auto=format&fit=crop",
    "sightings/bleached.jpg": "https://images.unsplash.com/photo-1583212235753-bce29b451c8a?q=80&w=800&auto=format&fit=crop",
  };

  const imageKey = result.rows[0].image_key as string;

  if (imageKey.startsWith("http")) {
    try {
      const parsed = new URL(imageKey);
      if (parsed.hostname !== "images.unsplash.com") {
        return c.json({ error: "Invalid external image source" }, 400);
      }
    } catch {
      return c.json({ error: "Invalid image URL" }, 400);
    }
    return c.redirect(imageKey);
  }

  if (seedMap[imageKey]) {
    return c.redirect(seedMap[imageKey]);
  }

  const object = await c.env.R2_BUCKET.get(imageKey);

  if (!object) {
    return c.json({ error: "Photo not found in storage" }, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);

  return c.body(object.body, { headers });
});

// Delete a sighting
app.delete("/api/sightings/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const db = getTursoClient(c.env);

  const result = await db.execute({
    sql: "SELECT * FROM sightings WHERE id = ? AND user_id = ?",
    args: [id, user.id],
  });

  if (result.rows.length === 0) {
    return c.json({ error: "Sighting not found or unauthorized" }, 404);
  }

  const sighting = result.rows[0];

  if (sighting.image_key) {
    const imageKey = String(sighting.image_key);
    const userScopedCoralPrefix = `coral-analysis/${user.id}/`;
    const isManagedBucketKey = imageKey.startsWith("sightings/") || imageKey.startsWith(userScopedCoralPrefix);
    if (isManagedBucketKey) {
      await c.env.R2_BUCKET.delete(imageKey);
    }
  }

  await db.execute({
    sql: "DELETE FROM sightings WHERE id = ?",
    args: [id],
  });

  return c.json({ success: true });
});

export default app;
