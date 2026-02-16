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

export default app;
