
import { Hono } from "hono";
import { authMiddleware } from "@getmocha/users-service/backend";
import { getTursoClient } from "../db";

const app = new Hono<{ Bindings: Env }>();

// Follow a user
app.post("/api/users/:id/follow", authMiddleware, async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const followingId = c.req.param("id");
    if (user.id === followingId) {
        return c.json({ error: "Cannot follow yourself" }, 400);
    }

    const db = getTursoClient(c.env);

    // Check if target user exists
    const targetUser = await db.execute({
        sql: "SELECT id FROM user_profiles WHERE id = ?",
        args: [followingId]
    });

    if (targetUser.rows.length === 0) {
        return c.json({ error: "User not found" }, 404);
    }

    try {
        await db.execute({
            sql: "INSERT INTO user_follows (follower_id, following_id) VALUES (?, ?)",
            args: [user.id, followingId]
        });
        return c.json({ success: true });
    } catch (e: any) {
        if (e.message?.includes("UNIQUE constraint failed")) {
            return c.json({ error: "Already following" }, 400);
        }
        throw e;
    }
});

// Unfollow a user
app.delete("/api/users/:id/follow", authMiddleware, async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const followingId = c.req.param("id");
    const db = getTursoClient(c.env);

    await db.execute({
        sql: "DELETE FROM user_follows WHERE follower_id = ? AND following_id = ?",
        args: [user.id, followingId]
    });

    return c.json({ success: true });
});

// Get followers
app.get("/api/users/:id/followers", async (c) => {
    const userId = c.req.param("id");
    const db = getTursoClient(c.env);

    const result = await db.execute({
        sql: `
            SELECT u.id, u.username, u.avatar_url, u.level, u.is_anonymous
            FROM user_follows f
            JOIN user_profiles u ON f.follower_id = u.id
            WHERE f.following_id = ?
            ORDER BY f.created_at DESC
        `,
        args: [userId]
    });

    // Mask anonymous users if needed, though usually followers list implies some visibility?
    // Let's respect is_anonymous for public lists
    const followers = result.rows.map(row => {
        if (Number(row.is_anonymous)) {
            return {
                ...row,
                username: "Anonymous User",
                avatar_url: null
            };
        }
        return row;
    });

    return c.json(followers);
});

// Get following
app.get("/api/users/:id/following", async (c) => {
    const userId = c.req.param("id");
    const db = getTursoClient(c.env);

    const result = await db.execute({
        sql: `
             SELECT u.id, u.username, u.avatar_url, u.level, u.is_anonymous
             FROM user_follows f
             JOIN user_profiles u ON f.following_id = u.id
             WHERE f.follower_id = ?
             ORDER BY f.created_at DESC
         `,
        args: [userId]
    });

    const following = result.rows.map(row => {
        if (Number(row.is_anonymous)) {
            return {
                ...row,
                username: "Anonymous User",
                avatar_url: null
            };
        }
        return row;
    });

    return c.json(following);
});

// Get activity feed
app.get("/api/activity-feed", authMiddleware, async (c) => {
    const user = c.get("user");
    const filter = c.req.query("filter"); // 'following' or undefined
    const limit = parseInt(c.req.query("limit") || "50");
    const db = getTursoClient(c.env);

    let sql = `
        SELECT a.*, up.username, up.avatar_url, up.level
        FROM activity_log a
        JOIN user_profiles up ON a.user_id = up.id
        WHERE 1=1
    `;
    const args: (string | number)[] = [];

    if (filter === "following" && user) {
        // Get IDs of users being followed
        sql += ` AND a.user_id IN (
            SELECT following_id FROM user_follows WHERE follower_id = ?
        )`;
        args.push(user.id);
    }

    sql += " ORDER BY a.created_at DESC LIMIT ?";
    args.push(limit);

    const result = await db.execute({ sql, args });
    return c.json(result.rows);
});

// Get notifications
app.get("/api/notifications", authMiddleware, async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const db = getTursoClient(c.env);
    const limit = parseInt(c.req.query("limit") || "50");

    const result = await db.execute({
        sql: `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
        args: [user.id, limit]
    });

    return c.json(result.rows);
});

// Mark notification as read
app.post("/api/notifications/:id/read", authMiddleware, async (c) => {
    const user = c.get("user");
    const id = c.req.param("id");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const db = getTursoClient(c.env);

    await db.execute({
        sql: "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
        args: [id, user.id]
    });

    return c.json({ success: true });
});

// Mark all notifications as read
app.post("/api/notifications/read-all", authMiddleware, async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const db = getTursoClient(c.env);

    await db.execute({
        sql: "UPDATE notifications SET is_read = 1 WHERE user_id = ?",
        args: [user.id]
    });

    return c.json({ success: true });
});

export default app;
