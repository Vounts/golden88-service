import { FastifyInstance } from "fastify";
import { AuthController } from "../controllers/auth.js";
import { createAuthMiddleware } from "../plugins/auth.js";
import { JWTService } from "../utils/jwt.js";

export async function authRoutes(
  fastify: FastifyInstance,
  authController: AuthController,
  jwtService: JWTService
): Promise<void> {
  const authMiddleware = createAuthMiddleware(jwtService);

  // Public routes
  fastify.post("/register", {
    handler: authController.register.bind(authController),
  });

  fastify.post("/login", {
    handler: authController.login.bind(authController),
  });

  fastify.post("/refresh", {
    handler: authController.refresh.bind(authController),
  });

  // Protected routes
  fastify.get("/me", {
    preHandler: authMiddleware,
    handler: authController.me.bind(authController),
  });

  fastify.post("/logout", {
    handler: authController.logout.bind(authController),
  });
}
