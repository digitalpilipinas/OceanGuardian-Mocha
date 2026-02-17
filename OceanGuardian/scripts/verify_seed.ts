import { createClient } from "@libsql/client";

const dbUrl = process.env.TURSO_DATABASE_URL || "file:./local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({
    url: dbUrl,
    authToken: authToken,
});

async function main() {
    try {
        console.log("📊 Verifying Seed Data...");

        const tables = [
            "user_profiles",
            "sightings",
            "missions",
            "mission_participants",
            "badges",
            "user_badges",
            "sighting_comments",
            "sighting_validations",
            "user_follows",
            "notifications",
            "quiz_questions",
            "lessons"
        ];

        for (const table of tables) {
            try {
                const result = await client.execute(`SELECT COUNT(*) as count FROM ${table}`);
                console.log(`- ${table}: ${result.rows[0].count} rows`);
            } catch {
                console.log(`- ${table}: ❌ Error (Table might not exist)`);
            }
        }

        // Specific checks for failures
        console.log("\n🔍 Integrity Checks:");

        // Check for Users
        const users = await client.execute("SELECT id FROM user_profiles");
        const userIds = users.rows.map(r => r.id);
        console.log(`- Found ${userIds.length} users: ${userIds.join(", ")}`);

        // Check for Sightings
        const sightings = await client.execute("SELECT id FROM sightings");
        const sightingIds = sightings.rows.map(r => r.id);
        console.log(`- Found ${sightingIds.length} sightings`);

        if (userIds.length === 0) console.warn("⚠️ No users found! This explains FK errors.");
        if (sightingIds.length === 0) console.warn("⚠️ No sightings found! This explains FK errors.");

    } catch (error) {
        console.error("Fatal error during verification:", error);
    } finally {
        client.close();
    }
}

main();
