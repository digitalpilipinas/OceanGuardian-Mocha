import { Hono } from "hono";
import auth from "./routes/auth";
import sightings from "./routes/sightings";
import profiles from "./routes/profiles";
import gamification from "./routes/gamification";
import streak from "./routes/streak";

const app = new Hono<{ Bindings: Env }>();

app.route("/", auth);
app.route("/", sightings);
app.route("/", profiles);
app.route("/", gamification);
app.route("/", streak);

export default app;
