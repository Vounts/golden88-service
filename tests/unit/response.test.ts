import { describe, it, expect } from "vitest";
import {
  createSuccessResponse,
  createErrorResponse,
} from "../../src/utils/response.js";
import { ValidationError } from "../../src/errors/base.js";

describe("Response Utils", () => {
  describe("createSuccessResponse", () => {
    it("should create a success response", () => {
      const data = { message: "test" };
      const response = createSuccessResponse(200, data);

      expect(response).toEqual({
        ok: true,
        status: 200,
        data: { message: "test" },
      });
    });

    it("should work with different status codes", () => {
      const data = { id: 1 };
      const response = createSuccessResponse(201, data);

      expect(response).toEqual({
        ok: true,
        status: 201,
        data: { id: 1 },
      });
    });
  });

  describe("createErrorResponse", () => {
    it("should create an error response", () => {
      const response = createErrorResponse(400, "BAD_REQUEST", "Invalid input");

      expect(response).toEqual({
        ok: false,
        status: 400,
        error: {
          code: "BAD_REQUEST",
          message: "Invalid input",
        },
      });
    });

    it("should include details when provided", () => {
      const details = { field: "email", reason: "invalid format" };
      const response = createErrorResponse(
        400,
        "VALIDATION_ERROR",
        "Validation failed",
        details
      );

      expect(response).toEqual({
        ok: false,
        status: 400,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: { field: "email", reason: "invalid format" },
        },
      });
    });
  });
});
