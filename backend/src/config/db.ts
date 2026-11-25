import mongoose from "mongoose";

/**
 * Serverless-safe MongoDB connection.
 *
 * On Vercel each invocation may reuse a warm container, so the connection (and
 * the in-flight promise) are cached on `globalThis` and reused instead of
 * opening a new pool per request.
 */
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  __mongooseCache?: MongooseCache;
};

const cache: MongooseCache =
  globalForMongoose.__mongooseCache ?? { conn: null, promise: null };

globalForMongoose.__mongooseCache = cache;

export const connectDB = async (): Promise<typeof mongoose> => {
  if (cache.conn) return cache.conn;

  const mongoURI = process.env.DB_URL;
  if (!mongoURI) {
    throw new Error("DB_URL is not defined in the environment variables");
  }

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(mongoURI, {
        // Fail fast instead of hanging until the platform timeout.
        serverSelectionTimeoutMS: 10_000,
        // Keep the pool small: many concurrent serverless containers each hold one.
        maxPoolSize: 10,
      })
      .then((connection) => {
        console.log("MongoDB connected successfully");
        return connection;
      })
      .catch((error) => {
        // Clear the cached promise so the next request can retry.
        cache.promise = null;
        throw error;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
};
