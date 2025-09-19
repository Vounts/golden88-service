import { Pool, PoolConfig } from "pg";
import { readFileSync } from "fs";
import { getEnv } from "./env.js";
import { DatabaseError } from "../errors/base.js";

let pool: Pool | null = null;

export function createPool(): Pool {
  const env = getEnv();

  // Build config object
  const config: PoolConfig = {
    min: env.DB_POOL_MIN,
    max: env.DB_POOL_MAX,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };

  // Use individual connection parameters from environment
  config.host = env.

  pool = new Pool(config);

  // Handle pool errors
  pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
    process.exit(-1);
  });

  return pool;
}

export function getPool(): Pool {
  if (!pool) {
    throw new Error("Database pool not initialized. Call createPool() first.");
  }
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    const client = await getPool().connect();
    const result = await client.query("SELECT NOW()");
    client.release();
    return !!result.rows[0];
  } catch (error) {
    throw new DatabaseError("Database connection test failed", error);
  }
}
