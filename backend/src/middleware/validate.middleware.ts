import type { Request, Response, NextFunction } from "express";
import type { ZodSchema, ZodIssue } from "zod";
import { ZodError } from "zod";
import { HTTP_STATUS } from "../../utils/errorCodes.js";
import { sendError } from "../../utils/apiResponse.js";

/**
 * Returns Express middleware that validates `req.body`, `req.params`, or `req.query` against the given Zod schema.
 * On success, the target property on `req` is replaced with the parsed (and transformed) data.
 */
export const validate =
  (
    schema: ZodSchema,
    target: "body" | "params" | "query" = "body",
  ) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      // If default "body" is specified but req.body is empty / GET request with params/query, auto-detect target
      let dataToValidate = req[target];
      let selectedTarget = target;

      if (
        target === "body" &&
        (!req.body || Object.keys(req.body).length === 0)
      ) {
        if (req.params && Object.keys(req.params).length > 0) {
          dataToValidate = req.params;
          selectedTarget = "params";
        } else if (req.query && Object.keys(req.query).length > 0) {
          dataToValidate = req.query;
          selectedTarget = "query";
        }
      }

      const parsed = schema.parse(dataToValidate);
      (req as any)[selectedTarget] = parsed;
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

