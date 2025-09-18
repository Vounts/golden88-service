import { FastifyInstance } from "fastify";
import { HealthController } from "../controllers/health.js";

export async function healthRoutes(
  fastify: FastifyInstance,
  healthController: HealthController
): Promise<void> {
  fastify.get("/health", {
    handler: healthController.checkHealth.bind(healthController),
  });
}
