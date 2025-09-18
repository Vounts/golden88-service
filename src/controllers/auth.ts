import { FastifyRequest, FastifyReply } from "fastify";
import { AuthService } from "../services/auth.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { CookieService } from "../utils/cookies.js";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  RegisterRequest,
  LoginRequest,
  RefreshTokenRequest,
} from "../schemas/auth.js";
import { ValidationError } from "../errors/base.js";

export class AuthController {
  private cookieService = new CookieService();

  constructor(private authService: AuthService) {}

  async register(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      // Validate request body
      const validationResult = registerSchema.safeParse(request.body);
      if (!validationResult.success) {
        throw new ValidationError(
          "Invalid request data",
          validationResult.error.issues
        );
      }

      const { email, password } = validationResult.data;
      const result = await this.authService.register(email, password);

      // Store refresh token in HTTP-only cookie
      this.cookieService.setRefreshTokenCookie(reply, result.refreshToken);

      // Send response without refresh token
      sendSuccess(reply, 201, {
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (error) {
      request.log.error(error);
      sendError(reply, error as Error, request.log);
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      // Validate request body
      const validationResult = loginSchema.safeParse(request.body);
      if (!validationResult.success) {
        throw new ValidationError(
          "Invalid request data",
          validationResult.error.issues
        );
      }

      const { email, password } = validationResult.data;
      const result = await this.authService.login(email, password);

      // Store refresh token in HTTP-only cookie
      this.cookieService.setRefreshTokenCookie(reply, result.refreshToken);

      // Send response without refresh token
      sendSuccess(reply, 200, {
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (error) {
      request.log.error(error);
      sendError(reply, error as Error, request.log);
    }
  }

  async refresh(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      // Get refresh token from HTTP-only cookie
      const refreshToken =
        this.cookieService.getRefreshTokenFromCookie(request);
      if (!refreshToken) {
        throw new ValidationError("Refresh token not found in cookies");
      }

      const result = await this.authService.refresh(refreshToken);

      // Store new refresh token in HTTP-only cookie
      this.cookieService.setRefreshTokenCookie(reply, result.refreshToken);

      // Send response with only access token
      sendSuccess(reply, 200, {
        accessToken: result.accessToken,
      });
    } catch (error) {
      request.log.error(error);
      sendError(reply, error as Error, request.log);
    }
  }

  async me(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      // User ID is set by the auth middleware
      const userId = (request as any).userId;
      if (!userId) {
        throw new ValidationError("User ID not found in request");
      }

      const result = await this.authService.getCurrentUser(userId);

      sendSuccess(reply, 200, result);
    } catch (error) {
      request.log.error(error);
      sendError(reply, error as Error, request.log);
    }
  }

  async logout(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      // Get refresh token from cookie to invalidate it in database
      const refreshToken =
        this.cookieService.getRefreshTokenFromCookie(request);

      if (refreshToken) {
        // TODO: Add method to auth service to invalidate refresh token
        // await this.authService.logout(refreshToken);
      }

      // Clear the refresh token cookie
      this.cookieService.clearRefreshTokenCookie(reply);

      sendSuccess(reply, 200, { message: "Logged out successfully" });
    } catch (error) {
      request.log.error(error);
      sendError(reply, error as Error, request.log);
    }
  }
}
