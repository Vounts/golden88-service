import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import {
  createTestApp,
  closeTestApp,
  createTestUser,
  registerTestUser,
  TestContext,
} from "../utils/test-helpers.js";

describe("Auth API Integration Tests", () => {
  let context: TestContext;

  beforeAll(async () => {
    context = await createTestApp();
  });

  afterAll(async () => {
    await closeTestApp(context);
  });

  describe("POST /auth/register", () => {
    it("should register a new user successfully", async () => {
      const user = createTestUser("register1");

      const response = await context.request
        .post("/auth/register")
        .send({
          email: user.email,
          password: user.password,
        })
        .expect(201);

      expect(response.body).toMatchObject({
        ok: true,
        status: 201,
        data: {
          user: {
            email: user.email,
            id: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          },
          accessToken: expect.any(String),
        },
      });

      // Should not expose refresh token in response
      expect(response.body.data.refreshToken).toBeUndefined();

      // Should set refresh token cookie
      const cookies = response.headers["set-cookie"] as unknown as string[];
      expect(cookies).toBeDefined();
      expect(
        cookies.some((cookie: string) => cookie.includes("refreshToken="))
      ).toBe(true);
      expect(
        cookies.some((cookie: string) => cookie.includes("HttpOnly"))
      ).toBe(true);
    });

    it("should reject invalid email format", async () => {
      await context.request
        .post("/auth/register")
        .send({
          email: "invalid-email",
          password: "validpassword123",
        })
        .expect(400);
    });

    it("should reject short password", async () => {
      await context.request
        .post("/auth/register")
        .send({
          email: "test@example.com",
          password: "123", // Too short
        })
        .expect(400);
    });

    it("should reject duplicate email", async () => {
      const user = createTestUser("duplicate");

      // Register first user
      await registerTestUser(context.request, user);

      // Try to register same email again
      await context.request
        .post("/auth/register")
        .send({
          email: user.email,
          password: user.password,
        })
        .expect(409); // Conflict
    });
  });

  describe("POST /auth/login", () => {
    it("should login existing user successfully", async () => {
      const user = createTestUser("login1");
      await registerTestUser(context.request, user);

      const response = await context.request
        .post("/auth/login")
        .send({
          email: user.email,
          password: user.password,
        })
        .expect(200);

      expect(response.body).toMatchObject({
        ok: true,
        status: 200,
        data: {
          user: {
            email: user.email,
            id: expect.any(String),
          },
          accessToken: expect.any(String),
        },
      });

      // Should not expose refresh token in response
      expect(response.body.data.refreshToken).toBeUndefined();

      // Should set refresh token cookie
      const cookies = response.headers["set-cookie"] as unknown as string[];
      expect(cookies).toBeDefined();
      expect(
        cookies.some((cookie: string) => cookie.includes("refreshToken="))
      ).toBe(true);
    });

    it("should reject invalid email", async () => {
      await context.request
        .post("/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "anypassword",
        })
        .expect(401);
    });

    it("should reject wrong password", async () => {
      const user = createTestUser("login2");
      await registerTestUser(context.request, user);

      await context.request
        .post("/auth/login")
        .send({
          email: user.email,
          password: "wrongpassword",
        })
        .expect(401);
    });
  });

  describe("GET /auth/me", () => {
    it("should return user info with valid token", async () => {
      const user = createTestUser("me1");
      const loggedInUser = await registerTestUser(context.request, user);

      const response = await context.request
        .get("/auth/me")
        .set("Authorization", `Bearer ${loggedInUser.accessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        ok: true,
        status: 200,
        data: {
          id: loggedInUser.userId,
          email: user.email,
        },
      });
    });

    it("should reject request without token", async () => {
      await context.request.get("/auth/me").expect(401);
    });

    it("should reject request with invalid token", async () => {
      await context.request
        .get("/auth/me")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);
    });
  });

  describe("POST /auth/refresh", () => {
    it("should refresh token with valid refresh cookie", async () => {
      const user = createTestUser("refresh1");

      // Register user and get cookies
      const registerResponse = await context.request
        .post("/auth/register")
        .send({
          email: user.email,
          password: user.password,
        })
        .expect(201);

      const cookies = registerResponse.headers["set-cookie"];

      // Use refresh token from cookie
      const response = await context.request
        .post("/auth/refresh")
        .set("Cookie", cookies)
        .expect(200);

      expect(response.body).toMatchObject({
        ok: true,
        status: 200,
        data: {
          accessToken: expect.any(String),
        },
      });

      // Should not include user object in refresh response
      expect(response.body.data.user).toBeUndefined();
      expect(response.body.data.refreshToken).toBeUndefined();

      // Should set new refresh token cookie
      const newCookies = response.headers["set-cookie"] as unknown as string[];
      expect(newCookies).toBeDefined();
      expect(
        newCookies.some((cookie: string) => cookie.includes("refreshToken="))
      ).toBe(true);
    });

    it("should reject request without refresh cookie", async () => {
      await context.request.post("/auth/refresh").expect(400);
    });
  });

  describe("POST /auth/logout", () => {
    it("should logout successfully", async () => {
      const response = await context.request.post("/auth/logout").expect(200);

      expect(response.body).toMatchObject({
        ok: true,
        status: 200,
        data: {
          message: "Logged out successfully",
        },
      });

      // Should clear refresh token cookie
      const cookies = response.headers["set-cookie"] as unknown as string[];
      expect(cookies).toBeDefined();
      expect(
        cookies.some(
          (cookie: string) =>
            cookie.includes("refreshToken=") && cookie.includes("expires=")
        )
      ).toBe(true);
    });
  });

  describe("GET /health", () => {
    it("should return health status", async () => {
      const response = await context.request.get("/health").expect(200);

      expect(response.body).toMatchObject({
        ok: true,
        status: 200,
        data: {
          status: "healthy",
          timestamp: expect.any(String),
          database: expect.any(String),
          uptime: expect.any(Number),
          memory: expect.any(Object),
        },
      });
    });
  });
});
