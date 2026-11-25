import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

/**
 * Note on serverless: the default store is in-memory and therefore per
 * container, so limits are approximate on Vercel. It still blunts brute-force
 * attempts; move to a Redis store if you need hard guarantees.
 */

/** Tight limit on credential endpoints (login, register, password setup). */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.IS_PRODUCTION ? 20 : 1000,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again in a few minutes.",
  },
});

/** Broad safety net for the rest of the API. */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.IS_PRODUCTION ? 600 : 10000,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please slow down.",
  },
});
