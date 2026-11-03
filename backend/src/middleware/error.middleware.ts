import type { Request, Response, NextFunction } from "express";
import { AppError } from "../../utils/AppError.js";
import { HTTP_STATUS } from "../../utils/errorCodes.js";
import { sendError } from "../../utils/apiResponse.js";
import { env } from "../config/env.js";

/**
 * Centralised error-handling middleware.
 * Must be registered LAST (after all routes).
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  // ── Operational AppError ──────────────────────────────────────
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.message);
    return;
  }

  // Cast to unknown-indexed record for non-standard error properties
  const errRecord = err as unknown as Record<string, unknown>;

  // ── MongoDB duplicate-key error (code 11000) ──────────────────
  if (errRecord.code === 11000 || errRecord.code === "11000") {
    const keyValue = errRecord.keyValue as
      | Record<string, unknown>
      | undefined;
    const field = keyValue ? Object.keys(keyValue)[0] ?? "field" : "field";
    sendError(
      res,
      HTTP_STATUS.CONFLICT,
      `An account with this ${field} already exists`,
      [{ field, message: `This ${field} is already in use` }],
    );
    return;
  }

  // ── Mongoose ValidationError ──────────────────────────────────
  if (err.name === "ValidationError") {
    const mongooseErr = err as unknown as {
      errors: Record<string, { message: string }>;
    };
    const errors = Object.entries(mongooseErr.errors).map(([field, error]) => ({
      field,
      message: error.message,
    }));
    sendError(res, HTTP_STATUS.BAD_REQUEST, "Validation failed", errors);
    return;
  }

  // ── Mongoose CastError (invalid ObjectId etc.) ────────────────
  if (err.name === "CastError") {
    const castError = err as unknown as { path?: string };
    sendError(res, HTTP_STATUS.BAD_REQUEST, "Invalid resource identifier", [
      { field: castError.path ?? "id", message: "Invalid value" },
    ]);
    return;
  }

  // ── JWT errors ────────────────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    sendError(res, HTTP_STATUS.UNAUTHORIZED, "Invalid token");
    return;
  }
  if (err.name === "TokenExpiredError") {
    sendError(res, HTTP_STATUS.UNAUTHORIZED, "Token has expired");
    return;
  }

  // ── Unexpected / programmer errors ────────────────────────────
  const isDev = env.NODE_ENV === "development";
  console.error("UNHANDLED ERROR:", err);
  sendError(
    res,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    isDev ? err.message : "An unexpected error occurred",
  );
};
