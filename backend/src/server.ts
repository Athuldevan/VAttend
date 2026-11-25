import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import app from "./app.js";

// ── Start server (long-running host: local dev, Render, Railway, VPS) ──
// On Vercel the serverless entry in `api/index.ts` is used instead.
const port = Number(env.PORT);

connectDB()
  .then(() => {
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server is running on http://0.0.0.0:${port}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

// Never let an unexpected rejection take down the process silently.
process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
});
