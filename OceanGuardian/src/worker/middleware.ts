import { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { getTursoClient } from "./db";
import type { UserProfile } from "@/shared/types";

export const SESSION_COOKIE_NAME = "og_session_token";

export async function authMiddleware(c: Context<{ Bindings: Env; Variables: { user: UserProfile | null } }>, next: Next) {
    const sessionToken = getCookie(c, SESSION_COOKIE_NAME);

    if (!sessionToken) {
        c.set("user", null);
        return await next();
    }

    const db = getTursoClient(c.env);

    try {
        const result = await db.execute({
            sql: `
                SELECT u.* 
                FROM user_profiles u
                JOIN auth_sessions s ON u.id = s.user_id
                WHERE s.id = ? AND datetime(s.expires_at) > datetime('now')
            `,
            args: [sessionToken],
        });

        if (result.rows.length > 0) {
            c.set("user", result.rows[0] as unknown as UserProfile);
        } else {
            c.set("user", null);
        }
    } catch (error) {
        console.error("Auth middleware error:", error);
        c.set("user", null);
    }

    await next();
}

// Helper to require auth
export async function requireAuth(c: Context<{ Variables: { user: UserProfile | null } }>, next: Next) {
    const user = c.get("user");
    if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
    }
    await next();
}
