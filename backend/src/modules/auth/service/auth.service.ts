import User from "../../user/user.model.js";
import type { SafeUser } from "../../user/user.types.js";
import type { RegisterInput, LoginInput, AuthTokens } from "../auth.types.js";
import type { AuthUser } from "../../../shared/types/common.types.js";
import { AppError } from "../../../shared/errors/AppError.js";
import { HTTP_STATUS } from "../../../shared/errors/errorCodes.js";
import {
    hashPassword,
    comparePassword,
    hashRefreshToken,
    compareRefreshToken,
} from "../../../shared/utils/password.js";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from "../../../shared/utils/jwt.js";

// ────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────

function toSafeUser(user: {
    _id: unknown;
    name: string;
    email: string;
    role: string;
    departmentId: unknown;
    isActive: boolean;
}): SafeUser {
    return {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role as SafeUser["role"],
        departmentId: String(user.departmentId),
        isActive: user.isActive,
    };
}

function buildJwtPayload(user: {
    _id: unknown;
    role: string;
    departmentId: unknown;
}): AuthUser {
    return {
        userId: String(user._id),
        role: user.role as AuthUser["role"],
        departmentId: String(user.departmentId),
    };
}

async function issueTokens(payload: AuthUser): Promise<AuthTokens> {
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    return { accessToken, refreshToken };
}

// ────────────────────────────────────────────
// Public service methods
// ────────────────────────────────────────────

/**
 * Create a new user. Separated from the public registration endpoint
 * so that ADMIN-only creation flows can reuse this logic.
 */
export async function createUser(
    input: RegisterInput,
): Promise<{ user: SafeUser; tokens: AuthTokens }> {

    const hashedPassword = await hashPassword(input.password);

    const newUser = await User.create({
        name: input.name,
        email: input.email,
        password: hashedPassword,
        role: input.role,
        departmentId: input.departmentId,
    });

    const jwtPayload = buildJwtPayload(newUser);
    const tokens = await issueTokens(jwtPayload);

    // Store hashed refresh token
    newUser.refreshTokenHash = await hashRefreshToken(tokens.refreshToken);
    await newUser.save();

    return { user: toSafeUser(newUser), tokens };
}

export async function login(
    input: LoginInput,
): Promise<{ user: SafeUser; tokens: AuthTokens }> {
    // Select password and refreshTokenHash explicitly
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

    return { user: toSafeUser(user), tokens };
}

export async function refresh(
    rawRefreshToken: string,
): Promise<{ accessToken: string; refreshToken: string }> {
    // Verify JWT signature & expiry
    const decoded = verifyRefreshToken(rawRefreshToken);

    const user = await User.findById(decoded.userId).select(
        "+refreshTokenHash",
    );

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

export async function logout(userId: string): Promise<void> {
    const user = await User.findById(userId).select("+refreshTokenHash");
    if (user) {
        user.refreshTokenHash = undefined;
        await user.save();
    }
}

export async function getMe(userId: string): Promise<SafeUser> {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
    }
    return toSafeUser(user);
}
