import type { Request, Response } from "express";
import { asyncHandler } from "../../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../../shared/utils/apiResponse.js";
import { HTTP_STATUS } from "../../../shared/errors/errorCodes.js";
import { AppError } from "../../../shared/errors/AppError.js";
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  getRefreshTokenFromCookie,
} from "../../../shared/utils/refreshTokenCookie.js";
import * as authService from "../service/auth.service.js";
import type { RegisterBody, LoginBody } from "../auth.validation.js";

// ────────────────────────────────────────────

//register
export const register = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as RegisterBody;

  const { user, tokens } = await authService.createUser(body);

  setRefreshTokenCookie(res, tokens.refreshToken);

  sendSuccess(res, HTTP_STATUS.CREATED, "Registration successful", {
    user,
    accessToken: tokens.accessToken,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as LoginBody;

  const { user, tokens } = await authService.login({
    email: body.email,
    password: body.password,
  });
  setRefreshTokenCookie(res, tokens.refreshToken);
  console.log("refresh  token cookie is done");

  sendSuccess(res, HTTP_STATUS.OK, "Login successful", {
    user,
    accessToken: tokens.accessToken,
  });
});

//refresh
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = getRefreshTokenFromCookie(req);

  if (!refreshToken) {
    throw new AppError("Refresh token is required", HTTP_STATUS.UNAUTHORIZED);
  }

  const tokens = await authService.refresh(refreshToken);

  setRefreshTokenCookie(res, tokens.refreshToken);

  sendSuccess(res, HTTP_STATUS.OK, "Tokens refreshed successfully", {
    accessToken: tokens.accessToken,
  });
});

// logout
export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Authentication required", HTTP_STATUS.UNAUTHORIZED);
  }

  await authService.logout(req.user.userId);
  clearRefreshTokenCookie(res);

  sendSuccess(res, HTTP_STATUS.OK, "Logged out successfully");
});

// get me
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Authentication required", HTTP_STATUS.UNAUTHORIZED);
  }

  const user = await authService.getMe(req.user.userId);

  sendSuccess(res, HTTP_STATUS.OK, "User retrieved successfully", user);
});
