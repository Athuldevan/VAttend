import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import healthRoutes from "./routes/health.js";
import { notFoundHandler } from "./middleware/notFound.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

// ── Global middleware ───────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────────
app.use("/api", healthRoutes);
app.use("/api/v1", routes);

// ── Root health check ───────────────────────────────────────────
app.get("/", (_req, res) => {
  res.send("Attendance Management System API is running");
});

// ── 404 & Error handlers (must be last) ─────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
