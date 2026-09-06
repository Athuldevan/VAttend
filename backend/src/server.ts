import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import app from "./app.js";

connectDB();

// ── Start server ────────────────────────────────────────────────
const port = env.PORT;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
