import type { Request, Response } from "express";
import { env } from "../../config/env.js";

export const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

function expiresInToMs(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid REFRESH_TOKEN_EXPIRES_IN format: ${expiresIn}`);
  }

  const value = Number(match[1]);
  const unit = match[2];
  const multipliers = {
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  } as const;

  return value * multipliers[unit as keyof typeof multipliers];
}

export function setRefreshTokenCookie(res: Response, refreshToken: string): void {
  res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: expiresInToMs(env.REFRESH_TOKEN_EXPIRES_IN),
    path: "/api/v1/auth",
  });
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/v1/auth",
  });
}

export function getRefreshTokenFromCookie(req: Request): string | undefined {
  return req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
}
