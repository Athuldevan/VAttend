import type { Request, Response } from "express";
import { asyncHandler } from "../../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../../shared/utils/apiResponse.js";
import { HTTP_STATUS } from "../../../shared/errors/errorCodes.js";
import { AppError } from "../../../shared/errors/AppError.js";
import * as authService from "../service/auth.service.js";
import type { RegisterBody, LoginBody, RefreshBody } from "../auth.validation.js";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as RegisterBody;

  const { user, tokens } = await authService.createUser({
    name: body.name,
    email: body.email,
    password: body.password,
    role: body.role,
    departmentId: body.departmentId,
  });

  sendSuccess(res, HTTP_STATUS.CREATED, "Registration successful", {
    user,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as LoginBody;

  const { user, tokens } = await authService.login({
    email: body.email,
    password: body.password,
  });

  sendSuccess(res, HTTP_STATUS.OK, "Login successful", {
    user,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as RefreshBody;

  const tokens = await authService.refresh(body.refreshToken);

  sendSuccess(res, HTTP_STATUS.OK, "Tokens refreshed successfully", tokens);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Authentication required", HTTP_STATUS.UNAUTHORIZED);
  }

  await authService.logout(req.user.userId);

  sendSuccess(res, HTTP_STATUS.OK, "Logged out successfully");
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Authentication required", HTTP_STATUS.UNAUTHORIZED);
  }

  const user = await authService.getMe(req.user.userId);

  sendSuccess(res, HTTP_STATUS.OK, "User retrieved successfully", user);
});
