import { loadEnv } from "../src/config/env.js";

// Load test environment variables
process.env.NODE_ENV = "test";
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  "postgresql://test:test@localhost:5432/auth_test";
process.env.JWT_ACCESS_SECRET =
  "test-access-secret-at-least-32-characters-long";
process.env.JWT_REFRESH_SECRET =
  "test-refresh-secret-at-least-32-characters-long";

// Load environment configuration
loadEnv();
