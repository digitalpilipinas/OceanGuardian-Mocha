import { Hono } from "hono";
import auth from "./routes/auth";
import sightings from "./routes/sightings";

const app = new Hono<{ Bindings: Env }>();

app.route("/", auth);
app.route("/", sightings);

export default app;
