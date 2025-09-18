import { readFileSync } from "fs";
import { join } from "path";
import { loadEnv } from "../src/config/env.js";
import { createPool, closePool } from "../src/config/database.js";

async function runMigration() {
  try {
    console.log("🚀 Starting database migration...");

    // Load environment
    loadEnv();

    // Create database connection
    const pool = createPool();

    // Read migration file
    const migrationPath = join(process.cwd(), "migrations", "001_init.sql");
    const migrationSQL = readFileSync(migrationPath, "utf8");

    console.log("📄 Running migration: 001_init.sql");

    // Execute migration
    await pool.query(migrationSQL);

    console.log("✅ Migration completed successfully!");

    // Close connection
    await closePool();
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigration();
