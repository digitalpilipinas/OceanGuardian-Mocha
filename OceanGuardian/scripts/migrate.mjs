import { createClient } from "@libsql/client/web";
import { readFileSync } from "fs";
import { resolve } from "path";

const client = createClient({
    url: "libsql://oceanguardian-mocha-digitalpilipinas.aws-ap-northeast-1.turso.io",
    authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzEyMDcwNzQsImlkIjoiZmEwZjVhOWMtZGZhZS00ZWY0LWE3YjYtMDY2ZTYyNWY1YzlhIiwicmlkIjoiNGY4NWZkOWQtMDQ5Yy00ZmE1LThhMTAtZjAwNDcyMDE4MzUyIn0.Ffp90x6ID5xscE3UWYq8bV0uIXyw_sW27vqOeU07vamw223X7pawASnLevh12fhcoCwtlJPWlnKcy5sMuKCIDw",
});

const schemaPath = resolve(import.meta.dirname, "../migrations/turso-schema.sql");
const schema = readFileSync(schemaPath, "utf-8");

console.log("Running schema migration...\n");

try {
    // Use batch to execute the full SQL file
    const result = await client.executeMultiple(schema);
    console.log("✓ Schema migration completed successfully!");
} catch (err) {
    console.error("Migration error:", err.message);

    // If executeMultiple fails, try individual statements
    // Parse carefully: split on semicolons that are at the end of a logical statement
    console.log("\nRetrying with individual statements...\n");

    // Build statements by tracking parentheses depth
    const statements = [];
    let current = "";
    let parenDepth = 0;

    for (const line of schema.split("\n")) {
        const trimmed = line.trim();
        if (trimmed.startsWith("--") || trimmed === "") {
            continue;
        }

        current += line + "\n";

        for (const char of line) {
            if (char === "(") parenDepth++;
            if (char === ")") parenDepth--;
        }

        if (trimmed.endsWith(";") && parenDepth === 0) {
            statements.push(current.trim());
            current = "";
        }
    }

    if (current.trim()) {
        statements.push(current.trim());
    }

    console.log(`Found ${statements.length} statements\n`);

    for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        try {
            await client.execute(stmt);
            const preview = stmt.split("\n")[0].substring(0, 70);
            console.log(`✓ [${i + 1}/${statements.length}] ${preview}`);
        } catch (err2) {
            const preview = stmt.split("\n")[0].substring(0, 70);
            console.error(`✗ [${i + 1}/${statements.length}] ${preview}`);
            console.error(`  Error: ${err2.message}`);
        }
    }
}

// Verify tables exist
console.log("\nVerifying tables...");
const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
console.log("Tables:", tables.rows.map(r => r.name).join(", "));

const indexes = await client.execute("SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%' ORDER BY name");
console.log("Indexes:", indexes.rows.map(r => r.name).join(", "));

process.exit(0);
