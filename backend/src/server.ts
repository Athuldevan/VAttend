import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import app from "./app.js";
import swaggerSpec from "./docs/swagger.js";
import type { Request, Response } from "express";

// Connect to Database
connectDB();

// ── Swagger / API Docs ──────────────────────────────────────────
app.get("/api-docs.json", (_req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.get("/docs", (_req: Request, res: Response) => {
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

// ── Start server ────────────────────────────────────────────────
const port = env.PORT;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
