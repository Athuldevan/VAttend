import type { Request, Response } from "express";
import { connectDB } from "../src/config/db.js";
import app from "../src/app.js";

/**
 * Vercel serverless entry point.
 *
 * Vercel never calls `app.listen()` — it invokes this handler per request, so
 * the database connection is established (or reused from the warm container's
 * cache) before the Express app handles the request.
 */
export default async function handler(req: Request, res: Response) {
  try {
    await connectDB();
  } catch (error) {
    console.error("MongoDB connection error:", error);
    res.status(503).json({
      success: false,
      message: "Service temporarily unavailable. Please try again.",
    });
    return;
  }

  return app(req, res);
}
