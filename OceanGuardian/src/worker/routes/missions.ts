import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { authMiddleware } from "@getmocha/users-service/backend";
import { getTursoClient } from "../db";
import {
    CreateMissionSchema,
    CreateImpactReportSchema,
    calculateLevel,
} from "@/shared/types";

import { checkAndAwardBadges } from "./gamification";

const app = new Hono<{ Bindings: Env }>();

// Get all missions with optional filters
app.get("/api/missions", async (c) => {
    const db = getTursoClient(c.env);
    const status = c.req.query("status");
    // const type = c.req.query("type"); // Not used yet
    const limit = parseInt(c.req.query("limit") || "50");

    let sql = `SELECT m.*, up.username as organizer_name
             FROM missions m
             LEFT JOIN user_profiles up ON m.organizer_id = up.id
             WHERE 1=1`;
    const args: (string | number)[] = [];

    if (status) {
        sql += " AND m.status = ?";
        args.push(status);
    } else {
        // Default show upcoming and active
        sql += " AND m.status IN ('upcoming', 'active')";
    }

    sql += " ORDER BY m.start_time ASC LIMIT ?";
    args.push(limit);

    const result = await db.execute({ sql, args });
    return c.json(result.rows);
});

// Get single mission details
app.get("/api/missions/:id", async (c) => {
    const id = c.req.param("id");
    const db = getTursoClient(c.env);

    // Get mission details
    const missionResult = await db.execute({
        sql: `SELECT m.*, up.username as organizer_name, up.avatar_url as organizer_avatar
          FROM missions m
          LEFT JOIN user_profiles up ON m.organizer_id = up.id
          WHERE m.id = ?`,
        args: [id],
    });

    if (missionResult.rows.length === 0) {
        return c.json({ error: "Mission not found" }, 404);
    }

    const mission = missionResult.rows[0];

    // Get participants
    const participantsResult = await db.execute({
        sql: `SELECT mp.*, up.username, up.avatar_url
          FROM mission_participants mp
          JOIN user_profiles up ON mp.user_id = up.id
          WHERE mp.mission_id = ?`,
        args: [id],
    });

    // Get impact report if exists
    const impactResult = await db.execute({
        sql: `SELECT * FROM mission_impact_reports WHERE mission_id = ?`,
        args: [id],
    });

    return c.json({
        mission,
        participants: participantsResult.rows,
        impact_report: impactResult.rows[0] || null,
    });
});

// Create a new mission (Admin/Ambassador only)
app.post(
    "/api/missions",
    authMiddleware,
    zValidator("json", CreateMissionSchema),
    async (c) => {
        const user = c.get("user");
        if (!user) return c.json({ error: "Unauthorized" }, 401);

        const db = getTursoClient(c.env);

        // Check role
        const profileResult = await db.execute({
            sql: "SELECT role FROM user_profiles WHERE id = ?",
            args: [user.id],
        });
        const role = profileResult.rows[0]?.role as string;

        if (!["admin", "ambassador"].includes(role)) {
            return c.json({ error: "Only Ambassadors and Admins can create missions." }, 403);
        }

        const data = c.req.valid("json");

        const result = await db.execute({
            sql: `INSERT INTO missions (
              title, description, location_name, latitude, longitude,
              start_time, end_time, organizer_id, difficulty, max_participants, image_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
                data.title,
                data.description,
                data.location_name,
                data.latitude,
                data.longitude,
                data.start_time,
                data.end_time,
                user.id,
                data.difficulty,
                data.max_participants || null,
                data.image_url || null,
            ],
        });

        return c.json({ id: result.lastInsertRowid, message: "Mission created" }, 201);
    }
);

// RSVP / Join a mission
app.post("/api/missions/:id/join", authMiddleware, async (c) => {
    const id = c.req.param("id");
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const db = getTursoClient(c.env);

    // Check if mission exists and is upcoming
    const missionResult = await db.execute({
        sql: "SELECT status, max_participants FROM missions WHERE id = ?",
        args: [id],
    });

    if (missionResult.rows.length === 0) return c.json({ error: "Mission not found" }, 404);
    const mission = missionResult.rows[0];

    if (mission.status !== "upcoming") {
        return c.json({ error: "Cannot join a mission that is not upcoming" }, 400);
    }

    // Check capacity
    if (mission.max_participants) {
        const countResult = await db.execute({
            sql: "SELECT COUNT(*) as count FROM mission_participants WHERE mission_id = ? AND status != 'cancelled'",
            args: [id],
        });
        if (Number(countResult.rows[0].count) >= Number(mission.max_participants)) {
            return c.json({ error: "Mission is full" }, 400);
        }
    }

    // Insert or update participant
    await db.execute({
        sql: `INSERT INTO mission_participants (mission_id, user_id, status)
          VALUES (?, ?, 'rsvp')
          ON CONFLICT(mission_id, user_id) DO UPDATE SET status = 'rsvp'`,
        args: [id, user.id],
    });

    return c.json({ success: true, message: "Joined mission" });
});

// GPS Check-in
app.post("/api/missions/:id/check-in", authMiddleware, async (c) => {
    const id = c.req.param("id");
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const { latitude, longitude } = await c.req.json<{ latitude: number; longitude: number }>();
    if (!latitude || !longitude) return c.json({ error: "GPS coordinates required" }, 400);

    const db = getTursoClient(c.env);

    // Get mission location
    const missionResult = await db.execute({
        sql: "SELECT latitude, longitude, start_time, end_time FROM missions WHERE id = ?",
        args: [id],
    });

    if (missionResult.rows.length === 0) return c.json({ error: "Mission not found" }, 404);
    const mission = missionResult.rows[0];

    // Verify time (allow check-in 30 mins before start until end)
    const now = new Date();
    const startTime = new Date(mission.start_time as string);
    const endTime = new Date(mission.end_time as string);
    const checkInStart = new Date(startTime.getTime() - 30 * 60000);

    if (now < checkInStart) return c.json({ error: "Check-in not open yet" }, 400);
    if (now > endTime) return c.json({ error: "Mission has ended" }, 400);

    // Verify distance (simple Haversine or Euclidean approximation for small distances)
    // 1 degree lat is ~111km. 0.001 deg is ~111m.
    const dist = Math.sqrt(
        Math.pow(Number(mission.latitude) - latitude, 2) + Math.pow(Number(mission.longitude) - longitude, 2)
    );

    // Allow ~500m radius roughly (0.005 degrees)
    // Improving to use Haversine would be better but this is a quick approximation for MVP
    if (dist > 0.005) {
        return c.json({ error: "You are too far from the mission location." }, 400);
    }

    // Update status
    await db.execute({
        sql: `UPDATE mission_participants
          SET status = 'checked_in', checked_in_at = datetime('now')
          WHERE mission_id = ? AND user_id = ?`,
        args: [id, user.id],
    });

    return c.json({ success: true, message: "Checked in successfully!" });
});

// Get Chat Messages
app.get("/api/missions/:id/chat", async (c) => {
    const id = c.req.param("id");
    const db = getTursoClient(c.env);
    const limit = 50;

    const result = await db.execute({
        sql: `SELECT mcm.*, up.username, up.avatar_url
          FROM mission_chat_messages mcm
          JOIN user_profiles up ON mcm.user_id = up.id
          WHERE mcm.mission_id = ?
          ORDER BY mcm.created_at ASC
          LIMIT ?`,
        args: [id, limit],
    });

    return c.json(result.rows);
});

// Post Chat Message
app.post("/api/missions/:id/chat", authMiddleware, async (c) => {
    const id = c.req.param("id");
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const { message } = await c.req.json<{ message: string }>();
    if (!message || message.trim().length === 0) return c.json({ error: "Message empty" }, 400);

    const db = getTursoClient(c.env);

    // Verify participant
    const partResult = await db.execute({
        sql: "SELECT status FROM mission_participants WHERE mission_id = ? AND user_id = ?",
        args: [id, user.id],
    });

    if (partResult.rows.length === 0 || partResult.rows[0].status === "cancelled") {
        return c.json({ error: "You must join the mission to chat." }, 403);
    }

    await db.execute({
        sql: `INSERT INTO mission_chat_messages (mission_id, user_id, message)
          VALUES (?, ?, ?)`,
        args: [id, user.id, message],
    });

    return c.json({ success: true });
});

// Complete Mission & Generate Report (Admin/Ambassador)
app.post(
    "/api/missions/:id/complete",
    authMiddleware,
    zValidator("json", CreateImpactReportSchema),
    async (c) => {
        const id = c.req.param("id");
        const user = c.get("user");
        if (!user) return c.json({ error: "Unauthorized" }, 401);

        const db = getTursoClient(c.env);

        // Verify organizer
        const missionResult = await db.execute({
            sql: "SELECT organizer_id, status FROM missions WHERE id = ?",
            args: [id],
        });

        if (missionResult.rows.length === 0) return c.json({ error: "Mission not found" }, 404);
        const mission = missionResult.rows[0];

        if (mission.organizer_id !== user.id) {
            // Allow admins too
            const profileResult = await db.execute({
                sql: "SELECT role FROM user_profiles WHERE id = ?",
                args: [user.id],
            });
            if (profileResult.rows[0]?.role !== 'admin') {
                return c.json({ error: "Only the organizer or admin can complete the mission." }, 403);
            }
        }

        if (mission.status === "completed") {
            return c.json({ error: "Mission already completed" }, 400);
        }

        const data = c.req.valid("json");

        // 1. Create Impact Report
        await db.execute({
            sql: `INSERT INTO mission_impact_reports (
                mission_id, total_trash_weight, trash_bags_count, participants_count, duration_minutes, notes
              ) VALUES (?, ?, ?, ?, ?, ?)`,
            args: [id, data.total_trash_weight, data.trash_bags_count, data.participants_count, data.duration_minutes, data.notes || null],
        });

        // 2. Update Mission Status
        await db.execute({
            sql: "UPDATE missions SET status = 'completed' WHERE id = ?",
            args: [id],
        });

        // 3. Distribute XP to checked-in participants
        const participants = await db.execute({
            sql: "SELECT user_id FROM mission_participants WHERE mission_id = ? AND status = 'checked_in'",
            args: [id],
        });

        // Let's simplified: Base 100 XP for completion.
        const missionXp = 100;

        for (const row of participants.rows) {
            const userId = row.user_id as string;
            // Update User Profile
            const profileRes = await db.execute({
                sql: "SELECT xp, total_missions FROM user_profiles WHERE id = ?",
                args: [userId],
            });
            if (profileRes.rows.length > 0) {
                const currentXp = Number(profileRes.rows[0].xp);
                const newXp = currentXp + missionXp;
                const newMissions = Number(profileRes.rows[0].total_missions) + 1;
                const newLevel = calculateLevel(newXp);

                await db.execute({
                    sql: `UPDATE user_profiles SET xp = ?, level = ?, total_missions = ? WHERE id = ?`,
                    args: [newXp, newLevel, newMissions, userId],
                });

                // Update participant record
                await db.execute({
                    sql: "UPDATE mission_participants SET xp_awarded = ? WHERE mission_id = ? AND user_id = ?",
                    args: [missionXp, id, userId],
                });

                // Log activity
                await db.execute({
                    sql: `INSERT INTO activity_log (user_id, type, description, xp_earned, metadata)
                      VALUES (?, 'mission', ?, ?, ?)`,
                    args: [
                        userId,
                        `Completed mission: ${mission.title || 'Cleanup'}`,
                        missionXp,
                        JSON.stringify({ mission_id: id }),
                    ],
                });

                // Check badges
                await checkAndAwardBadges(db, userId);
            }
        }

        return c.json({ success: true, message: "Mission completed and XP distributed" });
    }
);

export default app;
