import { FastifyReply, FastifyRequest } from "fastify";
import { getEnv } from "../config/env.js";

interface CookieConfig {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "strict" | "lax" | "none";
  path: string;
  maxAge?: number;
}

export class CookieService {
  private env = getEnv();

  /**
   * Base cookie configuration
   */
  private getBaseCookieConfig(): Omit<CookieConfig, "maxAge"> {
    return {
      httpOnly: true, // Prevents XSS attacks
      secure: this.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "strict", // CSRF protection
      path: "/", // Available on all paths
    };
  }

  /**
   * Refresh token specific cookie configuration
   */
  private getRefreshTokenCookieConfig(): CookieConfig {
    const maxAge = this.parseTimeToMs(this.env.JWT_REFRESH_EXPIRES_IN);
    return {
      ...this.getBaseCookieConfig(),
      maxAge: maxAge / 1000, // Convert to seconds
    };
  }

  /**
   * Set HTTP-only refresh token cookie
   */
  setRefreshTokenCookie(reply: FastifyReply, refreshToken: string): void {
    const config = this.getRefreshTokenCookieConfig();
    reply.setCookie("refreshToken", refreshToken, config);
  }

  /**
   * Get refresh token from cookie
   */
  getRefreshTokenFromCookie(request: FastifyRequest): string | undefined {
    return request.cookies.refreshToken;
  }

  /**
   * Clear refresh token cookie (for logout)
   */
  clearRefreshTokenCookie(reply: FastifyReply): void {
    const config = this.getBaseCookieConfig();
    reply.clearCookie("refreshToken", config);
  }

  /**
   * Set a generic secure cookie (for future use)
   */
  setSecureCookie(
    reply: FastifyReply,
    name: string,
    value: string,
    customConfig?: Partial<CookieConfig>
  ): void {
    const config = {
      ...this.getBaseCookieConfig(),
      ...customConfig,
    };
    reply.setCookie(name, value, config);
  }

  /**
   * Clear a generic cookie (for future use)
   */
  clearCookie(reply: FastifyReply, name: string): void {
    const config = this.getBaseCookieConfig();
    reply.clearCookie(name, config);
  }

  /**
   * Parse time string to milliseconds
   */
  private parseTimeToMs(time: string): number {
    const unit = time.slice(-1);
    const value = parseInt(time.slice(0, -1), 10);

    switch (unit) {
      case "s":
        return value * 1000;
      case "m":
        return value * 60 * 1000;
      case "h":
        return value * 60 * 60 * 1000;
      case "d":
        return value * 24 * 60 * 60 * 1000;
      default:
        throw new Error(`Invalid time format: ${time}`);
    }
  }
}
