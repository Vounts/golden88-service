import { FastifyRequest, FastifyReply } from "fastify";
import { testConnection } from "../config/database.js";
import { sendSuccess, sendError } from "../utils/response.js";

export class HealthController {
  async checkHealth(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const dbConnected = await testConnection();

      const healthData = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: dbConnected ? "connected" : "disconnected",
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      };

      sendSuccess(reply, 200, healthData);
    } catch (error) {
      request.log.error(error);
      sendError(reply, error as Error, request.log);
    }
  }
}
