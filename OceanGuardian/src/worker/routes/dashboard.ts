import { Hono } from "hono";
import { getTursoClient } from "../db";

import type { UserProfile } from "@/shared/types";
import { authMiddleware } from "../middleware";

const app = new Hono<{ Bindings: Env; Variables: { user: UserProfile | null } }>();

// GET /api/dashboard/stats
app.get("/api/dashboard/stats", async (c) => {
    const db = getTursoClient(c.env);

    // 1. Total Sightings
    const sightingsResult = await db.execute({
        sql: "SELECT COUNT(*) as count FROM sightings WHERE status != 'removed'",
        args: [],
    });
    const totalSightings = Number(sightingsResult.rows[0]?.count || 0);

    // 2. Active Missions (upcoming or active)
    const missionsResult = await db.execute({
        sql: "SELECT COUNT(*) as count FROM missions WHERE status IN ('upcoming', 'active')",
        args: [],
    });
    const activeMissions = Number(missionsResult.rows[0]?.count || 0);

    // 3. Total Guardians (users)
    const usersResult = await db.execute({
        sql: "SELECT COUNT(*) as count FROM user_profiles",
        args: [],
    });
    const totalGuardians = Number(usersResult.rows[0]?.count || 0);

    // 4. Recent Sighting Trend (last 7 days vs previous 7 days) - optional enhancement
    // For now, we'll just return the raw counts.

    return c.json({
        totalSightings,
        activeMissions,
        totalGuardians,
    });
});

export default app;
