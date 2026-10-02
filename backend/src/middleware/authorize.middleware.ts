import type { Request, Response, NextFunction } from "express";
import type { Role } from "../shared/constants/roles.js";
import { AppError } from "../../utils/AppError.js";
import { HTTP_STATUS } from "../../utils/errorCodes.js";

/**
 * Role-based authorization middleware factory.
 *
 * Usage:
 *   router.get("/admin-only", authenticate, authorize("ADMIN"), handler);
 *   router.get("/staff", authenticate, authorize("ADMIN", "TEACHER"), handler);
 *
 * Must be used **after** the `authenticate` middleware so that `req.user` is populated.
 */
export const authorize =
  (...allowedRoles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError("Authentication required", HTTP_STATUS.UNAUTHORIZED);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(
        "You do not have permission to perform this action",
        HTTP_STATUS.FORBIDDEN,
      );
    }

    next();
  };
