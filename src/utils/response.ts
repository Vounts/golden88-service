import { FastifyReply } from "fastify";
import { ApiSuccess, ApiError } from "../types/api.js";
import { AppError } from "../errors/base.js";

export function createSuccessResponse<T>(
  status: number,
  data: T
): ApiSuccess<T> {
  return {
    ok: true,
    status,
    data,
  };
}

export function createErrorResponse(
  status: number,
  code: string,
  message: string,
  details?: unknown
): ApiError {
  return {
    ok: false,
    status,
    error: {
      code,
      message,
      details,
    },
  };
}

export function sendSuccess<T>(
  reply: FastifyReply,
  status: number,
  data: T
): void {
  const response = createSuccessResponse(status, data);
  reply.status(status).send(response);
}

export function sendError(
  reply: FastifyReply,
  error: AppError | Error,
  logger?: any
): void {
  if (error instanceof AppError) {
    const response = createErrorResponse(
      error.statusCode,
      error.code,
      error.message,
      error.details
    );

    if (logger && error.statusCode >= 500) {
      logger.error(
        { error: error.message, stack: error.stack },
        "Application error"
      );
    }

    reply.status(error.statusCode).send(response);
  } else {
    // Unexpected error
    const response = createErrorResponse(
      500,
      "INTERNAL_SERVER_ERROR",
      "An unexpected error occurred"
    );

    if (logger) {
      logger.error(
        { error: error.message, stack: error.stack },
        "Unexpected error"
      );
    }

    reply.status(500).send(response);
  }
}
