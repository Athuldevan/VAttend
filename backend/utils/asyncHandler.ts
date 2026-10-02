import type { Request, Response, NextFunction } from "express";

/**
 * Wraps an async Express route handler so that rejected promises are
 * automatically forwarded to the Express error-handling middleware.
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
