import { Hono } from "hono";
import { authMiddleware } from "../middleware";
import { getTursoClient } from "../db";
import { checkAndAwardBadges } from "./gamification";
import type { UserProfile } from "@/shared/types";

const app = new Hono<{ Bindings: Env; Variables: { user: UserProfile | null } }>();

// Helper to get YYYY-MM-DD
const toDateString = (date: Date) => date.toISOString().split("T")[0];

app.get("/api/streak", authMiddleware, async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const db = getTursoClient(c.env);
    const today = new Date();
    const todayStr = toDateString(today);

    // 1. Get current profile stats
    const profileResult = await db.execute({
        sql: "SELECT streak_days, streak_freezes, last_check_in FROM user_profiles WHERE id = ?",
        args: [user.id],
    });

    if (profileResult.rows.length === 0) {
        return c.json({ error: "Profile not found" }, 404);
    }

    const profile = profileResult.rows[0];
    let streakDays = Number(profile.streak_days);
    let freezes = Number(profile.streak_freezes);
    const lastCheckIn = profile.last_check_in ? String(profile.last_check_in).split("T")[0] : null;

    let status: "checked_in" | "pending" | "frozen" | "missed" = "pending";
    let restoredDays = 0;

    // 2. Logic: Check for missed days and apply freezes
    if (lastCheckIn === todayStr) {
        status = "checked_in";
    } else if (lastCheckIn) {
        const lastDate = new Date(lastCheckIn);
        // Calculate difference in days
        const diffTime = Math.abs(today.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1; // -1 because 1 day diff is normal (yesterday)

        if (diffDays > 0) {
            // Missed days detected
            if (freezes >= diffDays) {
                // Recover using freezes
                freezes -= diffDays;
                restoredDays = diffDays;

                await db.execute({
                    sql: "UPDATE user_profiles SET streak_freezes = ? WHERE id = ?",
                    args: [freezes, user.id],
                });

                for (let i = 0; i < diffDays; i++) {
                    const freezeDate = new Date(lastDate);
                    freezeDate.setDate(freezeDate.getDate() + i + 1);
                    await db.execute({
                        sql: "INSERT INTO streak_log (user_id, activity_date, type) VALUES (?, ?, 'freeze')",
                        args: [user.id, toDateString(freezeDate)],
                    });
                }

                // Streak is preserved
            } else {
                // Not enough freezes - Logic: Reset streak
                // But we permit the user to keep the streak IF they check in today? 
                // Usually standard rule: if you missed yesterday and didn't have freeze, streak is 0.
                streakDays = 0;
                await db.execute({
                    sql: "UPDATE user_profiles SET streak_days = 0 WHERE id = ?",
                    args: [user.id],
                });
            }
        }
    }

    // 3. Get history for calendar (last 30 days)
    const historyResult = await db.execute({
        sql: `SELECT activity_date, type FROM streak_log 
              WHERE user_id = ? AND activity_date >= date('now', '-30 days')`,
        args: [user.id],
    });

    return c.json({
        streakDays,
        streakFreezes: freezes,
        status,
        restoredDays,
        history: historyResult.rows,
        lastCheckIn,
    });
});

app.post("/api/streak/check-in", authMiddleware, async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const db = getTursoClient(c.env);
    const todayStr = toDateString(new Date());

    // 1. Check if already checked in
    const checkResult = await db.execute({
        sql: "SELECT id FROM streak_log WHERE user_id = ? AND activity_date = ? AND type = 'check_in'",
        args: [user.id, todayStr],
    });

    if (checkResult.rows.length > 0) {
        return c.json({ error: "Already checked in today" }, 400);
    }

    // 2. Perform Check-in
    // Increment streak, set last_check_in, award some XP (e.g. 10)
    await db.execute({
        sql: "INSERT INTO streak_log (user_id, activity_date, type) VALUES (?, ?, 'check_in')",
        args: [user.id, todayStr],
    });

    await db.execute({
        sql: "UPDATE user_profiles SET streak_days = streak_days + 1, last_check_in = ?, xp = xp + 10 WHERE id = ?",
        args: [todayStr, user.id],
    });

    await db.execute({
        sql: "INSERT INTO activity_log (user_id, type, description, xp_earned) VALUES (?, 'streak', 'Daily Plastic-Free Pledge', 10)",
        args: [user.id],
    });

    // 3. Check for Badges (7, 30, 100, 365)
    // We reuse the gamification logic which checks all badges
    // We need to fetch the updated stats first? checkAndAwardBadges does that internally.
    const newBadges = await checkAndAwardBadges(db, user.id);

    // 4. Return new state
    const profileResult = await db.execute({
        sql: "SELECT streak_days, streak_freezes FROM user_profiles WHERE id = ?",
        args: [user.id],
    });
    const profile = profileResult.rows[0];

    return c.json({
        success: true,
        streakDays: profile.streak_days,
        streakFreezes: profile.streak_freezes,
        xpEarned: 10,
        newBadges,
    });
});

export default app;
