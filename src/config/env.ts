import { z } from "zod";
import { config } from "dotenv";

// Load environment variables from .env file
config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z
    .string()
    .default("3000")
    .transform((val) => parseInt(val, 10)),
  HOST: z.string().default("0.0.0.0"),

  // Database
  DB_HOST: z.string().min(1, "DB_HOST is required"),
  DB_PORT: z
    .string()
    .default("5432")
    .transform((val) => parseInt(val, 10)),
  DB_NAME: z.string().min(1, "DB_NAME is required"),
  DB_USER: z.string().min(1, "DB_USER is required"),
  DB_PASSWORD: z.string().min(1, "DB_PASSWORD is required"),
  DB_POOL_MIN: z
    .string()
    .default("2")
    .transform((val) => parseInt(val, 10)),
  DB_POOL_MAX: z
    .string()
    .default("10")
    .transform((val) => parseInt(val, 10)),
  DB_SSL_REJECT_UNAUTHORIZED: z
    .string()
    .default("true")
    .transform((val) => val.toLowerCase() === "true"),
  DB_SSL_CA_CERT_PATH: z.string().optional(),
  DB_SSL_CA_CERT: z.string().optional(),

  // JWT
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  // Rate limiting
  RATE_LIMIT_MAX: z
    .string()
    .default("100")
    .transform((val) => parseInt(val, 10)),
  RATE_LIMIT_WINDOW: z.string().default("15m"),

  // CORS
  CORS_ORIGIN: z.string().default("*"),
});

export type Env = z.infer<typeof envSchema>;

let env: Env;

export function loadEnv(): Env {
  try {
    env = envSchema.parse(process.env);
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(
        (err: any) => `${err.path.join(".")}: ${err.message}`
      );
      throw new Error(
        `Environment validation failed:\n${errorMessages.join("\n")}`
      );
    }
    throw error;
  }
}

export function getEnv(): Env {
  if (!env) {
    throw new Error("Environment not loaded. Call loadEnv() first.");
  }
  return env;
}
