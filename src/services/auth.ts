import { UserDAL } from "../dal/user.js";
import { JWTService } from "../utils/jwt.js";
import { CryptoService } from "../utils/crypto.js";
import { User } from "../types/user.js";
import {
  AuthResponse,
  AuthResponseWithRefresh,
  UserResponse,
} from "../schemas/auth.js";
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
} from "../errors/base.js";

export class AuthService {
  constructor(
    private userDAL: UserDAL,
    private jwtService: JWTService,
    private cryptoService: CryptoService
  ) {}

  async register(
    email: string,
    password: string
  ): Promise<AuthResponseWithRefresh> {
    // Hash password
    const passwordHash = await this.cryptoService.hashPassword(password);

    // Create user
    const user = await this.userDAL.createUser({
      email,
      password_hash: passwordHash,
    });

    // Generate tokens
    const tokenPayload = { userId: user.id, email: user.email };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.generateAccessToken(tokenPayload),
      this.jwtService.generateRefreshToken(tokenPayload),
    ]);

    // Store refresh token
    const refreshTokenHash = this.cryptoService.hashToken(refreshToken);
    await this.userDAL.createRefreshToken({
      user_id: user.id,
      token_hash: refreshTokenHash,
      expires_at: this.jwtService.getRefreshTokenExpiration(),
    });

    return {
      user: this.mapUserToResponse(user),
      accessToken,
      refreshToken,
    };
  }

  async login(
    email: string,
    password: string
  ): Promise<AuthResponseWithRefresh> {
    // Find user
    const user = await this.userDAL.findUserByEmail(email);
    if (!user) {
      throw new AuthenticationError("Invalid email or password");
    }

    // Verify password
    const isValidPassword = await this.cryptoService.verifyPassword(
      password,
      user.password_hash
    );
    if (!isValidPassword) {
      throw new AuthenticationError("Invalid email or password");
    }

    // Clean up old refresh tokens for this user
    await this.userDAL.deleteUserRefreshTokens(user.id);

    // Generate tokens
    const tokenPayload = { userId: user.id, email: user.email };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.generateAccessToken(tokenPayload),
      this.jwtService.generateRefreshToken(tokenPayload),
    ]);

    // Store refresh token
    const refreshTokenHash = this.cryptoService.hashToken(refreshToken);
    await this.userDAL.createRefreshToken({
      user_id: user.id,
      token_hash: refreshTokenHash,
      expires_at: this.jwtService.getRefreshTokenExpiration(),
    });

    return {
      user: this.mapUserToResponse(user),
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string): Promise<AuthResponseWithRefresh> {
    // Verify refresh token
    const payload = await this.jwtService.verifyRefreshToken(refreshToken);

    // Check if token exists in database
    const refreshTokenHash = this.cryptoService.hashToken(refreshToken);
    const storedToken = await this.userDAL.findRefreshToken(refreshTokenHash);
    if (!storedToken) {
      throw new AuthenticationError("Invalid refresh token");
    }

    // Get user
    const user = await this.userDAL.findUserById(payload.userId);
    if (!user) {
      throw new AuthenticationError("User not found");
    }

    // Delete old refresh token
    await this.userDAL.deleteRefreshToken(refreshTokenHash);

    // Generate new tokens
    const tokenPayload = { userId: user.id, email: user.email };
    const [newAccessToken, newRefreshToken] = await Promise.all([
      this.jwtService.generateAccessToken(tokenPayload),
      this.jwtService.generateRefreshToken(tokenPayload),
    ]);

    // Store new refresh token
    const newRefreshTokenHash = this.cryptoService.hashToken(newRefreshToken);
    await this.userDAL.createRefreshToken({
      user_id: user.id,
      token_hash: newRefreshTokenHash,
      expires_at: this.jwtService.getRefreshTokenExpiration(),
    });

    return {
      user: this.mapUserToResponse(user),
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async getCurrentUser(userId: string): Promise<UserResponse> {
    const user = await this.userDAL.findUserById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return this.mapUserToResponse(user);
  }

  private mapUserToResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }
}
