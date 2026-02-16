import { createClient } from "@libsql/client/web";
import { readFileSync } from "fs";
import { resolve } from "path";

const client = createClient({
    url: "libsql://oceanguardian-mocha-digitalpilipinas.aws-ap-northeast-1.turso.io",
    authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzEyMDcwNzQsImlkIjoiZmEwZjVhOWMtZGZhZS00ZWY0LWE3YjYtMDY2ZTYyNWY1YzlhIiwicmlkIjoiNGY4NWZkOWQtMDQ5Yy00ZmE1LThhMTAtZjAwNDcyMDE4MzUyIn0.Ffp90x6ID5xscE3UWYq8bV0uIXyw_sW27vqOeU07vamw223X7pawASnLevh12fhcoCwtlJPWlnKcy5sMuKCIDw",
});

const schemaPath = resolve(import.meta.dirname, "../migrations/auth.sql");
const schema = readFileSync(schemaPath, "utf-8");

console.log("Running auth migration...\n");

try {
    await client.executeMultiple(schema);
    console.log("✓ Auth migration completed successfully!");
} catch (err) {
    console.error("Migration error:", err.message);
    process.exit(1);
}

process.exit(0);
