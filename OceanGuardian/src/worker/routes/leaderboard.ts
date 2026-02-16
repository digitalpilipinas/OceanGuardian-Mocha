
import { Hono } from "hono";
import { authMiddleware } from "@getmocha/users-service/backend";
import { getTursoClient } from "../db";

const app = new Hono<{ Bindings: Env }>();

// Helper to sanitize anonymous users
function sanitizeLeaderboard(rows: any[]) {
    return rows.map(row => {
        if (Number(row.is_anonymous)) {
            return {
                ...row,
                username: "Anonymous User",
                avatar_url: null,
                id: row.id // Keep ID for potential self-identification if needed, or maybe mask it too? 
                // For now, keeping ID is useful for "is this me?" checks on frontend.
            };
        }
        return row;
    });
}

// Global Leaderboard
app.get("/api/leaderboard/global", async (c) => {
    const db = getTursoClient(c.env);
    const limit = 50;

    // Check if we need to filter out opted-out users (leaderboard_visible = 0)
    const result = await db.execute({
        sql: `
            SELECT id, username, avatar_url, level, xp, country, region, streak_days, is_anonymous
            FROM user_profiles
            WHERE leaderboard_visible = 1
            ORDER BY xp DESC
            LIMIT ?
        `,
        args: [limit]
    });

    return c.json(sanitizeLeaderboard(result.rows));
});

// Regional Leaderboard
app.get("/api/leaderboard/regional", authMiddleware, async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const db = getTursoClient(c.env);

    // Get user's region/country
    const profileRes = await db.execute({
        sql: "SELECT country FROM user_profiles WHERE id = ?",
        args: [user.id]
    });

    if (profileRes.rows.length === 0 || !profileRes.rows[0].country) {
        return c.json([]); // No country set, return empty or global? returning empty to prompt setup
    }

    const country = profileRes.rows[0].country;

    const result = await db.execute({
        sql: `
            SELECT id, username, avatar_url, level, xp, country, region, is_anonymous
            FROM user_profiles
            WHERE leaderboard_visible = 1 AND country = ?
            ORDER BY xp DESC
            LIMIT 50
        `,
        args: [country]
    });

    return c.json(sanitizeLeaderboard(result.rows));
});

// Friends Leaderboard
app.get("/api/leaderboard/friends", authMiddleware, async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const db = getTursoClient(c.env);

    // Get friends (following) + self
    // We can join user_follows
    const result = await db.execute({
        sql: `
            SELECT u.id, u.username, u.avatar_url, u.level, u.xp, u.country, u.is_anonymous
            FROM user_profiles u
            LEFT JOIN user_follows f ON u.id = f.following_id
            WHERE (f.follower_id = ? OR u.id = ?) AND u.leaderboard_visible = 1
            GROUP BY u.id
            ORDER BY u.xp DESC
            LIMIT 50
        `,
        args: [user.id, user.id]
    });

    return c.json(sanitizeLeaderboard(result.rows));
});

// Streak Leaderboard
app.get("/api/leaderboard/streak", async (c) => {
    const db = getTursoClient(c.env);
    const limit = 50;

    const result = await db.execute({
        sql: `
            SELECT id, username, avatar_url, level, streak_days, country, is_anonymous
            FROM user_profiles
            WHERE leaderboard_visible = 1 AND streak_days > 0
            ORDER BY streak_days DESC
            LIMIT ?
        `,
        args: [limit]
    });

    return c.json(sanitizeLeaderboard(result.rows));
});

export default app;
