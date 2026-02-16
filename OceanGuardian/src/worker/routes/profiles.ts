import { Hono } from "hono";
import { authMiddleware } from "@getmocha/users-service/backend";
import { getTursoClient } from "../db";
import type { UserProfile } from "@/shared/types";

const app = new Hono<{ Bindings: Env }>();

// Get or create current user's profile
app.get("/api/profiles/me", authMiddleware, async (c) => {
    const user = c.get("user");
    if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const db = getTursoClient(c.env);

    // Try to find existing profile
    const result = await db.execute({
        sql: "SELECT * FROM user_profiles WHERE id = ?",
        args: [user.id],
    });

    if (result.rows.length > 0) {
        // Update last_active
        await db.execute({
            sql: "UPDATE user_profiles SET last_active = datetime('now') WHERE id = ?",
            args: [user.id],
        });
        return c.json(result.rows[0] as unknown as UserProfile);
    }

    // Auto-create profile on first login
    const username = user.google_user_data?.name || user.email?.split("@")[0] || "Guardian";
    const avatarUrl = user.google_user_data?.picture || null;

    await db.execute({
        sql: `INSERT INTO user_profiles (id, username, avatar_url, email, role, level, xp)
          VALUES (?, ?, ?, ?, 'player', 1, 0)`,
        args: [user.id, username, avatarUrl, user.email],
    });

    const newProfile = await db.execute({
        sql: "SELECT * FROM user_profiles WHERE id = ?",
        args: [user.id],
    });

    return c.json(newProfile.rows[0] as unknown as UserProfile, 201);
});

// Update current user's profile
app.patch("/api/profiles/me", authMiddleware, async (c) => {
    const user = c.get("user");
    if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const db = getTursoClient(c.env);

    const allowedFields = ["username", "notifications_enabled", "leaderboard_visible", "theme"];
    const updates: string[] = [];
    const values: (string | number)[] = [];

    for (const field of allowedFields) {
        if (body[field] !== undefined) {
            updates.push(`${field} = ?`);
            values.push(body[field]);
        }
    }

    if (updates.length === 0) {
        return c.json({ error: "No valid fields to update" }, 400);
    }

    updates.push("last_active = datetime('now')");
    values.push(user.id);

    await db.execute({
        sql: `UPDATE user_profiles SET ${updates.join(", ")} WHERE id = ?`,
        args: values,
    });

    const updated = await db.execute({
        sql: "SELECT * FROM user_profiles WHERE id = ?",
        args: [user.id],
    });

    return c.json(updated.rows[0] as unknown as UserProfile);
});

// Get public profile by user ID
app.get("/api/profiles/:id", async (c) => {
    const id = c.req.param("id");
    const db = getTursoClient(c.env);

    const result = await db.execute({
        sql: `SELECT id, username, avatar_url, role, level, xp, reputation,
            streak_days, total_sightings, total_missions, leaderboard_visible, created_at
          FROM user_profiles WHERE id = ?`,
        args: [id],
    });

    if (result.rows.length === 0) {
        return c.json({ error: "Profile not found" }, 404);
    }

    return c.json(result.rows[0]);
});

// Get badges for current user
app.get("/api/profiles/me/badges", authMiddleware, async (c) => {
    const user = c.get("user");
    if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const db = getTursoClient(c.env);

    const result = await db.execute({
        sql: `SELECT ub.*, b.name, b.description, b.category, b.rarity, b.icon
          FROM user_badges ub
          JOIN badges b ON ub.badge_id = b.id
          WHERE ub.user_id = ?
          ORDER BY ub.earned_at DESC`,
        args: [user.id],
    });

    return c.json(result.rows);
});

// Get recent activity for current user
app.get("/api/profiles/me/activity", authMiddleware, async (c) => {
    const user = c.get("user");
    if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const db = getTursoClient(c.env);

    const result = await db.execute({
        sql: `SELECT * FROM activity_log
          WHERE user_id = ?
          ORDER BY created_at DESC
          LIMIT 20`,
        args: [user.id],
    });

    return c.json(result.rows);
});

export default app;
