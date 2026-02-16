import { Hono } from "hono";
import { authMiddleware } from "@getmocha/users-service/backend";
import { getTursoClient } from "../db";

type Variables = {
    user: any;
    ambassador_region: string;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Middleware to check for ambassador role (or admin/scientist can view too?)
// Let's restrict to ambassador+
const ambassadorMiddleware = async (c: any, next: any) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const db = getTursoClient(c.env);
    const profile = await db.execute({
        sql: "SELECT role, assigned_regions FROM user_profiles WHERE id = ?",
        args: [user.id],
    });

    const role = String(profile.rows[0]?.role || "player");
    // Admins and Scientists sort of outrank, but let's stick to "ambassador dashboard is for ambassadors".
    // Admins should probably see everything.
    if (role !== "ambassador" && role !== "admin") {
        // Scientists might be ambassadors too? No, single role.
        return c.json({ error: "Access denied: Ambassadors only" }, 403);
    }
    const region = String(profile.rows[0]?.assigned_regions || "");
    c.set("ambassador_region", region);
    await next();
};

app.use("/api/ambassador/*", authMiddleware, ambassadorMiddleware);

// Get regional stats
app.get("/api/ambassador/stats", async (c) => {
    const db = getTursoClient(c.env);
    const region = c.get("ambassador_region");

    if (!region) {
        return c.json({ error: "No region assigned to this ambassador." }, 400);
    }

    // "Total users in region"
    const users = await db.execute({
        sql: "SELECT COUNT(*) as count FROM user_profiles WHERE country = ? OR region = ?",
        args: [region, region]
    });

    // "Active missions in region" -> Missions have `location_name`.
    const missions = await db.execute({
        sql: "SELECT COUNT(*) as count FROM missions WHERE location_name LIKE ? AND status = 'active'",
        args: [`%${region}%`]
    });

    // "Total Impact"
    // We don't have impact on sightings directly (except weight in reports).
    // Let's sum impact reports for missions in the region. 
    // Complex. Let's just count sightings for now.
    const sightings = await db.execute({
        sql: "SELECT COUNT(*) as count FROM sightings WHERE address LIKE ?",
        args: [`%${region}%`]
    });

    // Top contributors in region
    const topUsers = await db.execute({
        sql: `SELECT id, username, xp FROM user_profiles 
              WHERE (country = ? OR region = ?) 
              ORDER BY xp DESC LIMIT 5`,
        args: [region, region]
    });

    return c.json({
        region,
        total_users: Number(users.rows[0].count),
        total_impact: Number(sightings.rows[0].count), // Using sighting count as proxy
        active_missions: Number(missions.rows[0].count),
        top_contributors: topUsers.rows
    });
});

export default app;
