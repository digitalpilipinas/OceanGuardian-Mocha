import { Hono } from "hono";
import { authMiddleware } from "@getmocha/users-service/backend";
import { getTursoClient } from "../db";

const app = new Hono<{ Bindings: Env }>();

// Mock AI Analysis Logic
const analyzeCoralImage = () => {
    // Deterministic-ish mock based on nothing real yet, just random
    const bleachPercent = Math.floor(Math.random() * 100);
    let severity = "Healthy";
    let color = "#10b981"; // green-500
    let recommendation = "This coral looks healthy! Keep monitoring.";

    if (bleachPercent > 10) {
        severity = "Low";
        color = "#eab308"; // yellow-500
        recommendation = "Signs of mild stress. Check water temperature.";
    }
    if (bleachPercent > 30) {
        severity = "Moderate";
        color = "#f97316"; // orange-500
        recommendation = "Moderate bleaching detected. Reduce local stressors.";
    }
    if (bleachPercent > 60) {
        severity = "High";
        color = "#ef4444"; // red-500
        recommendation = "Severe bleaching! Urgent protection needed.";
    }
    if (bleachPercent > 90) {
        severity = "Severe";
        color = "#7f1d1d"; // red-900
        recommendation = "Critical state. Mortality risk high.";
    }

    return {
        bleachPercent,
        severity,
        color,
        recommendation,
        confidence: 0.85 + Math.random() * 0.14, // 0.85 - 0.99
        modelVersion: "mock-v1",
    };
};

// POST /api/coral/analyze
// Receives an image, saves to R2, returns Mock Analysis + Image Key
app.post("/api/coral/analyze", authMiddleware, async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const formData = await c.req.formData();
    const file = formData.get("image");

    if (!file || !(file instanceof File)) {
        return c.json({ error: "No image provided" }, 400);
    }

    // Upload to R2 immediately to get a key
    const ext = file.name.split(".").pop() || "jpg";
    const key = `coral-analysis/${user.id}/${Date.now()}.${ext}`;

    await c.env.R2_BUCKET.put(key, file, {
        httpMetadata: { contentType: file.type },
    });

    // Perform Mock Analysis
    const analysis = analyzeCoralImage();

    return c.json({
        ...analysis,
        imageKey: key,
    });
});

// GET /api/coral/heatmap
// Aggregated data for heatmap
app.get("/api/coral/heatmap", async (c) => {
    const db = getTursoClient(c.env);

    // Get all coral sightings
    const result = await db.execute({
        sql: `SELECT latitude, longitude, bleach_percent, severity 
          FROM sightings 
          WHERE type = 'coral' AND status != 'removed'`,
        args: [],
    });

    return c.json(result.rows);
});

// GET /api/coral/review-queue
// For scientists to review pending coral reports
app.get("/api/coral/review-queue", authMiddleware, async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const db = getTursoClient(c.env);

    // Check if user is scientist or admin
    const profile = await db.execute({
        sql: "SELECT role FROM user_profiles WHERE id = ?",
        args: [user.id],
    });

    const role = String(profile.rows[0]?.role || "player");
    if (role !== "scientist" && role !== "admin") {
        return c.json({ error: "Access denied: Scientists only" }, 403);
    }

    // Get pending coral sightings
    const limit = 50;
    const result = await db.execute({
        sql: `SELECT s.*, up.username 
          FROM sightings s
          LEFT JOIN user_profiles up ON s.user_id = up.id
          WHERE s.type = 'coral' 
          AND (s.status = 'pending' OR s.validated = 0)
          ORDER BY s.created_at ASC
          LIMIT ?`,
        args: [limit],
    });

    return c.json(result.rows);
});

// POST /api/coral/review/:id
// Approve or Reject a report
app.post("/api/coral/review/:id", authMiddleware, async (c) => {
    const id = c.req.param("id");
    const user = c.get("user");
    const { action } = await c.req.json(); // 'approve' | 'reject'

    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const db = getTursoClient(c.env);

    // Check privileges
    const profile = await db.execute({
        sql: "SELECT role FROM user_profiles WHERE id = ?",
        args: [user.id],
    });
    const role = String(profile.rows[0]?.role || "player");
    if (role !== "scientist" && role !== "admin") {
        return c.json({ error: "Access denied" }, 403);
    }

    let newStatus = "approved";
    let validated = 1;

    if (action === "reject") {
        newStatus = "rejected"; // or 'flagged'/'removed' depending on schema check. strict schema says: 'pending','approved','flagged','removed'. 
        // Let's use 'flagged' for rejected scientific review if 'rejected' isn't in schema, 
        // but plan said 'rejected'. Schema says: CHECK(status IN ('pending','approved','flagged','removed'))
        // So we use 'removed' or 'flagged'. Let's use 'flagged' for "Scientist rejected accuracy" but maybe not delete. 
        // Or 'removed' if it's junk.
        // Let's assume 'flagged' for now implies "Reviewer marked as bad".
        newStatus = "flagged";
        validated = 0;
    }

    await db.execute({
        sql: `UPDATE sightings 
          SET status = ?, validated = ?, validation_count = validation_count + 1, updated_at = datetime('now')
          WHERE id = ?`,
        args: [newStatus, validated, id],
    });

    return c.json({ success: true, status: newStatus });
});

export default app;
