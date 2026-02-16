import { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { getTursoClient } from "../db";
import { SESSION_COOKIE_NAME, authMiddleware } from "../middleware";
import type { UserProfile } from "@/shared/types";

const auth = new Hono<{ Bindings: Env; Variables: { user: UserProfile | null } }>();

// Send OTP
auth.post("/api/auth/otp/send", async (c) => {
  const { email } = await c.req.json();
  if (!email) return c.json({ error: "Email required" }, 400);

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

  const db = getTursoClient(c.env);
  await db.execute({
    sql: "INSERT OR REPLACE INTO auth_otps (email, code, expires_at) VALUES (?, ?, ?)",
    args: [email, code, expiresAt],
  });

  // In a real app, send email. For now, log it or use the EMAILS binding if it works.
  console.log(`OTP for ${email}: ${code}`);

  if (c.env.EMAILS) {
    try {
      await c.env.EMAILS.send({
        to: email,
        from: "auth@oceanguardian.app",
        subject: "Your OceanGuardian Login Code",
        content: [{ type: "text/plain", value: `Your login code is: ${code}` }],
      });
    } catch (e) {
      console.error("Failed to send email", e);
    }
  }

  return c.json({ success: true, message: "OTP sent" });
});

// Verify OTP
auth.post("/api/auth/otp/verify", async (c) => {
  const { email, code } = await c.req.json();
  const db = getTursoClient(c.env);

  const result = await db.execute({
    sql: "SELECT * FROM auth_otps WHERE email = ? AND code = ? AND expires_at > datetime('now')",
    args: [email, code],
  });

  if (result.rows.length === 0) {
    return c.json({ error: "Invalid or expired code" }, 400);
  }

  // Clear OTP
  await db.execute({ sql: "DELETE FROM auth_otps WHERE email = ?", args: [email] });

  // Get or create user
  let userResult = await db.execute({
    sql: "SELECT * FROM user_profiles WHERE email = ?",
    args: [email],
  });

  let userId: string;
  if (userResult.rows.length === 0) {
    userId = crypto.randomUUID();
    const username = email.split("@")[0];
    await db.execute({
      sql: "INSERT INTO user_profiles (id, username, email, role) VALUES (?, ?, ?, 'player')",
      args: [userId, username, email],
    });
  } else {
    userId = userResult.rows[0].id as string;
  }

  // Create session
  const sessionToken = crypto.randomUUID();
  const sessionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
  await db.execute({
    sql: "INSERT INTO auth_sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
    args: [sessionToken, userId, sessionExpires],
  });

  setCookie(c, SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    secure: true,
    sameSite: "Lax",
    maxAge: 30 * 24 * 60 * 60,
  });

  return c.json({ success: true });
});

// Guest Login
auth.post("/api/auth/guest", async (c) => {
  const db = getTursoClient(c.env);
  const guestId = `guest_${crypto.randomUUID().substring(0, 8)}`;

  await db.execute({
    sql: "INSERT INTO user_profiles (id, username, role) VALUES (?, ?, 'guest')",
    args: [guestId, "Guest Guardian"],
  });

  const sessionToken = crypto.randomUUID();
  const sessionExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 1 day
  await db.execute({
    sql: "INSERT INTO auth_sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
    args: [sessionToken, guestId, sessionExpires],
  });

  setCookie(c, SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    secure: true,
    sameSite: "Lax",
    maxAge: 24 * 60 * 60,
  });

  return c.json({ success: true });
});

// Get current user
auth.get("/api/auth/me", authMiddleware, async (c) => {
  const user = c.get("user");
  return c.json({ user });
});

// Logout
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
