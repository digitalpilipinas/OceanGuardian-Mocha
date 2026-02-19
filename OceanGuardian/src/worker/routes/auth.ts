import { Hono, type Context } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { getTursoClient } from "../db";
import { SESSION_COOKIE_NAME, authMiddleware } from "../middleware";
import { sendOtpEmail } from "../email";
import { hashPassword, verifyPassword } from "../hash";
import type { UserProfile } from "@/shared/types";

const auth = new Hono<{ Bindings: Env; Variables: { user: UserProfile | null } }>();
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
const GUEST_SESSION_MAX_AGE_SECONDS = 24 * 60 * 60;

type RateLimitState = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitState>();
type AuthContext = Context<{ Bindings: Env; Variables: { user: UserProfile | null } }>;

function consumeRateLimit(key: string, limit: number, windowMs: number): number | null {
  const now = Date.now();

  // Opportunistic cleanup to keep memory bounded in long-lived isolates.
  if (rateLimitStore.size > 5000) {
    for (const [entryKey, state] of rateLimitStore.entries()) {
      if (state.resetAt <= now) {
        rateLimitStore.delete(entryKey);
      }
    }
  }

  const current = rateLimitStore.get(key);
  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (current.count >= limit) {
    return Math.ceil((current.resetAt - now) / 1000);
  }

  current.count += 1;
  rateLimitStore.set(key, current);
  return null;
}

function getClientIp(c: AuthContext): string {
  const cfIp = c.req.header("CF-Connecting-IP");
  if (cfIp) return cfIp;

  const forwarded = c.req.header("X-Forwarded-For");
  if (forwarded) {
    const [first] = forwarded.split(",");
    return first.trim();
  }

  return "unknown";
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function sessionCookieSecure(c: AuthContext): boolean {
  return new URL(c.req.url).protocol === "https:";
}

// ──────────────────────────────────────
//  Password-based Sign Up
// ──────────────────────────────────────
auth.post("/api/auth/signup", async (c) => {
  const { email, password, username } = await c.req.json();
  if (!email || !password) return c.json({ error: "Email and password required" }, 400);
  const normalizedEmail = normalizeEmail(email);
  if (password.length < 6) return c.json({ error: "Password must be at least 6 characters" }, 400);

  const db = getTursoClient(c.env);

  // Check if email already taken
  const existing = await db.execute({
    sql: "SELECT id FROM user_profiles WHERE email = ?",
    args: [normalizedEmail],
  });
  if (existing.rows.length > 0) {
    return c.json({ error: "An account with this email already exists. Please sign in." }, 409);
  }

  // Hash password and create user
  const passwordHash = await hashPassword(password);
  const userId = crypto.randomUUID();
  const displayName = username || normalizedEmail.split("@")[0];

  await db.execute({
    sql: "INSERT INTO user_profiles (id, username, email, role, password_hash) VALUES (?, ?, ?, 'player', ?)",
    args: [userId, displayName, normalizedEmail, passwordHash],
  });

  // Create session
  const sessionToken = crypto.randomUUID();
  const sessionExpires = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();
  await db.execute({
    sql: "INSERT INTO auth_sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
    args: [sessionToken, userId, sessionExpires],
  });

  setCookie(c, SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    secure: sessionCookieSecure(c),
    sameSite: "Lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return c.json({ success: true });
});

// ──────────────────────────────────────
//  Password-based Login
// ──────────────────────────────────────
auth.post("/api/auth/login", async (c) => {
  const { email, password } = await c.req.json();
  if (!email || !password) return c.json({ error: "Email and password required" }, 400);
  const normalizedEmail = normalizeEmail(email);
  const clientIp = getClientIp(c);

  const ipRetryAfter = consumeRateLimit(`auth:login:ip:${clientIp}`, 25, 15 * 60 * 1000);
  const emailRetryAfter = consumeRateLimit(`auth:login:email:${normalizedEmail}`, 10, 15 * 60 * 1000);
  if (ipRetryAfter || emailRetryAfter) {
    const retryAfter = Math.max(ipRetryAfter ?? 0, emailRetryAfter ?? 0);
    c.header("Retry-After", String(retryAfter));
    return c.json({ error: "Too many login attempts. Please try again later." }, 429);
  }

  const db = getTursoClient(c.env);

  const userResult = await db.execute({
    sql: "SELECT id, password_hash FROM user_profiles WHERE email = ?",
    args: [normalizedEmail],
  });

  if (userResult.rows.length === 0) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  const user = userResult.rows[0];
  const storedHash = user.password_hash as string | null;

  if (!storedHash) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  const valid = await verifyPassword(password, storedHash);
  if (!valid) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  // Create session
  const sessionToken = crypto.randomUUID();
  const sessionExpires = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();
  await db.execute({
    sql: "INSERT INTO auth_sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
    args: [sessionToken, user.id as string, sessionExpires],
  });

  setCookie(c, SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    secure: sessionCookieSecure(c),
    sameSite: "Lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return c.json({ success: true });
});

// ──────────────────────────────────────
//  OTP-based Auth (kept for future use)
// ──────────────────────────────────────

// Send OTP
auth.post("/api/auth/otp/send", async (c) => {
  const { email } = await c.req.json();
  if (!email) return c.json({ error: "Email required" }, 400);
  const normalizedEmail = normalizeEmail(email);
  const clientIp = getClientIp(c);

  const ipRetryAfter = consumeRateLimit(`auth:otp-send:ip:${clientIp}`, 15, 10 * 60 * 1000);
  const emailRetryAfter = consumeRateLimit(`auth:otp-send:email:${normalizedEmail}`, 5, 10 * 60 * 1000);
  if (ipRetryAfter || emailRetryAfter) {
    const retryAfter = Math.max(ipRetryAfter ?? 0, emailRetryAfter ?? 0);
    c.header("Retry-After", String(retryAfter));
    return c.json({ error: "Too many OTP requests. Please try again later." }, 429);
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

  const db = getTursoClient(c.env);
  await db.execute({
    sql: "INSERT OR REPLACE INTO auth_otps (email, code, expires_at) VALUES (?, ?, ?)",
    args: [normalizedEmail, code, expiresAt],
  });

  // Send OTP email via Resend
  const resendApiKey = c.env.RESEND_API_KEY;
  const emailResult = await sendOtpEmail(resendApiKey, normalizedEmail, code);
  if (!emailResult.success) {
    console.error("Failed to send OTP email:", emailResult.error);
  }

  return c.json({ success: true, message: "OTP sent" });
});

// Verify OTP
auth.post("/api/auth/otp/verify", async (c) => {
  const body = await c.req.json();
  const email = body.email;
  const code = body.code || body.otp;
  if (!email || !code) return c.json({ error: "Email and code required" }, 400);
  const normalizedEmail = normalizeEmail(email);
  const clientIp = getClientIp(c);

  const ipRetryAfter = consumeRateLimit(`auth:otp-verify:ip:${clientIp}`, 30, 10 * 60 * 1000);
  const emailRetryAfter = consumeRateLimit(`auth:otp-verify:email:${normalizedEmail}`, 10, 10 * 60 * 1000);
  if (ipRetryAfter || emailRetryAfter) {
    const retryAfter = Math.max(ipRetryAfter ?? 0, emailRetryAfter ?? 0);
    c.header("Retry-After", String(retryAfter));
    return c.json({ error: "Too many OTP attempts. Please try again later." }, 429);
  }

  const db = getTursoClient(c.env);

  const now = new Date().toISOString();
  const result = await db.execute({
    sql: "SELECT * FROM auth_otps WHERE email = ? AND code = ? AND expires_at > ?",
    args: [normalizedEmail, code, now],
  });

  if (result.rows.length === 0) {
    return c.json({ error: "Invalid or expired code" }, 400);
  }

  // Clear OTP
  await db.execute({ sql: "DELETE FROM auth_otps WHERE email = ?", args: [normalizedEmail] });

  // Get or create user
  const userResult = await db.execute({
    sql: "SELECT * FROM user_profiles WHERE email = ?",
    args: [normalizedEmail],
  });

  let userId: string;
  if (userResult.rows.length === 0) {
    userId = crypto.randomUUID();
    const username = normalizedEmail.split("@")[0];
    await db.execute({
      sql: "INSERT INTO user_profiles (id, username, email, role) VALUES (?, ?, ?, 'player')",
      args: [userId, username, normalizedEmail],
    });
  } else {
    userId = userResult.rows[0].id as string;
  }

  // Create session
  const sessionToken = crypto.randomUUID();
  const sessionExpires = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000).toISOString();
  await db.execute({
    sql: "INSERT INTO auth_sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
    args: [sessionToken, userId, sessionExpires],
  });

  setCookie(c, SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    secure: sessionCookieSecure(c),
    sameSite: "Lax",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return c.json({ success: true });
});

// ──────────────────────────────────────
//  Guest Login
// ──────────────────────────────────────
auth.post("/api/auth/guest", async (c) => {
  const db = getTursoClient(c.env);
  const guestSuffix = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const guestId = `guest_${guestSuffix}`;
  const guestUsername = `Guest ${guestSuffix.toUpperCase()}`;
  const guestEmail = `${guestId}@guest.oceanguardian.local`;

  console.log(`[Auth] Attempting guest login for ${guestId}`);

  // Debug env vars (redacted)
  if (!c.env.TURSO_DB_URL) console.error("[Auth] Missing TURSO_DB_URL");
  if (!c.env.TURSO_DB_AUTH_TOKEN) console.error("[Auth] Missing TURSO_DB_AUTH_TOKEN");

  try {
    // Attempt direct insert with known schema structure
    // We assume these columns exist based on migrations/turso-schema.sql
    try {
      await db.execute({
        sql: `INSERT INTO user_profiles (id, username, email, role, avatar_url) VALUES (?, ?, ?, ?, ?)`,
        args: [guestId, guestUsername, guestEmail, 'guest', '/src/react-app/assets/logo.png'],
      });
      console.log(`[Auth] Guest account created: ${guestId}`);
    } catch (insertError) {
      console.warn(`[Auth] Primary guest creation failed, attempting fallback. Error: ${insertError instanceof Error ? insertError.message : String(insertError)}`);

      // Fallback: Try with 'player' role if 'guest' role is not supported by check constraint
      try {
        await db.execute({
          sql: `INSERT INTO user_profiles (id, username, email, role, avatar_url) VALUES (?, ?, ?, ?, ?)`,
          args: [guestId, guestUsername, guestEmail, 'player', '/src/react-app/assets/logo.png'],
        });
        console.log(`[Auth] Guest account created with fallback role: ${guestId}`);
      } catch (fallbackError) {
        console.error(`[Auth] Fallback guest creation failed: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`);

        // If avatar_url is the issue (e.g. missing column), try without it
        try {
          console.log(`[Auth] Attempting minimal fallback (no avatar)`);
          await db.execute({
            sql: `INSERT INTO user_profiles (id, username, email, role) VALUES (?, ?, ?, ?)`,
            args: [guestId, guestUsername, guestEmail, 'player'],
          });
          console.log(`[Auth] Guest account created with minimal fallback: ${guestId}`);
        } catch (finalError) {
          console.error(`[Auth] All guest creation attempts failed: ${finalError instanceof Error ? finalError.message : String(finalError)}`);
          throw finalError;
        }
      }
    }

    const sessionToken = crypto.randomUUID();
    const sessionExpires = new Date(Date.now() + GUEST_SESSION_MAX_AGE_SECONDS * 1000).toISOString();
    await db.execute({
      sql: "INSERT INTO auth_sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
      args: [sessionToken, guestId, sessionExpires],
    });

    setCookie(c, SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      path: "/",
      secure: sessionCookieSecure(c),
      sameSite: "Lax",
      maxAge: GUEST_SESSION_MAX_AGE_SECONDS,
    });

    return c.json({ success: true });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[Auth] Guest auth critical error: ${error instanceof Error ? error.stack : errorMsg}`);
    return c.json({
      error: "Failed to start guest session.",
      details: errorMsg
    }, 500);
  }
});

// ──────────────────────────────────────
//  Session Helpers
// ──────────────────────────────────────
auth.get("/api/auth/me", authMiddleware, async (c) => {
  const user = c.get("user");
  return c.json({ user });
});

auth.post("/api/auth/logout", async (c) => {
  const sessionToken = getCookie(c, SESSION_COOKIE_NAME);
  if (sessionToken) {
    const db = getTursoClient(c.env);
    await db.execute({ sql: "DELETE FROM auth_sessions WHERE id = ?", args: [sessionToken] });
  }
  deleteCookie(c, SESSION_COOKIE_NAME);
  return c.json({ success: true });
});

export default auth;
