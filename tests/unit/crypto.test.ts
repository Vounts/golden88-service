import { describe, it, expect } from "vitest";
import { CryptoService } from "../../src/utils/crypto.js";

describe("CryptoService", () => {
  const cryptoService = new CryptoService();

  describe("hashPassword", () => {
    it("should hash a password", async () => {
      const password = "testpassword123";
      const hash = await cryptoService.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50); // Argon2 hashes are long
      expect(hash).toMatch(/^\$argon2id\$/); // Argon2id format
    });

    it("should generate different hashes for the same password", async () => {
      const password = "testpassword123";
      const hash1 = await cryptoService.hashPassword(password);
      const hash2 = await cryptoService.hashPassword(password);

      expect(hash1).not.toBe(hash2); // Different salts
    });
  });

  describe("verifyPassword", () => {
    it("should verify correct password", async () => {
      const password = "testpassword123";
      const hash = await cryptoService.hashPassword(password);
      const isValid = await cryptoService.verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const password = "testpassword123";
      const wrongPassword = "wrongpassword";
      const hash = await cryptoService.hashPassword(password);
      const isValid = await cryptoService.verifyPassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });

    it("should return false for invalid hash", async () => {
      const password = "testpassword123";
      const invalidHash = "invalid-hash";
      const isValid = await cryptoService.verifyPassword(password, invalidHash);

      expect(isValid).toBe(false);
    });
  });

  describe("hashToken", () => {
    it("should hash a token", () => {
      const token = "some-jwt-token";
      const hash = cryptoService.hashToken(token);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(token);
      expect(hash.length).toBe(64); // SHA256 hex length
      expect(hash).toMatch(/^[a-f0-9]{64}$/); // Hex format
    });

    it("should generate consistent hashes for the same token", () => {
      const token = "some-jwt-token";
      const hash1 = cryptoService.hashToken(token);
      const hash2 = cryptoService.hashToken(token);

      expect(hash1).toBe(hash2); // Same input = same output
    });
  });

  describe("generateSecureToken", () => {
    it("should generate a secure token", () => {
      const token = cryptoService.generateSecureToken();

      expect(token).toBeDefined();
      expect(token.length).toBe(64); // SHA256 hex length
      expect(token).toMatch(/^[a-f0-9]{64}$/); // Hex format
    });

    it("should generate different tokens each time", () => {
      const token1 = cryptoService.generateSecureToken();
      const token2 = cryptoService.generateSecureToken();

      expect(token1).not.toBe(token2); // Should be unique
    });
  });
});
