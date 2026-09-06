import type { Request, Response, NextFunction } from "express";
import { AppError } from "../shared/errors/AppError.js";
import { HTTP_STATUS } from "../shared/errors/errorCodes.js";
import { verifyAccessToken } from "../shared/utils/jwt.js";

/**
 * JWT authentication middleware.
 * Reads the Authorization header, verifies the access token,
 * and attaches the decoded payload to `req.user`.
 */
export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError(
      "Authentication required. Please provide a valid token.",
      HTTP_STATUS.UNAUTHORIZED,
    );
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    throw new AppError(
      "Authentication required. Please provide a valid token.",
      HTTP_STATUS.UNAUTHORIZED,
    );
  }

  try {
    const payload = verifyAccessToken(token);

    // Validate expected payload fields exist
    if (!payload.userId || !payload.role || !payload.departmentId) {
      throw new AppError("Invalid token payload", HTTP_STATUS.UNAUTHORIZED);
    }

    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    // jsonwebtoken errors (TokenExpiredError, JsonWebTokenError, etc.)
    const message =
      (error as Error).name === "TokenExpiredError"
        ? "Token has expired"
        : "Invalid token";
    throw new AppError(message, HTTP_STATUS.UNAUTHORIZED);
  }
};
