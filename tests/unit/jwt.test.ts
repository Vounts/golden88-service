import { describe, it, expect } from "vitest";
import { JWTService } from "../../src/utils/jwt.js";
import { AuthenticationError } from "../../src/errors/base.js";

describe("JWTService", () => {
  const jwtService = new JWTService();
  const testPayload = {
    userId: "test-user-id",
    email: "test@example.com",
  };

  describe("generateAccessToken", () => {
    it("should generate a valid access token", async () => {
      const token = await jwtService.generateAccessToken(testPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe("generateRefreshToken", () => {
    it("should generate a valid refresh token", async () => {
      const token = await jwtService.generateRefreshToken(testPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe("verifyAccessToken", () => {
    it("should verify a valid access token", async () => {
      const token = await jwtService.generateAccessToken(testPayload);
      const payload = await jwtService.verifyAccessToken(token);

      expect(payload.userId).toBe(testPayload.userId);
      expect(payload.email).toBe(testPayload.email);
      expect(payload.iat).toBeDefined(); // Issued at
      expect(payload.exp).toBeDefined(); // Expires at
    });

    it("should reject an invalid token", async () => {
      const invalidToken = "invalid.jwt.token";

      await expect(jwtService.verifyAccessToken(invalidToken)).rejects.toThrow(
        AuthenticationError
      );
    });

    it("should reject a refresh token as access token", async () => {
      const refreshToken = await jwtService.generateRefreshToken(testPayload);

      await expect(jwtService.verifyAccessToken(refreshToken)).rejects.toThrow(
        AuthenticationError
      );
    });
  });

  describe("verifyRefreshToken", () => {
    it("should verify a valid refresh token", async () => {
      const token = await jwtService.generateRefreshToken(testPayload);
      const payload = await jwtService.verifyRefreshToken(token);

      expect(payload.userId).toBe(testPayload.userId);
      expect(payload.email).toBe(testPayload.email);
      expect(payload.iat).toBeDefined(); // Issued at
      expect(payload.exp).toBeDefined(); // Expires at
    });

    it("should reject an invalid token", async () => {
      const invalidToken = "invalid.jwt.token";

      await expect(jwtService.verifyRefreshToken(invalidToken)).rejects.toThrow(
        AuthenticationError
      );
    });

    it("should reject an access token as refresh token", async () => {
      const accessToken = await jwtService.generateAccessToken(testPayload);

      await expect(jwtService.verifyRefreshToken(accessToken)).rejects.toThrow(
        AuthenticationError
      );
    });
  });

  describe("getRefreshTokenExpiration", () => {
    it("should return a future date", () => {
      const expiration = jwtService.getRefreshTokenExpiration();
      const now = new Date();

      expect(expiration).toBeInstanceOf(Date);
      expect(expiration.getTime()).toBeGreaterThan(now.getTime());
    });
  });
});
