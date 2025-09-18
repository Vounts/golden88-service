import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import cookie from "@fastify/cookie";
import { getEnv } from "./config/env.js";
import { getPool } from "./config/database.js";
import { UserDAL } from "./dal/user.js";
import { AuthService } from "./services/auth.js";
import { JWTService } from "./utils/jwt.js";
import { CryptoService } from "./utils/crypto.js";
import { AuthController } from "./controllers/auth.js";
import { HealthController } from "./controllers/health.js";
import { authRoutes } from "./routes/auth.js";
import { healthRoutes } from "./routes/health.js";

export async function createApp(): Promise<FastifyInstance> {
  const env = getEnv();

  const fastify = Fastify({
    logger:
      env.NODE_ENV === "development"
        ? {
            level: "debug",
            transport: {
              target: "pino-pretty",
              options: {
                colorize: true,
              },
            },
          }
        : {
            level: env.NODE_ENV === "production" ? "info" : "debug",
          },
  });

  // Register plugins
  await fastify.register(cookie);

  await fastify.register(cors, {
    origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN.split(","),
    credentials: true,
  });

  await fastify.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW,
    errorResponseBuilder: (request, context) => {
      return {
        ok: false,
        status: 429,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: `Rate limit exceeded, retry in ${context.ttl} seconds`,
        },
      };
    },
  });

  // Initialize dependencies
  const pool = getPool();
  const userDAL = new UserDAL(pool);
  const jwtService = new JWTService();
  const cryptoService = new CryptoService();
  const authService = new AuthService(userDAL, jwtService, cryptoService);

  // Initialize controllers
  const authController = new AuthController(authService);
  const healthController = new HealthController();

  // Register routes
  await fastify.register(
    async function (fastify) {
      await authRoutes(fastify, authController, jwtService);
    },
    { prefix: "/auth" }
  );

  await healthRoutes(fastify, healthController);

  // Global error handler
  fastify.setErrorHandler(async (error, request, reply) => {
    request.log.error(error);

    const response = {
      ok: false,
      status: error.statusCode || 500,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "An unexpected error occurred",
      },
    };

    reply.status(response.status).send(response);
  });

  // 404 handler
  fastify.setNotFoundHandler(async (request, reply) => {
    const response = {
      ok: false,
      status: 404,
      error: {
        code: "NOT_FOUND",
        message: "Route not found",
      },
    };

    reply.status(404).send(response);
  });

  return fastify;
}
