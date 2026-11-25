import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import app from "./app.js";

connectDB();

// ── Start server ────────────────────────────────────────────────
const port = Number(env.PORT);

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on http://0.0.0.0:${port}`);
});
