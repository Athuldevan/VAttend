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

  SMTP_HOST: process.env.SMTP_HOST ?? "smtp.gmail.com",
  SMTP_PORT: parseInt(process.env.SMTP_PORT ?? "465", 10),
  SMTP_SECURE:
    process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465",
  SMTP_USER: process.env.SMTP_USER ?? "",
  SMTP_PASS: process.env.SMTP_PASS ?? "",
  SMTP_FROM: process.env.SMTP_FROM ?? "AMS Portal <clinicaonerevin@gmail.com>",
} as const;
