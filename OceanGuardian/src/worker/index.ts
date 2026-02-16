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

app.route("/", auth);
app.route("/", sightings);
app.route("/", profiles);
app.route("/", gamification);
app.route("/", streak);
app.route("/", missions);
app.route("/", social);
app.route("/", leaderboard);
app.route("/", coral);
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
