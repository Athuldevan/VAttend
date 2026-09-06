import type { Response } from "express";

interface ApiResponsePayload<T> {
  success: boolean;
  message: string;
  data?: T;
}

/** Send a standardised JSON success response. */
export function sendSuccess<T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
): void {
  const body: ApiResponsePayload<T> = { success: true, message };
  if (data !== undefined) {
    body.data = data;
  }
  res.status(statusCode).json(body);
}

/** Send a standardised JSON error response. */
export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  errors?: unknown[],
): void {
  const body: Record<string, unknown> = { success: false, message };
  if (errors !== undefined) {
    body.errors = errors;
  }
  res.status(statusCode).json(body);
}
