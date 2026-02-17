import { Hono } from "hono";
import auth from "./routes/auth";
import sightings from "./routes/sightings";
import profiles from "./routes/profiles";
import gamification from "./routes/gamification";
import streak from "./routes/streak";
import missions from "./routes/missions";

import social from "./routes/social";
import leaderboard from "./routes/leaderboard";

import coral from "./routes/coral";
import learning from "./routes/learning";
import admin from "./routes/admin";
import ambassador from "./routes/ambassador";
import scientist from "./routes/scientist";
import dashboard from "./routes/dashboard";


const app = new Hono<{ Bindings: Env }>();

app.use("*", async (c, next) => {
    const requestOrigin = new URL(c.req.url).origin;
    const origin = c.req.header("Origin");
    const allowedOrigins = new Set<string>([requestOrigin]);

    const configuredOrigins = (c.env as Env & { CORS_ORIGINS?: string }).CORS_ORIGINS;
    if (configuredOrigins) {
        for (const configuredOrigin of configuredOrigins.split(",")) {
            const trimmed = configuredOrigin.trim();
            if (trimmed.length > 0) {
                allowedOrigins.add(trimmed);
            }
        }
    }

    if (origin && allowedOrigins.has(origin)) {
        c.header("Access-Control-Allow-Origin", origin);
        c.header("Access-Control-Allow-Credentials", "true");
        c.header("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
        c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
        c.header("Vary", "Origin");
    }

    if (c.req.method === "OPTIONS") {
        return c.body(null, 204);
    }

    await next();
});

app.use("*", async (c, next) => {
    await next();
    c.header("X-Frame-Options", "DENY");
    c.header("X-Content-Type-Options", "nosniff");
    c.header("Referrer-Policy", "strict-origin-when-cross-origin");
    c.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    c.header(
        "Content-Security-Policy",
        "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; connect-src 'self'; img-src 'self' data: blob: https:; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data: https:; worker-src 'self' blob:; form-action 'self';"
    );
});

app.route("/", auth);
app.route("/", sightings);
app.route("/", profiles);
app.route("/", gamification);
app.route("/", streak);
app.route("/", missions);
app.route("/", social);
app.route("/", leaderboard);
app.route("/", coral);
app.route("/", learning);
app.route("/", admin);
app.route("/", ambassador);
app.route("/", scientist);
app.route("/", dashboard);

import comments from "./routes/comments";
app.route("/", comments);

// Removed temporary migration route
// import migrateCommunity from "./routes/migrate-community";
// app.route("/", migrateCommunity);

export default app;
