import { SignJWT, jwtVerify, JWTPayload } from "jose";
import { getEnv } from "../config/env.js";
import { AuthenticationError } from "../errors/base.js";

export interface JWTUserPayload extends JWTPayload {
  userId: string;
  email: string;
}

export class JWTService {
  private accessSecret: Uint8Array;
  private refreshSecret: Uint8Array;
  private accessExpiresIn: string;
  private refreshExpiresIn: string;

  constructor() {
    const env = getEnv();
    this.accessSecret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
    this.refreshSecret = new TextEncoder().encode(env.JWT_REFRESH_SECRET);
    this.accessExpiresIn = env.JWT_ACCESS_EXPIRES_IN;
    this.refreshExpiresIn = env.JWT_REFRESH_EXPIRES_IN;
  }

  async generateAccessToken(
    payload: Omit<JWTUserPayload, "iat" | "exp">
  ): Promise<string> {
    return new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(this.accessExpiresIn)
      .sign(this.accessSecret);
  }

  async generateRefreshToken(
    payload: Omit<JWTUserPayload, "iat" | "exp">
  ): Promise<string> {
    return new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(this.refreshExpiresIn)
      .sign(this.refreshSecret);
  }

  async verifyAccessToken(token: string): Promise<JWTUserPayload> {
    try {
      const { payload } = await jwtVerify(token, this.accessSecret);
      return payload as JWTUserPayload;
    } catch (error) {
      throw new AuthenticationError("Invalid or expired access token");
    }
  }

  async verifyRefreshToken(token: string): Promise<JWTUserPayload> {
    try {
      const { payload } = await jwtVerify(token, this.refreshSecret);
      return payload as JWTUserPayload;
    } catch (error) {
      throw new AuthenticationError("Invalid or expired refresh token");
    }
  }

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

  getRefreshTokenExpiration(): Date {
    const expirationMs = this.parseTimeToMs(this.refreshExpiresIn);
    return new Date(Date.now() + expirationMs);
  }
}
