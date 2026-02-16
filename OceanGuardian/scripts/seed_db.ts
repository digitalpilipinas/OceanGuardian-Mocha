import { createClient } from "@libsql/client";
import * as fs from "fs";
import * as path from "path";

// Load environment variables via --env-file=.dev.vars
const dbUrl = process.env.TURSO_DATABASE_URL || "file:./local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

console.log(`Connecting to database at ${dbUrl}...`);

const client = createClient({
    url: dbUrl,
    authToken: authToken,
});

async function main() {
    const migrationsDir = path.join(process.cwd(), "migrations");

    // Order matters!
    const seedFiles = [
        "turso-schema.sql",          // Main schema (users, sightings, badges)
        "missions.sql",              // Missions schema
        "learning.sql",              // Learning schema
        "community.sql",             // Community schema
        "leaderboards_and_social.sql", // Social schema
        "auth.sql",                  // Auth schema
        "seed_users.sql",
        "seed_missions.sql",
        "seed_sightings.sql",
        "seed_community.sql",
        "seed_gamification.sql",
        "seed_learning.sql",         // ensuring content exists
        "seed_learning_extended.sql" // user progress
    ];

    try {
        for (const file of seedFiles) {
            const filePath = path.join(migrationsDir, file);
            if (fs.existsSync(filePath)) {
                console.log(`Executing ${file}...`);
                const sql = fs.readFileSync(filePath, "utf-8");

                try {
                    await client.executeMultiple(sql);
                    console.log(`✅ ${file} executed successfully.`);
                } catch (e) {
                    console.error(`❌ Error executing ${file}:`, e);
                    // Don't exit, try next file or decide ?
                    // Usually if users fail, others might fail too due to FK.
                }
            } else {
                console.warn(`⚠️ File ${file} not found, skipping.`);
            }
        }
        console.log("🌱 Seeding completed!");
    } catch (error) {
        console.error("Fatal error during seeding:", error);
    } finally {
        client.close();
    }
}

main();
