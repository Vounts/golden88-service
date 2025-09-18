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
  config.host = env.DB_HOST;
  config.port = env.DB_PORT;
  config.database = env.DB_NAME;
  config.user = env.DB_USER;
  config.password = env.DB_PASSWORD;

  config.ssl = {
    rejectUnauthorized: true,
    ca: `-----BEGIN CERTIFICATE-----
MIIEUDCCArigAwIBAgIUPt4A86JC5xLRo/HLYEvUBqtbr58wDQYJKoZIhvcNAQEM
BQAwQDE+MDwGA1UEAww1M2FjYzEyNzQtNjQxZS00ZmY2LWI2ZTktMDA5OWY1NDc1
ZjRiIEdFTiAxIFByb2plY3QgQ0EwHhcNMjUwOTE3MTYwMzI0WhcNMzUwOTE1MTYw
MzI0WjBAMT4wPAYDVQQDDDUzYWNjMTI3NC02NDFlLTRmZjYtYjZlOS0wMDk5ZjU0
NzVmNGIgR0VOIDEgUHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCC
AYoCggGBAK0DUOLD1AqQJRosdfvDb39ds/Gj5xsNBmZKlhUMEy5eSD6uCHg+bDoK
D0C4toNd2gbJqd3UE6ez80LvyBUI1N/bmL8kWPNoBovFAuQH75J/rViiYv0BYvBX
vM365jFRfp1KXDOtviK4p+7OECV7bhxILbMyKd14sKs70zPPANw8gX82aQpEXi3Y
tIsbxgrIze/Tt9jEa+y+sDb4yVZjCGP2kBqghiz8VWORxZfxGqfGq1Wms87B9K4T
Uyhqb4FXFacU4vjGkZqP4CDu3sLrB6jAsfko4oVPIjqvarOpmKk/bhB17z4sf5Q9
3CA1C1yfJXpoi8a8Ketgiy1Q6cQHblK2jsw3XdbBOTcZ55ZC6OB+dqXO0pyxFC+k
ly2L/1nGXGdbIn0Kmo3UJjtxGmb8O3gO06uyMOt0gvaQ5TXnbVTr0bF0ycgaxUA5
vm0eE0xLvbjAbaFG6QSRcOqD70iUJtQ9D8Jh685a7lnbUz2XuST0XZ4bcLLkAWtO
t+aHkrQoCQIDAQABo0IwQDAdBgNVHQ4EFgQUHryRYZalB4Vhtk3GPEJoXXqCQMkw
EgYDVR0TAQH/BAgwBgEB/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQAD
ggGBADTo8ahETC0sHJ/2tPaJ03fpphHMj/N8ZvsL7YNeSSvxcK6HKpugXsyVYkV0
nrFPPFLvERG50BBy3pjFWIo1LNafAJXl/gOi6hgt+lU+OoJ/UT1GdtZPlDNhvYPt
Z5BXUYLi81uP4XVL9SbStb2rjlPYpiXXyOaI/7nKxyd7HVBZHbqfDLSL4X5aISCg
da3zQiY3B7Jno69gwr6hh0eQnAeKHLFq+6lfvqdciRwdd20efDYdaEstgeQsipJk
/Sn2njoYafS5LJe5sYzPHKiEUfdGRA6kHAaIr0UdCn1wo9Kx/NOFHR3dWJ6glhuY
Jih/KA7oz+8X2fi5HtStm0vV4w0LtvTYwre4rZTaBJnV4t9/xixAc9/265Q8qY1O
AWh6p8t64wYKvlOIZZQAuzRvJ58NoODf2u8uxgpyqZB601WI5UJMks6eL3mUZLTz
PrJDwlKKb9BwjE2T7TYv7iCMeZugiedTL3nhIxk1r19vvqpyih39nUy/cIwmKcw9
ixcilw==
-----END CERTIFICATE-----`,
  };

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
