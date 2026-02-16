import { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { getTursoClient } from "../db";
import { SESSION_COOKIE_NAME, authMiddleware } from "../middleware";
import { sendOtpEmail } from "../email";
import { hashPassword, verifyPassword } from "../hash";
import type { UserProfile } from "@/shared/types";

const auth = new Hono<{ Bindings: Env; Variables: { user: UserProfile | null } }>();

// ──────────────────────────────────────
//  Password-based Sign Up
// ──────────────────────────────────────
auth.post("/api/auth/signup", async (c) => {
  const { email, password, username } = await c.req.json();
  if (!email || !password) return c.json({ error: "Email and password required" }, 400);
  if (password.length < 6) return c.json({ error: "Password must be at least 6 characters" }, 400);

  const db = getTursoClient(c.env);

  // Ensure password_hash column exists (idempotent migration)
  try {
    await db.execute({ sql: "ALTER TABLE user_profiles ADD COLUMN password_hash TEXT", args: [] });
  } catch (_) {
    // Column already exists — that's fine
  }

  // Check if email already taken
  const existing = await db.execute({
    sql: "SELECT id FROM user_profiles WHERE email = ?",
    args: [email],
  });
  if (existing.rows.length > 0) {
    return c.json({ error: "An account with this email already exists. Please sign in." }, 409);
  }

  // Hash password and create user
  const passwordHash = await hashPassword(password);
  const userId = crypto.randomUUID();
  const displayName = username || email.split("@")[0];

  await db.execute({
    sql: "INSERT INTO user_profiles (id, username, email, role, password_hash) VALUES (?, ?, ?, 'player', ?)",
    args: [userId, displayName, email, passwordHash],
  });

  // Create session
  const sessionToken = crypto.randomUUID();
  const sessionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
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

// ──────────────────────────────────────
//  Password-based Login
// ──────────────────────────────────────
auth.post("/api/auth/login", async (c) => {
  const { email, password } = await c.req.json();
  if (!email || !password) return c.json({ error: "Email and password required" }, 400);

  const db = getTursoClient(c.env);

  const userResult = await db.execute({
    sql: "SELECT id, password_hash FROM user_profiles WHERE email = ?",
    args: [email],
  });

  if (userResult.rows.length === 0) {
    return c.json({ error: "No account found with this email" }, 401);
  }

  const user = userResult.rows[0];
  const storedHash = user.password_hash as string | null;

  if (!storedHash) {
    return c.json({ error: "This account was created without a password. Please sign up again or use OTP login." }, 401);
  }

  const valid = await verifyPassword(password, storedHash);
  if (!valid) {
    return c.json({ error: "Incorrect password" }, 401);
  }

  // Create session
  const sessionToken = crypto.randomUUID();
  const sessionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  await db.execute({
    sql: "INSERT INTO auth_sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
    args: [sessionToken, user.id as string, sessionExpires],
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

// ──────────────────────────────────────
//  OTP-based Auth (kept for future use)
// ──────────────────────────────────────

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

  // Log OTP for dev convenience
  console.log(`OTP for ${email}: ${code}`);

  // Send OTP email via Resend
  const resendApiKey = c.env.RESEND_API_KEY || "re_MoS5G6c9_4KJgiEtQ3VWBtSoGbNfUa3fG";
  const emailResult = await sendOtpEmail(resendApiKey, email, code);
  if (!emailResult.success) {
    console.error("Failed to send OTP email:", emailResult.error);
  } else {
    console.log(`OTP email sent successfully to ${email}`);
  }

  return c.json({ success: true, message: "OTP sent" });
});

// Verify OTP
auth.post("/api/auth/otp/verify", async (c) => {
  const body = await c.req.json();
  const email = body.email;
  const code = body.code || body.otp;
  const db = getTursoClient(c.env);

  const now = new Date().toISOString();
  const result = await db.execute({
    sql: "SELECT * FROM auth_otps WHERE email = ? AND code = ? AND expires_at > ?",
    args: [email, code, now],
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
  const sessionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
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

// ──────────────────────────────────────
//  Guest Login
// ──────────────────────────────────────
auth.post("/api/auth/guest", async (c) => {
  const db = getTursoClient(c.env);
  const guestId = `guest_${crypto.randomUUID().substring(0, 8)}`;

  await db.execute({
    sql: "INSERT INTO user_profiles (id, username, role) VALUES (?, ?, 'guest')",
    args: [guestId, "Guest Guardian"],
  });

  const sessionToken = crypto.randomUUID();
  const sessionExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
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
