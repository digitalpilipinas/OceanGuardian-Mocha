import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { authMiddleware } from "../middleware";
import { getTursoClient } from "../db";
import type { UserProfile } from "@/shared/types";

const app = new Hono<{ Bindings: Env; Variables: { user: UserProfile | null } }>();

const CreateCommentSchema = z.object({
    content: z.string().min(1).max(1000),
    client_request_id: z.string().uuid().optional(),
});

let commentSchemaReady = false;
let commentSchemaPromise: Promise<void> | null = null;

function isIgnorableCommentAlterError(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error);
    return message.includes("duplicate column name: client_request_id");
}

async function ensureCommentIdempotencySchema(db: ReturnType<typeof getTursoClient>): Promise<void> {
    if (commentSchemaReady) return;
    if (commentSchemaPromise) {
        await commentSchemaPromise;
        return;
    }

    commentSchemaPromise = (async () => {
        try {
            await db.execute({
                sql: "ALTER TABLE sighting_comments ADD COLUMN client_request_id TEXT",
                args: [],
            });
        } catch (error) {
            if (!isIgnorableCommentAlterError(error)) {
                throw error;
            }
        }

        await db.execute({
            sql: `CREATE UNIQUE INDEX IF NOT EXISTS idx_sighting_comments_request_id
                  ON sighting_comments(sighting_id, user_id, client_request_id)
                  WHERE client_request_id IS NOT NULL`,
            args: [],
        });

        commentSchemaReady = true;
    })();

    try {
        await commentSchemaPromise;
    } finally {
        commentSchemaPromise = null;
    }
}

// Get comments for a sighting
app.get("/api/sightings/:id/comments", async (c) => {
    const sightingId = c.req.param("id");
    const db = getTursoClient(c.env);

    const result = await db.execute({
        sql: `
      SELECT c.*, up.username, up.avatar_url, up.level
      FROM sighting_comments c
      JOIN user_profiles up ON c.user_id = up.id
      WHERE c.sighting_id = ?
      ORDER BY c.created_at ASC
    `,
        args: [sightingId],
    });

    return c.json(result.rows);
});

// Post a comment
app.post(
    "/api/sightings/:id/comments",
    authMiddleware,
    zValidator("json", CreateCommentSchema),
    async (c) => {
        const sightingId = c.req.param("id");
        const user = c.get("user");
        if (!user) return c.json({ error: "Unauthorized" }, 401);

        const { content, client_request_id: clientRequestIdRaw } = c.req.valid("json");
        const clientRequestId = clientRequestIdRaw?.trim() || null;
        const db = getTursoClient(c.env);

        await ensureCommentIdempotencySchema(db);

        // Verify sighting exists
        const sightingCheck = await db.execute({
            sql: "SELECT user_id, description FROM sightings WHERE id = ?",
            args: [sightingId],
        });

        if (sightingCheck.rows.length === 0) {
            return c.json({ error: "Sighting not found" }, 404);
        }

        const sightingOwnerId = sightingCheck.rows[0].user_id as string;
        const sightingDescription = sightingCheck.rows[0].description as string;

        if (clientRequestId) {
            const existingComment = await db.execute({
                sql: `SELECT c.id
                      FROM sighting_comments c
                      WHERE c.sighting_id = ? AND c.user_id = ? AND c.client_request_id = ?
                      LIMIT 1`,
                args: [sightingId, user.id, clientRequestId],
            });

            if (existingComment.rows.length > 0) {
                const existingCommentId = Number(existingComment.rows[0].id);
                const commentResult = await db.execute({
                    sql: `
                      SELECT c.*, up.username, up.avatar_url, up.level
                      FROM sighting_comments c
                      JOIN user_profiles up ON c.user_id = up.id
                      WHERE c.id = ?
                    `,
                    args: [existingCommentId],
                });

                return c.json({ ...commentResult.rows[0], duplicate: true }, 200);
            }
        }

        // Insert comment
        const result = await db.execute({
            sql: "INSERT INTO sighting_comments (sighting_id, user_id, content, client_request_id) VALUES (?, ?, ?, ?)",
            args: [sightingId, user.id, content, clientRequestId],
        });

        const commentId = Number(result.lastInsertRowid);

        // Notify sighting owner if it's not the commenter
        if (sightingOwnerId !== user.id) {
            await db.execute({
                sql: `INSERT INTO notifications (user_id, type, title, message, related_id)
              VALUES (?, 'comment', ?, ?, ?)`,
                args: [
                    sightingOwnerId,
                    "New Comment",
                    `Someone commented on your sighting: "${sightingDescription.substring(0, 30)}..."`,
                    sightingId
                ]
            });
        }

        // Return the new comment
        const newComment = await db.execute({
            sql: `
        SELECT c.*, up.username, up.avatar_url, up.level
        FROM sighting_comments c
        JOIN user_profiles up ON c.user_id = up.id
        WHERE c.id = ?
      `,
            args: [commentId],
        });

        return c.json(newComment.rows[0], 201);
    }
);

// Toggle validation (upvote)
app.post("/api/sightings/:id/validate", authMiddleware, async (c) => {
    const sightingId = c.req.param("id");
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const db = getTursoClient(c.env);

    // Check if already validated
    const existing = await db.execute({
        sql: "SELECT 1 FROM sighting_validations WHERE sighting_id = ? AND user_id = ?",
        args: [sightingId, user.id],
    });

    let validCountChange = 0;
    let action = "";

    if (existing.rows.length > 0) {
        // Remove validation
        await db.execute({
            sql: "DELETE FROM sighting_validations WHERE sighting_id = ? AND user_id = ?",
            args: [sightingId, user.id],
        });
        validCountChange = -1;
        action = "removed";
    } else {
        // Add validation
        await db.execute({
            sql: "INSERT INTO sighting_validations (sighting_id, user_id) VALUES (?, ?)",
            args: [sightingId, user.id],
        });
        validCountChange = 1;
        action = "added";

        // Notify owner
        const sighting = await db.execute({
            sql: "SELECT user_id, description FROM sightings WHERE id = ?",
            args: [sightingId]
        });

        if (sighting.rows.length > 0) {
            const ownerId = sighting.rows[0].user_id as string;
            if (ownerId !== user.id) {
                await db.execute({
                    sql: `INSERT INTO notifications (user_id, type, title, message, related_id)
                      VALUES (?, 'validation', 'Sighting Validated', 'Someone validated your sighting!', ?)`,
                    args: [ownerId, sightingId]
                });
            }
        }
    }

    // Update sighting validation count
    await db.execute({
        sql: "UPDATE sightings SET validation_count = validation_count + ? WHERE id = ?",
        args: [validCountChange, sightingId],
    });

    // Get updated count
    const updatedSighting = await db.execute({
        sql: "SELECT validation_count FROM sightings WHERE id = ?",
        args: [sightingId],
    });

    return c.json({
        action,
        validation_count: updatedSighting.rows[0].validation_count,
    });
});

// Check if user validated a sighting
app.get("/api/sightings/:id/validate", authMiddleware, async (c) => {
    const sightingId = c.req.param("id");
    const user = c.get("user");
    if (!user) return c.json({ validated: false });

    const db = getTursoClient(c.env);
    const result = await db.execute({
        sql: "SELECT 1 FROM sighting_validations WHERE sighting_id = ? AND user_id = ?",
        args: [sightingId, user.id]
    });

    return c.json({ validated: result.rows.length > 0 });
});

export default app;
