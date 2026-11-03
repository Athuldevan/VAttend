import type { Request, Response } from "express";
import { asyncHandler } from "../../../../utils/asyncHandler.js";
import { sendSuccess } from "../../../../utils/apiResponse.js";
import { HTTP_STATUS } from "../../../../utils/errorCodes.js";
import { AppError } from "../../../../utils/AppError.js";
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  getRefreshTokenFromCookie,
} from "../../../../utils/refreshTokenCookie.js";
import * as authService from "../service/auth.service.js";
import type { RegisterBody, LoginBody, RegisterWithDepartmentBody } from "../auth.validation.js";
import { getDepartmentsService } from "../../department/services/department.service.js";

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

export const registerWithDepartment = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as RegisterWithDepartmentBody;
  const { user, tokens } = await authService.createUserWithDepartment(body);

  setRefreshTokenCookie(res, tokens.refreshToken);

  sendSuccess(res, HTTP_STATUS.CREATED, "Registration successful", {
    user,
    accessToken: tokens.accessToken,
  });
});

export const setPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.setTeacherPassword(req.body);
  sendSuccess(res, HTTP_STATUS.OK, "Password set successfully. You can now sign in.");
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as LoginBody;

  const { user, tokens } = await authService.login({
    email: body.email,
    password: body.password,
  });
  setRefreshTokenCookie(res, tokens.refreshToken);

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

// Minimal public data required to register an account without exposing users.
export const getRegistrationDepartments = asyncHandler(async (_req: Request, res: Response) => {
  const departments = await getDepartmentsService();

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    "Departments fetched successfully",
    departments.map((department) => ({
      id: department._id.toString(),
      name: department.name,
      code: department.code,
    })),
  );
});
