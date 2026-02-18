import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { authMiddleware } from "../middleware";
import { getTursoClient } from "../db";
import {
    CreateMissionSchema,
    CreateImpactReportSchema,
    calculateLevel,
    type UserProfile,
} from "@/shared/types";

import { checkAndAwardBadges } from "./gamification";

type TursoClient = ReturnType<typeof getTursoClient>;

const app = new Hono<{ Bindings: Env; Variables: { user: UserProfile | null } }>();
const MISSION_COMPLETION_XP = 100;
const MISSION_CHAT_ALLOWED_STATUSES = new Set(["rsvp", "checked_in"]);

let missionChatSchemaReady = false;
let missionChatSchemaPromise: Promise<void> | null = null;

function isIgnorableMissionChatAlterError(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error);
    return message.includes("duplicate column name: client_request_id");
}

async function ensureMissionChatIdempotencySchema(db: TursoClient): Promise<void> {
    if (missionChatSchemaReady) return;
    if (missionChatSchemaPromise) {
        await missionChatSchemaPromise;
        return;
    }

    missionChatSchemaPromise = (async () => {
        try {
            await db.execute({
                sql: "ALTER TABLE mission_chat_messages ADD COLUMN client_request_id TEXT",
                args: [],
            });
        } catch (error) {
            if (!isIgnorableMissionChatAlterError(error)) {
                throw error;
            }
        }

        await db.execute({
            sql: `CREATE UNIQUE INDEX IF NOT EXISTS idx_mission_chat_request_id
                  ON mission_chat_messages(mission_id, user_id, client_request_id)
                  WHERE client_request_id IS NOT NULL`,
            args: [],
        });

        missionChatSchemaReady = true;
    })();

    try {
        await missionChatSchemaPromise;
    } finally {
        missionChatSchemaPromise = null;
    }
}

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
app.post("/api/missions/:id/invite-events", authMiddleware, async (c) => {
    const missionId = c.req.param("id");
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const db = getTursoClient(c.env);
    const payload: { event?: string; invite_url?: string } = await c.req
        .json<{ event?: string; invite_url?: string }>()
        .catch(() => ({} as { event?: string; invite_url?: string }));
    if (payload.event !== "mission_invite_shared") {
        return c.json({ error: "Unsupported invite event" }, 400);
    }

    const missionResult = await db.execute({
        sql: "SELECT id FROM missions WHERE id = ?",
        args: [missionId],
    });
    if (missionResult.rows.length === 0) {
        return c.json({ error: "Mission not found" }, 404);
    }

    await db.execute({
        sql: `INSERT INTO activity_log (user_id, type, description, xp_earned, metadata)
          VALUES (?, 'mission_invite', ?, 0, ?)`,
        args: [
            user.id,
            "Shared a mission invite link",
            JSON.stringify({
                event: "mission_invite_shared",
                mission_id: missionId,
                invite_url: payload.invite_url || null,
            }),
        ],
    });

    return c.json({ success: true });
});

app.post("/api/missions/:id/join", authMiddleware, async (c) => {
    const id = c.req.param("id");
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const db = getTursoClient(c.env);
    const payload: { inviter_id?: string } = await c.req
        .json<{ inviter_id?: string }>()
        .catch(() => ({} as { inviter_id?: string }));
    const inviterIdRaw = typeof payload.inviter_id === "string" ? payload.inviter_id.trim() : "";

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

    const existingParticipantResult = await db.execute({
        sql: "SELECT status FROM mission_participants WHERE mission_id = ? AND user_id = ?",
        args: [id, user.id],
    });
    const existingStatus = String(existingParticipantResult.rows[0]?.status || "");
    const alreadyJoined = existingParticipantResult.rows.length > 0 && existingStatus !== "cancelled";
    if (alreadyJoined) {
        return c.json({ success: true, message: "Already joined mission", already_joined: true });
    }

    // Insert or update participant
    await db.execute({
        sql: `INSERT INTO mission_participants (mission_id, user_id, status)
          VALUES (?, ?, 'rsvp')
          ON CONFLICT(mission_id, user_id) DO UPDATE SET status = 'rsvp'`,
        args: [id, user.id],
    });

    let invitedBy: { id: string; username: string | null } | null = null;
    const inviterId = inviterIdRaw && inviterIdRaw !== user.id ? inviterIdRaw : "";

    if (inviterId) {
        const inviterResult = await db.execute({
            sql: "SELECT id, username FROM user_profiles WHERE id = ?",
            args: [inviterId],
        });

        if (inviterResult.rows.length > 0) {
            invitedBy = {
                id: String(inviterResult.rows[0].id),
                username: (inviterResult.rows[0].username as string | null) ?? null,
            };

            await db.execute({
                sql: `INSERT INTO activity_log (user_id, type, description, xp_earned, metadata)
                  VALUES (?, 'mission_invite', ?, 0, ?)`,
                args: [
                    invitedBy.id,
                    "Mission invite accepted",
                    JSON.stringify({
                        event: "mission_invite_accepted",
                        mission_id: id,
                        invitee_id: user.id,
                    }),
                ],
            });
        }
    }

    return c.json({ success: true, message: "Joined mission", invited_by: invitedBy });
});

// GPS Check-in
app.post("/api/missions/:id/check-in", authMiddleware, async (c) => {
    const id = c.req.param("id");
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const { latitude, longitude } = await c.req.json<{ latitude: number; longitude: number }>();
    if (latitude == null || longitude == null) return c.json({ error: "GPS coordinates required" }, 400);

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

    const participantResult = await db.execute({
        sql: "SELECT status FROM mission_participants WHERE mission_id = ? AND user_id = ?",
        args: [id, user.id],
    });

    if (participantResult.rows.length === 0) {
        return c.json({ error: "You must join this mission before check-in." }, 400);
    }

    const participantStatus = String(participantResult.rows[0].status || "");
    if (participantStatus === "checked_in") {
        return c.json({ success: true, message: "Already checked in." });
    }

    if (participantStatus === "cancelled") {
        return c.json({ error: "Cancelled participants cannot check in." }, 400);
    }

    const updateResult = await db.execute({
        sql: `UPDATE mission_participants
          SET status = 'checked_in', checked_in_at = datetime('now')
          WHERE mission_id = ? AND user_id = ? AND status != 'checked_in'`,
        args: [id, user.id],
    });

    if (Number(updateResult.rowsAffected || 0) === 0) {
        return c.json({ error: "Unable to check in. Please try again." }, 409);
    }

    return c.json({ success: true, message: "Checked in successfully!" });
});

// Get Chat Messages
app.get("/api/missions/:id/chat", authMiddleware, async (c) => {
    const id = c.req.param("id");
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const db = getTursoClient(c.env);
    const limit = 50;

    const missionResult = await db.execute({
        sql: "SELECT organizer_id FROM missions WHERE id = ?",
        args: [id],
    });
    if (missionResult.rows.length === 0) {
        return c.json({ error: "Mission not found" }, 404);
    }

    const organizerId = String(missionResult.rows[0].organizer_id);
    if (organizerId !== user.id) {
        const participantResult = await db.execute({
            sql: "SELECT status FROM mission_participants WHERE mission_id = ? AND user_id = ?",
            args: [id, user.id],
        });
        if (
            participantResult.rows.length === 0 ||
            !MISSION_CHAT_ALLOWED_STATUSES.has(String(participantResult.rows[0].status))
        ) {
            return c.json({ error: "Only organizers or mission participants can view chat." }, 403);
        }
    }

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

    const payload: { message?: string; client_request_id?: string } = await c.req
        .json<{ message?: string; client_request_id?: string }>()
        .catch(() => ({} as { message?: string; client_request_id?: string }));
    const message = typeof payload.message === "string" ? payload.message.trim() : "";
    const clientRequestId = typeof payload.client_request_id === "string" ? payload.client_request_id.trim() : "";
    if (!message) return c.json({ error: "Message empty" }, 400);

    const db = getTursoClient(c.env);
    await ensureMissionChatIdempotencySchema(db);

    // Verify participant
    const partResult = await db.execute({
        sql: "SELECT status FROM mission_participants WHERE mission_id = ? AND user_id = ?",
        args: [id, user.id],
    });

    const participantStatus = String(partResult.rows[0]?.status || "");
    if (partResult.rows.length === 0 || !MISSION_CHAT_ALLOWED_STATUSES.has(participantStatus)) {
        return c.json({ error: "You must join the mission to chat." }, 403);
    }

    if (clientRequestId) {
        const existingMessage = await db.execute({
            sql: `SELECT id
                  FROM mission_chat_messages
                  WHERE mission_id = ? AND user_id = ? AND client_request_id = ?
                  LIMIT 1`,
            args: [id, user.id, clientRequestId],
        });

        if (existingMessage.rows.length > 0) {
            const chatMessageId = Number(existingMessage.rows[0].id);
            const messageResult = await db.execute({
                sql: `SELECT mcm.*, up.username, up.avatar_url
                      FROM mission_chat_messages mcm
                      JOIN user_profiles up ON mcm.user_id = up.id
                      WHERE mcm.id = ?`,
                args: [chatMessageId],
            });
            return c.json({ success: true, duplicate: true, message: messageResult.rows[0] }, 200);
        }
    }

    const insertResult = await db.execute({
        sql: `INSERT INTO mission_chat_messages (mission_id, user_id, message, client_request_id)
          VALUES (?, ?, ?, ?)`,
        args: [id, user.id, message, clientRequestId || null],
    });

    const chatMessageId = Number(insertResult.lastInsertRowid);
    const messageResult = await db.execute({
        sql: `SELECT mcm.*, up.username, up.avatar_url
              FROM mission_chat_messages mcm
              JOIN user_profiles up ON mcm.user_id = up.id
              WHERE mcm.id = ?`,
        args: [chatMessageId],
    });

    return c.json({ success: true, message: messageResult.rows[0] });
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
            sql: "SELECT organizer_id, status, title FROM missions WHERE id = ?",
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

        if (mission.status === "cancelled") {
            return c.json({ error: "Cancelled missions cannot be completed." }, 400);
        }

        const alreadyCompleted = mission.status === "completed";
        const data = c.req.valid("json");

        // Upsert impact report so retries update consistently instead of duplicating.
        await db.execute({
            sql: `INSERT INTO mission_impact_reports (
                mission_id, total_trash_weight, trash_bags_count, participants_count, duration_minutes, notes
              ) VALUES (?, ?, ?, ?, ?, ?)
              ON CONFLICT(mission_id) DO UPDATE SET
                total_trash_weight = excluded.total_trash_weight,
                trash_bags_count = excluded.trash_bags_count,
                participants_count = excluded.participants_count,
                duration_minutes = excluded.duration_minutes,
                notes = excluded.notes`,
            args: [
                id,
                data.total_trash_weight,
                data.trash_bags_count,
                data.participants_count,
                data.duration_minutes,
                data.notes || null,
            ],
        });

        await db.execute({
            sql: "UPDATE missions SET status = 'completed', updated_at = datetime('now') WHERE id = ?",
            args: [id],
        });

        const participants = await db.execute({
            sql: "SELECT user_id, xp_awarded FROM mission_participants WHERE mission_id = ? AND status = 'checked_in'",
            args: [id],
        });

        let awardedCount = 0;
        let skippedCount = 0;

        for (const row of participants.rows) {
            const userId = row.user_id as string;
            const currentAwarded = Number(row.xp_awarded || 0);
            const xpDelta = MISSION_COMPLETION_XP - currentAwarded;

            if (xpDelta <= 0) {
                skippedCount++;
                continue;
            }

            const profileRes = await db.execute({
                sql: "SELECT xp, total_missions FROM user_profiles WHERE id = ?",
                args: [userId],
            });
            if (profileRes.rows.length === 0) {
                continue;
            }

            const currentXp = Number(profileRes.rows[0].xp);
            const currentTotalMissions = Number(profileRes.rows[0].total_missions);
            const isFirstAward = currentAwarded === 0;
            const newXp = currentXp + xpDelta;
            const newTotalMissions = currentTotalMissions + (isFirstAward ? 1 : 0);
            const newLevel = calculateLevel(newXp);

            await db.execute({
                sql: `UPDATE user_profiles
                      SET xp = ?, level = ?, total_missions = ?, last_active = datetime('now')
                      WHERE id = ?`,
                args: [newXp, newLevel, newTotalMissions, userId],
            });

            await db.execute({
                sql: "UPDATE mission_participants SET xp_awarded = ? WHERE mission_id = ? AND user_id = ?",
                args: [MISSION_COMPLETION_XP, id, userId],
            });

            if (isFirstAward) {
                await db.execute({
                    sql: `INSERT INTO activity_log (user_id, type, description, xp_earned, metadata)
                          VALUES (?, 'mission', ?, ?, ?)`,
                    args: [
                        userId,
                        `Completed mission: ${String(mission.title || "Cleanup")}`,
                        MISSION_COMPLETION_XP,
                        JSON.stringify({ mission_id: id }),
                    ],
                });
            }

            await checkAndAwardBadges(db, userId);
            awardedCount++;
        }

        return c.json({
            success: true,
            message: alreadyCompleted
                ? "Mission was already completed. Rewards were reconciled."
                : "Mission completed and XP distributed.",
            already_completed: alreadyCompleted,
            awarded_count: awardedCount,
            skipped_count: skippedCount,
        });
    }
);

export default app;
