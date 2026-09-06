import { z } from "zod";
import { ROLES, PUBLIC_REGISTRABLE_ROLES } from "../../../shared/constants/roles.js";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .toLowerCase(),
  password: passwordSchema,
  role: z
    .enum([ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT] as const)
    .refine(
      (val) => (PUBLIC_REGISTRABLE_ROLES as readonly string[]).includes(val),
      { message: "Public registration is not allowed for this role" },
    ),
  departmentId: z
    .string()
    .regex(objectIdRegex, "departmentId must be a valid MongoDB ObjectId"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type RegisterBody = z.infer<typeof registerSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
export type RefreshBody = z.infer<typeof refreshSchema>;
