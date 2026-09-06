import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import type { AuthUser } from "../types/common.types.js";
import { env } from "../../config/env.js";

/** Generate a  access token. */
export function generateAccessToken(payload: AuthUser): string {
  return jwt.sign({ ...payload }, env.ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRES_IN as NonNullable<SignOptions["expiresIn"]>,
  });
}

/** Generate a refresh token. */
export function generateRefreshToken(payload: AuthUser): string {
  return jwt.sign({ ...payload }, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as NonNullable<SignOptions["expiresIn"]>,
  });
}

/** Verify and decode an access token. Throws on invalid/expired tokens. */
export function verifyAccessToken(token: string): AuthUser {
  const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as jwt.JwtPayload &
    AuthUser;
  return {
    userId: decoded.userId,
    role: decoded.role,
    departmentId: decoded.departmentId,
  };
}

/** Verify and decode a refresh token. Throws on invalid/expired tokens. */
export function verifyRefreshToken(token: string): AuthUser {
  const decoded = jwt.verify(token, env.REFRESH_TOKEN_SECRET) as jwt.JwtPayload &
    AuthUser;
  return {
    userId: decoded.userId,
    role: decoded.role,
    departmentId: decoded.departmentId,
  };
}
