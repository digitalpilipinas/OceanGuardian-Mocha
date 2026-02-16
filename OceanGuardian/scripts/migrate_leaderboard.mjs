import { createClient } from "@libsql/client/web";
import { readFileSync } from "fs";
import { resolve } from "path";

const client = createClient({
    url: "libsql://oceanguardian-mocha-digitalpilipinas.aws-ap-northeast-1.turso.io",
    authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzEyMDcwNzQsImlkIjoiZmEwZjVhOWMtZGZhZS00ZWY0LWE3YjYtMDY2ZTYyNWY1YzlhIiwicmlkIjoiNGY4NWZkOWQtMDQ5Yy00ZmE1LThhMTAtZjAwNDcyMDE4MzUyIn0.Ffp90x6ID5xscE3UWYq8bV0uIXyw_sW27vqOeU07vamw223X7pawASnLevh12fhcoCwtlJPWlnKcy5sMuKCIDw",
});

const schemaPath = resolve(import.meta.dirname, "../migrations/leaderboards_and_social.sql");
const schema = readFileSync(schemaPath, "utf-8");

console.log("Running leaderboard migration...\n");

try {
    // Split into individual statements because executeMultiple might fail if some statements are complex
    // or if we want better error reporting.
    // Simple split by semicolon for now, assuming no semicolons in strings/comments for this simple migration file.

    const statements = schema
        .split(";")
        .map(s => s.trim())
        .filter(s => s.length > 0);

    for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        try {
            await client.execute(stmt);
            console.log("✓ Success");
        } catch (err) {
            console.error("✗ Error:", err.message);
            // specific error handling if needed, e.g. "duplicate column" can be ignored if idempotent
            if (err.message.includes("duplicate column name")) {
                console.log("  (Ignoring duplicate column error)");
            } else {
                // Rethrow or stop if critical? For now, log and continue/stop?
                // We should probably stop on error unless it's "table already exists" or "column already exists"
            }
        }
    }

    console.log("\nMigration finished.");

} catch (err) {
    console.error("Migration fatal error:", err);
}
