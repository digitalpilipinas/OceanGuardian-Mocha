import { Hono } from "hono";
import { authMiddleware } from "@getmocha/users-service/backend";
import { getTursoClient } from "../db";
import type { Badge } from "@/shared/types";

type TursoClient = ReturnType<typeof getTursoClient>;

const app = new Hono<{ Bindings: Env }>();

// ── Level Perks Definition ────────────────────────────────────
const LEVEL_PERKS: { level: number; title: string; description: string; icon: string }[] = [
    { level: 5, title: "Regional Explorer", description: "Unlock regional leaderboards", icon: "🗺️" },
    { level: 10, title: "Mission Creator", description: "Create private cleanup missions", icon: "🎯" },
    { level: 15, title: "Advanced Analyst", description: "Access advanced map filters", icon: "🔬" },
    { level: 20, title: "Coral Scientist", description: "Unlock AI coral analysis tools", icon: "🪸" },
    { level: 25, title: "Ambassador Nominator", description: "Nominate new Ambassadors", icon: "🤝" },
    { level: 50, title: "Marine Legend", description: "Lifetime Legend badge & all features", icon: "👑" },
];

// ── Badge Check & Award Engine ────────────────────────────────
export async function checkAndAwardBadges(
    db: TursoClient,
    userId: string,
): Promise<Badge[]> {
    // 1. Fetch user stats
    const profileResult = await db.execute({
        sql: "SELECT level, xp, streak_days, total_sightings, total_missions FROM user_profiles WHERE id = ?",
        args: [userId],
    });

    if (profileResult.rows.length === 0) return [];

    const stats = profileResult.rows[0];
    const userLevel = Number(stats.level);
    const userSightings = Number(stats.total_sightings);
    const userMissions = Number(stats.total_missions);
    const userStreak = Number(stats.streak_days);

    // 2. Fetch badges user already has
    const earnedResult = await db.execute({
        sql: "SELECT badge_id FROM user_badges WHERE user_id = ?",
        args: [userId],
    });
    const earnedBadgeIds = new Set(
        earnedResult.rows.map((r) => Number(r.badge_id)),
    );

    // 3. Fetch all badge definitions
    const allBadgesResult = await db.execute({
        sql: "SELECT * FROM badges",
        args: [],
    });

    // 4. Determine which badges the user now qualifies for
    const newlyEarned: Badge[] = [];

    for (const badge of allBadgesResult.rows) {
        const badgeId = Number(badge.id);
        if (earnedBadgeIds.has(badgeId)) continue; // already earned

        const reqType = badge.requirement_type as string;
        const reqValue = Number(badge.requirement_value);
        let qualifies = false;

        switch (reqType) {
            case "level":
                qualifies = userLevel >= reqValue;
                break;
            case "sightings":
                qualifies = userSightings >= reqValue;
                break;
            case "missions":
                qualifies = userMissions >= reqValue;
                break;
            case "streak":
                qualifies = userStreak >= reqValue;
                break;
        }

        if (qualifies) {
            // Award the badge
            await db.execute({
                sql: "INSERT OR IGNORE INTO user_badges (user_id, badge_id) VALUES (?, ?)",
                args: [userId, badgeId],
            });

            // Log activity
            await db.execute({
                sql: `INSERT INTO activity_log (user_id, type, description, xp_earned, metadata)
              VALUES (?, 'badge', ?, 0, ?)`,
                args: [
                    userId,
                    `Earned badge: ${badge.name}`,
                    JSON.stringify({ badge_id: badgeId, badge_name: badge.name, category: badge.category }),
                ],
            });

            newlyEarned.push(badge as unknown as Badge);
        }
    }

    return newlyEarned;
}

// ── GET /api/badges — All badge definitions ───────────────────
app.get("/api/badges", async (c) => {
    const db = getTursoClient(c.env);

    const result = await db.execute({
        sql: "SELECT * FROM badges ORDER BY requirement_value ASC",
        args: [],
    });

    return c.json(result.rows);
});

// ── GET /api/profiles/me/level-perks ──────────────────────────
app.get("/api/profiles/me/level-perks", authMiddleware, async (c) => {
    const user = c.get("user");
    if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
    }

    const db = getTursoClient(c.env);

    const profileResult = await db.execute({
        sql: "SELECT level FROM user_profiles WHERE id = ?",
        args: [user.id],
    });

    const userLevel = profileResult.rows.length > 0 ? Number(profileResult.rows[0].level) : 1;

    const perks = LEVEL_PERKS.map((perk) => ({
        ...perk,
        unlocked: userLevel >= perk.level,
    }));

    return c.json({ level: userLevel, perks });
});

export { LEVEL_PERKS };
export default app;
