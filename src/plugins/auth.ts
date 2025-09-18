import { FastifyRequest, FastifyReply } from "fastify";
import { JWTService } from "../utils/jwt.js";
import { AuthenticationError } from "../errors/base.js";
import { sendError } from "../utils/response.js";

export function createAuthMiddleware(jwtService: JWTService) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization;

      if (!authHeader) {
        throw new AuthenticationError("Authorization header is required");
      }

      const parts = authHeader.split(" ");
      if (parts.length !== 2 || parts[0] !== "Bearer") {
        throw new AuthenticationError("Invalid authorization header format");
      }

      const token = parts[1];

      // Assert token exists and is not empty
      if (!token || token.trim() === "") {
        throw new AuthenticationError("Access token is required");
      }

      const payload = await jwtService.verifyAccessToken(token);

      // Attach user info to request
      (request as any).userId = payload.userId;
      (request as any).userEmail = payload.email;
    } catch (error) {
      request.log.error(error);
      sendError(reply, error as Error, request.log);
      return;
    }
  };
}
