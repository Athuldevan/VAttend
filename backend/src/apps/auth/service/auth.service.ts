import User from "../../user/user.model.js";
import type { IUserDocument, SafeUser } from "../../user/user.types.js";
import type { RegisterInput, LoginInput, AuthTokens } from "../auth.types.js";
import type { AuthUser } from "../../../shared/types/common.types.js";
import { AppError } from "../../../../utils/AppError.js";
import { HTTP_STATUS } from "../../../../utils/errorCodes.js";
import {
  hashPassword,
  comparePassword,
  hashRefreshToken,
  compareRefreshToken,
} from "../../../../utils/password.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../../../utils/jwt.js";


function buildJwtPayload(user: IUserDocument): AuthUser {
  return {
    userId: String(user._id),
    role: user.role as AuthUser["role"],
    departmentId: user.departmentId.toString(),
  };
}

async function issueTokens(payload: AuthUser): Promise<AuthTokens> {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  return { accessToken, refreshToken };
}

export async function createUser(input: RegisterInput) {
  const hashedPassword = await hashPassword(input.password);

  const newUser = await User.create({ ...input, password: hashedPassword });

  const jwtPayload = buildJwtPayload(newUser);
  const tokens = await issueTokens(jwtPayload);

  // Store hashed refresh token
  newUser.refreshTokenHash = await hashRefreshToken(tokens.refreshToken);
  await newUser.save();

  return { user: newUser, tokens };
}

export async function login(input: LoginInput) {
  const user = await User.findOne({ email: input.email }).select(
    "+password +refreshTokenHash",
  );

  if (!user) {
    throw new AppError("Invalid email or password", HTTP_STATUS.UNAUTHORIZED);
  }

  if (!user.isActive) {
    throw new AppError(
      "Your account has been deactivated. Please contact an administrator.",
      HTTP_STATUS.FORBIDDEN,
    );
  }

  const passwordMatch = await comparePassword(input.password, user.password);
  if (!passwordMatch) {
    throw new AppError("Invalid email or password", HTTP_STATUS.UNAUTHORIZED);
  }

  const jwtPayload = buildJwtPayload(user);
  const tokens = await issueTokens(jwtPayload);

  // Store hashed refresh token
  user.refreshTokenHash = await hashRefreshToken(tokens.refreshToken);
  await user.save();

 return {
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    tokens,
  };
}

export async function refresh(
  rawRefreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  // Verify JWT signature & expiry
  const decoded = verifyRefreshToken(rawRefreshToken);

  const user = await User.findById(decoded.userId).select("+refreshTokenHash");

  if (!user) {
    throw new AppError("Invalid refresh token", HTTP_STATUS.UNAUTHORIZED);
  }

  if (!user.isActive) {
    throw new AppError(
      "Your account has been deactivated. Please contact an administrator.",
      HTTP_STATUS.FORBIDDEN,
    );
  }

  if (!user.refreshTokenHash) {
    throw new AppError("Invalid refresh token", HTTP_STATUS.UNAUTHORIZED);
  }

  // Compare supplied token with stored hash
  const tokenMatch = await compareRefreshToken(
    rawRefreshToken,
    user.refreshTokenHash,
  );
  if (!tokenMatch) {
    // Possible token reuse detected — invalidate stored hash for safety
    user.refreshTokenHash = undefined;
    await user.save();
    throw new AppError("Invalid refresh token", HTTP_STATUS.UNAUTHORIZED);
  }

  // Rotate: issue new tokens
  const jwtPayload = buildJwtPayload(user);
  const tokens = await issueTokens(jwtPayload);

  user.refreshTokenHash = await hashRefreshToken(tokens.refreshToken);
  await user.save();

  return tokens;
}

// LOGOUT
export async function logout(userId: string): Promise<void> {
  const user = await User.findById(userId).select("+refreshTokenHash");
  if (user) {
    user.refreshTokenHash = undefined;
    await user.save();
  }
}

// GET ME
export async function getMe(userId: string) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
  }
  return user;
}
