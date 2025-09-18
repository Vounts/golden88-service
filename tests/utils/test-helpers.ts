import { FastifyInstance } from "fastify";
import supertest from "supertest";
import { createApp } from "../../src/app.js";
import { createPool, closePool } from "../../src/config/database.js";

export interface TestContext {
  app: FastifyInstance;
  request: supertest.SuperTest<supertest.Test>;
}

export async function createTestApp(): Promise<TestContext> {
  // Create database pool for tests
  createPool();

  // Create Fastify app
  const app = await createApp();

  // Create supertest instance
  const request = supertest(
    app.server
  ) as unknown as supertest.SuperTest<supertest.Test>;

  return { app, request };
}

export async function closeTestApp(context: TestContext): Promise<void> {
  await context.app.close();
  await closePool();
}

export interface TestUser {
  email: string;
  password: string;
  accessToken?: string;
  userId?: string;
}

export function createTestUser(suffix = ""): TestUser {
  return {
    email: `test${suffix}@example.com`,
    password: "testpassword123",
  };
}

export async function registerTestUser(
  request: supertest.SuperTest<supertest.Test>,
  user: TestUser
): Promise<TestUser> {
  const response = await request
    .post("/auth/register")
    .send({
      email: user.email,
      password: user.password,
    })
    .expect(201);

  return {
    ...user,
    accessToken: response.body.data.accessToken,
    userId: response.body.data.user.id,
  };
}

export async function loginTestUser(
  request: supertest.SuperTest<supertest.Test>,
  user: TestUser
): Promise<TestUser> {
  const response = await request
    .post("/auth/login")
    .send({
      email: user.email,
      password: user.password,
    })
    .expect(200);

  return {
    ...user,
    accessToken: response.body.data.accessToken,
    userId: response.body.data.user.id,
  };
}
