import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import routes from "./routes/index.js";
import healthRoutes from "./routes/health.js";
import swaggerSpec from "./docs/swagger.js";
import { notFoundHandler } from "./middleware/notFound.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

// ── Global middleware ───────────────────────────────────────────
app.use(
  cors({
    origin: env.NODE_ENV === "development" ? true : env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());

// ── Request logger ──────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl}`);
  next();
});

// ── Routes ──────────────────────────────────────────────────────
app.use("/api/health", healthRoutes);
app.use("/api/v1", routes);
app.use("/api", routes);


// ── Root health check ───────────────────────────────────────────
app.get("/", (_req, res) => {
  res.send("Attendance Management System API is running");
});

// ── Swagger / API Docs ──────────────────────────────────────────
app.get("/api-docs.json", (_req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.get("/docs", (_req, res) => {
  res.send(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <title>AMS API Docs</title>
        <script src="https://unpkg.com/@stoplight/elements/web-components.min.js"></script>
        <link rel="stylesheet" href="https://unpkg.com/@stoplight/elements/styles.min.css">
      </head>
      <body style="height: 100vh;">
        <elements-api
          apiDescriptionUrl="/api-docs.json"
          router="hash"
          layout="sidebar"
          logo="https://stoplight.io/images/logo-icon-light.svg"
        />
      </body>
    </html>
  `);
});

// ── 404 & Error handlers (must be last) ─────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
