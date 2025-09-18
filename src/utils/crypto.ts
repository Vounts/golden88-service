import * as argon2 from "argon2";
import { createHash } from "crypto";

export class CryptoService {
  async hashPassword(password: string): Promise<string> {
    try {
      return await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16, // 64 MB
        timeCost: 3,
        parallelism: 1,
      });
    } catch (error) {
      throw new Error("Failed to hash password");
    }
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch (error) {
      return false;
    }
  }

  hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  generateSecureToken(): string {
    return createHash("sha256")
      .update(Math.random().toString())
      .update(Date.now().toString())
      .digest("hex");
  }
}
