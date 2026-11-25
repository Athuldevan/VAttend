import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import { env, allowedOrigins } from "./config/env.js";
import routes from "./routes/index.js";
import healthRoutes from "./routes/health.js";
import swaggerSpec from "./docs/swagger.js";
import { notFoundHandler } from "./middleware/notFound.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { authLimiter, apiLimiter } from "./middleware/rateLimit.middleware.js";

const app = express();

// Behind Vercel / any reverse proxy: required for correct client IPs
// (rate limiting) and for `secure` cookies to be recognised.
app.set("trust proxy", 1);

// Never advertise the framework.
app.disable("x-powered-by");

// ── Global middleware ───────────────────────────────────────────
app.use(
  helmet({
    // The /docs page pulls Stoplight Elements from a CDN.
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(compression());
app.use(
  cors({
    origin: (origin, callback) => {
      // Native apps (and server-to-server calls) send no Origin header.
      if (!origin) return callback(null, true);
      if (!env.IS_PRODUCTION) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "100kb" }));

// ── Request logger (quiet in production) ────────────────────────
if (!env.IS_PRODUCTION) {
  app.use((req, _res, next) => {
    console.log(`[API] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// ── Rate limiting ───────────────────────────────────────────────
app.use("/api/v1/auth", authLimiter);
app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);

// ── Routes ──────────────────────────────────────────────────────
app.use("/api/health", healthRoutes);
app.use("/api/v1", routes);
app.use("/api", routes);

// ── Root health check ───────────────────────────────────────────
app.get("/", (_req, res) => {
  res.send("Attendance Management System API is running");
});

// ── Swagger / API Docs ──────────────────────────────────────────
if (env.ENABLE_API_DOCS) {
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
}

// ── 404 & Error handlers (must be last) ─────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
