import { Hono } from "hono";
import { authMiddleware } from "@getmocha/users-service/backend";
import { getTursoClient } from "../db";

const app = new Hono<{ Bindings: Env }>();

const scientistMiddleware = async (c: any, next: any) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const db = getTursoClient(c.env);
    const profile = await db.execute({
        sql: "SELECT role FROM user_profiles WHERE id = ?",
        args: [user.id],
    });

    const role = String(profile.rows[0]?.role || "player");
    if (role !== "scientist" && role !== "admin") {
        return c.json({ error: "Access denied: Scientists/Admins only" }, 403);
    }
    await next();
};

app.use("/api/scientist/*", authMiddleware, scientistMiddleware);

// Export Data
app.get("/api/scientist/export", async (c) => {
    const format = c.req.query("format") || "csv";
    const type = c.req.query("type"); // optional filter
    const days = parseInt(c.req.query("days") || "30");

    const db = getTursoClient(c.env);

    let sql = `SELECT s.*, up.username 
               FROM sightings s
               LEFT JOIN user_profiles up ON s.user_id = up.id
               WHERE s.created_at > datetime('now', '-' || ? || ' days')`;
    const args: any[] = [days];

    if (type && type !== "all") {
        sql += " AND s.type = ?";
        args.push(type);
    }

    const result = await db.execute({ sql, args });
    const rows = result.rows;

    if (format === "geojson") {
        const features = rows.map((row: any) => ({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [row.longitude, row.latitude]
            },
            properties: {
                id: row.id,
                type: row.type,
                subcategory: row.subcategory,
                description: row.description,
                severity: row.severity,
                date: row.created_at,
                user: row.username,
                image_url: row.image_key ? `/api/sightings/${row.id}/photo` : null
            }
        }));

        return c.json({
            type: "FeatureCollection",
            features
        });
    }

    // CSV Format
    // We'll construct CSV manually or use library. Manual is fine for this size.
    const headers = ["id", "type", "subcategory", "latitude", "longitude", "severity", "date", "username", "description"];
    const csvRows = rows.map((row: any) => [
        row.id,
        row.type,
        row.subcategory,
        row.latitude,
        row.longitude,
        row.severity,
        row.created_at,
        row.username,
        `"${(row.description || "").replace(/"/g, '""')}"` // Escape quotes
    ]);

    const csvContent = [
        headers.join(","),
        ...csvRows.map(r => r.join(","))
    ].join("\n");

    return c.text(csvContent, 200, {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="ocean-data-export.csv"`
    });
});

export default app;
