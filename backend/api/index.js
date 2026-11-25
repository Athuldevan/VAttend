// Vercel serverless entry.
//
// Deliberately plain JavaScript: @vercel/node type-checks TypeScript entry
// points against a tsconfig it controls, which fails to resolve the "node"
// type library in the build sandbox. A .js entry skips that step entirely and
// imports the output produced by `tsc` during the build.
import { connectDB } from "../dist/src/config/db.js";
import app from "../dist/src/app.js";

export default async function handler(req, res) {
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
