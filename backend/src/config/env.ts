import dotenv from "dotenv";

dotenv.config();

/** Validated environment variables. Throws on startup if any required var is missing. */
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  PORT: process.env.PORT ?? "5000",
  NODE_ENV: process.env.NODE_ENV ?? "development",

  DB_URL: requireEnv("DB_URL"),

  ACCESS_TOKEN_SECRET: requireEnv("ACCESS_TOKEN_SECRET"),
  REFRESH_TOKEN_SECRET: requireEnv("REFRESH_TOKEN_SECRET"),

  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN ?? "15m",
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN ?? "7d",

  BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS ?? "12",

  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:5173",
} as const;
