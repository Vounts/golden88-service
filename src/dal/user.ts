import { Pool } from "pg";
import {
  User,
  CreateUserData,
  RefreshToken,
  CreateRefreshTokenData,
} from "../types/user.js";
import { DatabaseError, NotFoundError, ConflictError } from "../errors/base.js";

export class UserDAL {
  constructor(private pool: Pool) {}

  async createUser(userData: CreateUserData): Promise<User> {
    const query = `
      INSERT INTO users (email, password_hash)
      VALUES ($1, $2)
      RETURNING id, email, password_hash, created_at, updated_at
    `;

    try {
      const result = await this.pool.query(query, [
        userData.email,
        userData.password_hash,
      ]);
      return result.rows[0] as User;
    } catch (error: any) {
      if (error.code === "23505") {
        // Unique violation
        throw new ConflictError("User with this email already exists");
      }
      throw new DatabaseError("Failed to create user", error);
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, email, password_hash, created_at, updated_at
      FROM users
      WHERE email = $1
    `;

    try {
      const result = await this.pool.query(query, [email]);
      return (result.rows[0] as User) || null;
    } catch (error) {
      throw new DatabaseError("Failed to find user by email", error);
    }
  }

  async findUserById(id: string): Promise<User | null> {
    const query = `
      SELECT id, email, password_hash, created_at, updated_at
      FROM users
      WHERE id = $1
    `;

    try {
      const result = await this.pool.query(query, [id]);
      return (result.rows[0] as User) || null;
    } catch (error) {
      throw new DatabaseError("Failed to find user by ID", error);
    }
  }

  async createRefreshToken(
    tokenData: CreateRefreshTokenData
  ): Promise<RefreshToken> {
    const query = `
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, token_hash, expires_at, created_at
    `;

    try {
      const result = await this.pool.query(query, [
        tokenData.user_id,
        tokenData.token_hash,
        tokenData.expires_at,
      ]);
      return result.rows[0] as RefreshToken;
    } catch (error) {
      throw new DatabaseError("Failed to create refresh token", error);
    }
  }

  async findRefreshToken(tokenHash: string): Promise<RefreshToken | null> {
    const query = `
      SELECT id, user_id, token_hash, expires_at, created_at
      FROM refresh_tokens
      WHERE token_hash = $1 AND expires_at > NOW()
    `;

    try {
      const result = await this.pool.query(query, [tokenHash]);
      return (result.rows[0] as RefreshToken) || null;
    } catch (error) {
      throw new DatabaseError("Failed to find refresh token", error);
    }
  }

  async deleteRefreshToken(tokenHash: string): Promise<void> {
    const query = `
      DELETE FROM refresh_tokens
      WHERE token_hash = $1
    `;

    try {
      await this.pool.query(query, [tokenHash]);
    } catch (error) {
      throw new DatabaseError("Failed to delete refresh token", error);
    }
  }

  async deleteUserRefreshTokens(userId: string): Promise<void> {
    const query = `
      DELETE FROM refresh_tokens
      WHERE user_id = $1
    `;

    try {
      await this.pool.query(query, [userId]);
    } catch (error) {
      throw new DatabaseError("Failed to delete user refresh tokens", error);
    }
  }

  async cleanupExpiredTokens(): Promise<void> {
    const query = `
      DELETE FROM refresh_tokens
      WHERE expires_at <= NOW()
    `;

    try {
      await this.pool.query(query);
    } catch (error) {
      throw new DatabaseError("Failed to cleanup expired tokens", error);
    }
  }
}
