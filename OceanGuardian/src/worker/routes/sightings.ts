import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { authMiddleware } from "@getmocha/users-service/backend";

const app = new Hono<{ Bindings: Env }>();

// Schema for creating a sighting
const createSightingSchema = z.object({
  type: z.enum(["garbage", "floating", "wildlife", "coral"]),
  subcategory: z.string().min(1),
  description: z.string().min(1),
  severity: z.number().int().min(1).max(5),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().optional(),
});

// Get all sightings
app.get("/api/sightings", async (c) => {
  const db = c.env.DB;
  
  const sightings = await db
    .prepare(
      `SELECT 
        s.*,
        COALESCE(u.google_user_data->>'$.name', u.email) as user_name
      FROM sightings s
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC`
    )
    .all();

  return c.json(sightings.results);
});

// Get a single sighting by ID
app.get("/api/sightings/:id", async (c) => {
  const id = c.req.param("id");
  const db = c.env.DB;

  const sighting = await db
    .prepare(
      `SELECT 
        s.*,
        COALESCE(u.google_user_data->>'$.name', u.email) as user_name
      FROM sightings s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.id = ?`
    )
    .bind(id)
    .first();

  if (!sighting) {
    return c.json({ error: "Sighting not found" }, 404);
  }

  return c.json(sighting);
});

// Create a new sighting
app.post(
  "/api/sightings",
  authMiddleware,
  zValidator("json", createSightingSchema),
  async (c) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const data = c.req.valid("json");
    const db = c.env.DB;

    const result = await db
      .prepare(
        `INSERT INTO sightings (
          user_id, type, subcategory, description, severity,
          latitude, longitude, address
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        user.id,
        data.type,
        data.subcategory,
        data.description,
        data.severity,
        data.latitude,
        data.longitude,
        data.address || null
      )
      .run();

    const sighting = await db
      .prepare(
        `SELECT 
          s.*,
          COALESCE(u.google_user_data->>'$.name', u.email) as user_name
        FROM sightings s
        LEFT JOIN users u ON s.user_id = u.id
        WHERE s.id = ?`
      )
      .bind(result.meta.last_row_id)
      .first();

    return c.json(sighting, 201);
  }
);

// Upload photo for a sighting
app.post("/api/sightings/:id/photo", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const db = c.env.DB;

  // Verify the sighting belongs to the user
  const sighting = await db
    .prepare("SELECT * FROM sightings WHERE id = ? AND user_id = ?")
    .bind(id, user.id)
    .first();

  if (!sighting) {
    return c.json({ error: "Sighting not found or unauthorized" }, 404);
  }

  // Get the uploaded file
  const formData = await c.req.formData();
  const file = formData.get("photo");

  if (!file || !(file instanceof File)) {
    return c.json({ error: "No photo provided" }, 400);
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return c.json({ error: "File must be an image" }, 400);
  }

  // Generate a unique key for R2
  const ext = file.name.split(".").pop() || "jpg";
  const key = `sightings/${id}/${Date.now()}.${ext}`;

  // Upload to R2
  await c.env.R2_BUCKET.put(key, file, {
    httpMetadata: {
      contentType: file.type,
    },
  });

  // Update the sighting with the image key
  await db
    .prepare("UPDATE sightings SET image_key = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(key, id)
    .run();

  return c.json({ imageKey: key });
});

// Get photo for a sighting
app.get("/api/sightings/:id/photo", async (c) => {
  const id = c.req.param("id");
  const db = c.env.DB;

  const sighting = await db
    .prepare("SELECT image_key FROM sightings WHERE id = ?")
    .bind(id)
    .first<{ image_key: string | null }>();

  if (!sighting || !sighting.image_key) {
    return c.json({ error: "Photo not found" }, 404);
  }

  const object = await c.env.R2_BUCKET.get(sighting.image_key);

  if (!object) {
    return c.json({ error: "Photo not found in storage" }, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);

  return c.body(object.body, { headers });
});

// Delete a sighting (user can only delete their own)
app.delete("/api/sightings/:id", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const db = c.env.DB;

  // Get the sighting to check ownership and get image key
  const sighting = await db
    .prepare("SELECT * FROM sightings WHERE id = ? AND user_id = ?")
    .bind(id, user.id)
    .first<{ image_key: string | null }>();

  if (!sighting) {
    return c.json({ error: "Sighting not found or unauthorized" }, 404);
  }

  // Delete the image from R2 if it exists
  if (sighting.image_key) {
    await c.env.R2_BUCKET.delete(sighting.image_key);
  }

  // Delete the sighting
  await db.prepare("DELETE FROM sightings WHERE id = ?").bind(id).run();

  return c.json({ success: true });
});

export default app;
