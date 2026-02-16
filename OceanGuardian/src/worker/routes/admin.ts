import { Hono } from "hono";
import { authMiddleware } from "../middleware";
import { getTursoClient } from "../db";
import type { UserProfile, UserRole } from "@/shared/types";
import { UserRoleSchema } from "@/shared/types";

const app = new Hono<{ Bindings: Env; Variables: { user: UserProfile | null } }>();

// Middleware to check for admin role
const adminMiddleware = async (c: any, next: any) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const db = getTursoClient(c.env);
    const profile = await db.execute({
        sql: "SELECT role FROM user_profiles WHERE id = ?",
        args: [user.id],
    });

    const role = String(profile.rows[0]?.role || "player");
    if (role !== "admin") {
        return c.json({ error: "Access denied: Admins only" }, 403);
    }
    await next();
};

app.use("/api/admin/*", authMiddleware, adminMiddleware);

// Get platform stats
app.get("/api/admin/stats", async (c) => {
    const db = getTursoClient(c.env);


    const [users, sightings, missions, active] = await Promise.all([
        db.execute({ sql: "SELECT COUNT(*) as count FROM user_profiles", args: [] }),
        db.execute({ sql: "SELECT COUNT(*) as count FROM sightings", args: [] }),
        db.execute({ sql: "SELECT COUNT(*) as count FROM missions", args: [] }),
        db.execute({ sql: "SELECT COUNT(*) as count FROM user_profiles WHERE last_active > datetime('now', '-1 hour')", args: [] }),
    ]);

    const roles = await db.execute({ sql: "SELECT role, COUNT(*) as count FROM user_profiles GROUP BY role", args: [] });
    const rolesMap: Record<string, number> = {};
    roles.rows.forEach(r => {
        rolesMap[String(r.role)] = Number(r.count);
    });

    const recent = await db.execute({ sql: "SELECT * FROM user_profiles ORDER BY created_at DESC LIMIT 5", args: [] });

    return c.json({
        total_users: Number(users.rows[0].count),
        total_sightings: Number(sightings.rows[0].count),
        total_missions: Number(missions.rows[0].count),
        active_now: Number(active.rows[0].count),
        users_by_role: rolesMap,
        recent_signups: recent.rows,
    });
});

// List users
app.get("/api/admin/users", async (c) => {
    const db = getTursoClient(c.env);
    const page = parseInt(c.req.query("page") || "1");
    const limit = 20;
    const offset = (page - 1) * limit;
    const search = c.req.query("search");

    let sql = "SELECT * FROM user_profiles WHERE 1=1";
    const args: any[] = [];

    if (search) {
        sql += " AND (username LIKE ? OR email LIKE ?)";
        args.push(`%${search}%`, `%${search}%`);
    }

    sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    args.push(limit, offset);

    const result = await db.execute({ sql, args });
    return c.json(result.rows);
});

// Update user role
app.post("/api/admin/users/:id/role", async (c) => {
    const id = c.req.param("id");
    const { role } = await c.req.json();

    const parsed = UserRoleSchema.safeParse(role);
    if (!parsed.success) {
        return c.json({ error: "Invalid role" }, 400);
    }

    const db = getTursoClient(c.env);
    await db.execute({
        sql: "UPDATE user_profiles SET role = ? WHERE id = ?",
        args: [role, id],
    });

    return c.json({ success: true, role });
});


// Manage Badges
app.get("/api/admin/config/badges", async (c) => {
    const db = getTursoClient(c.env);
    const result = await db.execute({ sql: "SELECT * FROM badges ORDER BY category, requirement_value", args: [] });
    return c.json(result.rows);
});

app.post("/api/admin/config/badges", async (c) => {
    const data = await c.req.json();
    const db = getTursoClient(c.env);

    if (data.id) {
        await db.execute({
            sql: `UPDATE badges SET name=?, description=?, category=?, rarity=?, icon=?, requirement_type=?, requirement_value=?, is_hidden=? WHERE id=?`,
            args: [data.name, data.description, data.category, data.rarity, data.icon, data.requirement_type, data.requirement_value, data.is_hidden, data.id]
        });
    } else {
        await db.execute({
            sql: `INSERT INTO badges (name, description, category, rarity, icon, requirement_type, requirement_value, is_hidden) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [data.name, data.description, data.category, data.rarity, data.icon, data.requirement_type, data.requirement_value, data.is_hidden || 0]
        });
    }
    return c.json({ success: true });
});

export default app;

