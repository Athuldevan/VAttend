import type { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../shared/errors/errorCodes.js";
import { sendError } from "../shared/utils/apiResponse.js";

/**
 * Catch-all 404 handler for routes that don't match any registered endpoint.
 * Must be registered AFTER all routes and BEFORE the error-handling middleware.
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  sendError(
    res,
    HTTP_STATUS.NOT_FOUND,
    `Route not found: ${req.method} ${req.originalUrl}`,
  );
};
