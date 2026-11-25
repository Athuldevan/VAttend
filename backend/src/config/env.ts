import dotenv from "dotenv";

// On Vercel the variables come from the platform; locally they come from .env.
dotenv.config();

const NODE_ENV = process.env.NODE_ENV ?? "development";
const IS_PRODUCTION = NODE_ENV === "production";

/** Validated environment variables. Throws on startup if any required var is missing. */
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/** A secret must be long enough to be worth having. Enforced in production. */
function requireSecret(key: string, minLength = 32): string {
  const value = requireEnv(key);
  if (IS_PRODUCTION && value.length < minLength) {
    throw new Error(
      `${key} must be at least ${minLength} characters in production ` +
        `(got ${value.length}). Generate one with: openssl rand -base64 48`,
    );
  }
  return value;
}

/** Required only in production; optional elsewhere so local dev stays frictionless. */
function requireInProduction(key: string, fallback: string): string {
  const value = process.env[key];
  if (!value) {
    if (IS_PRODUCTION) {
      throw new Error(`Missing required production environment variable: ${key}`);
    }
    return fallback;
  }
  return value;
}

const ACCESS_TOKEN_SECRET = requireSecret("ACCESS_TOKEN_SECRET");
const REFRESH_TOKEN_SECRET = requireSecret("REFRESH_TOKEN_SECRET");

if (IS_PRODUCTION && ACCESS_TOKEN_SECRET === REFRESH_TOKEN_SECRET) {
  throw new Error(
    "ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET must be different values",
  );
}

const DB_URL = requireEnv("DB_URL");

if (IS_PRODUCTION && /localhost|127\.0\.0\.1/.test(DB_URL)) {
  throw new Error(
    "DB_URL points at localhost but NODE_ENV=production. " +
      "Set a MongoDB Atlas connection string.",
  );
}

export const env = {
  PORT: process.env.PORT ?? "5000",
  NODE_ENV,
  IS_PRODUCTION,

  DB_URL,

  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,

  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN ?? "15m",
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN ?? "7d",

  BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS ?? "12",

  /**
   * Comma-separated list of browser origins allowed to send credentialed
   * requests. The mobile app sends no Origin header and is unaffected by this.
   */
  CORS_ORIGIN: requireInProduction("CORS_ORIGIN", "http://localhost:5173"),

  /** Public base URL of the deployed API, used in the OpenAPI spec. */
  PUBLIC_API_URL: process.env.PUBLIC_API_URL ?? "",

  /** Serve /docs and /api-docs.json. Defaults to off in production. */
  ENABLE_API_DOCS: process.env.ENABLE_API_DOCS
    ? process.env.ENABLE_API_DOCS === "true"
    : !IS_PRODUCTION,

  SMTP_HOST: process.env.SMTP_HOST ?? "smtp.gmail.com",
  SMTP_PORT: parseInt(process.env.SMTP_PORT ?? "465", 10),
  SMTP_SECURE:
    process.env.SMTP_SECURE === "true" || process.env.SMTP_PORT === "465",
  SMTP_USER: process.env.SMTP_USER ?? "",
  SMTP_PASS: process.env.SMTP_PASS ?? "",
  SMTP_FROM: process.env.SMTP_FROM ?? "AMS Portal <no-reply@example.com>",
} as const;

/** Origins allowed by CORS, parsed from the comma-separated CORS_ORIGIN. */
export const allowedOrigins = env.CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
