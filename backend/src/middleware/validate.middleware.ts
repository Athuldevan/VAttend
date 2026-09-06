import type { Request, Response, NextFunction } from "express";
import type { ZodSchema, ZodIssue } from "zod";
import { ZodError } from "zod";
import { HTTP_STATUS } from "../shared/errors/errorCodes.js";
import { sendError } from "../shared/utils/apiResponse.js";

/**
 * Returns Express middleware that validates `req.body` against the given Zod schema.
 * On success, `req.body` is replaced with the parsed (and transformed) data.
 */
export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map((issue: ZodIssue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        sendError(
          res,
          HTTP_STATUS.BAD_REQUEST,
          "Validation failed",
          messages,
        );
        return;
      }
      next(error);
    }
  };
