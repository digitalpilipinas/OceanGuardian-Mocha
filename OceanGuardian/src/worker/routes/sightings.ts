import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { authMiddleware } from "@getmocha/users-service/backend";
import { getTursoClient } from "../db";
import { CreateSightingSchema, calculateLevel } from "@/shared/types";
import type { Sighting } from "@/shared/types";
import { checkAndAwardBadges } from "./gamification";

const app = new Hono<{ Bindings: Env }>();

// Get all sightings
app.get("/api/sightings", async (c) => {
  const db = getTursoClient(c.env);

  // Parse optional query filters
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
    // By default, don't show removed sightings
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

    // --- Rate Limiting: max 10 reports per hour ---
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

    // --- Coral validation: Level 6+, GPS required ---
    if (data.type === "coral") {
      // Check user level
      const profileCheck = await db.execute({
        sql: "SELECT level FROM user_profiles WHERE id = ?",
        args: [user.id],
      });
      const userLevel = Number(profileCheck.rows[0]?.level || 1);
      if (userLevel < 6) {
        return c.json({ error: "Coral reports require Level 6+. Keep reporting to level up!" }, 403);
      }
      if (!data.latitude || !data.longitude) {
        return c.json({ error: "Coral reports require GPS coordinates." }, 400);
      }
    }

    // Insert sighting
    const result = await db.execute({
      sql: `INSERT INTO sightings (
              user_id, type, subcategory, description, severity,
              latitude, longitude, address, bleach_percent, water_temp, depth,
              image_key, ai_analysis
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        data.image_key || null,
        data.ai_analysis || null,
      ],
    });

    const sightingId = Number(result.lastInsertRowid);

    // Calculate XP reward
    let xpEarned = 10; // Base report XP
    if (data.type === "coral") xpEarned = 20;

    // Update user profile: add XP, increment total_sightings, recalculate level
    const profileResult = await db.execute({
      sql: "SELECT xp, total_sightings FROM user_profiles WHERE id = ?",
      args: [user.id],
    });

    let leveledUp = false;
    let oldLevel = 1;
    let newLevel = 1;
    let newBadges: unknown[] = [];

    if (profileResult.rows.length > 0) {
      const currentXp = Number(profileResult.rows[0].xp);
      oldLevel = calculateLevel(currentXp);
      const updatedXp = currentXp + xpEarned;
      newLevel = calculateLevel(updatedXp);
      leveledUp = newLevel > oldLevel;
      const newSightings = Number(profileResult.rows[0].total_sightings) + 1;

      await db.execute({
        sql: `UPDATE user_profiles
              SET xp = ?, level = ?, total_sightings = ?, last_active = datetime('now')
              WHERE id = ?`,
        args: [updatedXp, newLevel, newSightings, user.id],
      });

      // Log activity
      await db.execute({
        sql: `INSERT INTO activity_log (user_id, type, description, xp_earned, metadata)
              VALUES (?, 'sighting', ?, ?, ?)`,
        args: [
          user.id,
          `Reported ${data.type}: ${data.subcategory}`,
          xpEarned,
          JSON.stringify({ sighting_id: sightingId, type: data.type }),
        ],
      });

      // Log level-up activity if applicable
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

      // Check and award badges
      newBadges = await checkAndAwardBadges(db, user.id);
    }

    // Return the created sighting
    const sighting = await db.execute({
      sql: `SELECT s.*, up.username as user_name, up.level as user_level
            FROM sightings s
            LEFT JOIN user_profiles up ON s.user_id = up.id
            WHERE s.id = ?`,
      args: [sightingId],
    });

    return c.json(
      {
        sighting: sighting.rows[0],
        xp_earned: xpEarned,
        leveled_up: leveledUp,
        old_level: oldLevel,
        new_level: newLevel,
        new_badges: newBadges,
      },
      201
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

  // Verify ownership
  const sighting = await db.execute({
    sql: "SELECT * FROM sightings WHERE id = ? AND user_id = ?",
    args: [id, user.id],
  });

  if (sighting.rows.length === 0) {
    return c.json({ error: "Sighting not found or unauthorized" }, 404);
  }

  // Get the uploaded file
  const formData = await c.req.formData();
  const file = formData.get("photo");

  if (!file || !(file instanceof File)) {
    return c.json({ error: "No photo provided" }, 400);
  }

  if (!file.type.startsWith("image/")) {
    return c.json({ error: "File must be an image" }, 400);
  }

  // Upload to R2
  const ext = file.name.split(".").pop() || "jpg";
  const key = `sightings/${id}/${Date.now()}.${ext}`;

  await c.env.R2_BUCKET.put(key, file, {
    httpMetadata: { contentType: file.type },
  });

  // Update sighting with image key
  await db.execute({
    sql: "UPDATE sightings SET image_key = ?, updated_at = datetime('now') WHERE id = ?",
    args: [key, id],
  });

  // Award bonus XP for photo
  const profileResult = await db.execute({
    sql: "SELECT xp FROM user_profiles WHERE id = ?",
    args: [user.id],
  });

  if (profileResult.rows.length > 0) {
    const newXp = Number(profileResult.rows[0].xp) + 5;
    const newLevel = calculateLevel(newXp);
    await db.execute({
      sql: "UPDATE user_profiles SET xp = ?, level = ? WHERE id = ?",
      args: [newXp, newLevel, user.id],
    });
  }

  return c.json({ imageKey: key, xp_bonus: 5 });
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

  const object = await c.env.R2_BUCKET.get(result.rows[0].image_key as string);

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

  // Delete image from R2 if exists
  if (sighting.image_key) {
    await c.env.R2_BUCKET.delete(sighting.image_key as string);
  }

  await db.execute({
    sql: "DELETE FROM sightings WHERE id = ?",
    args: [id],
  });

  return c.json({ success: true });
});

export default app;
