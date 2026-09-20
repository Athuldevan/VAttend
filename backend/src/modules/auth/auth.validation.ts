import { z } from "zod";
import { ROLES, PUBLIC_REGISTRABLE_ROLES } from "../../../shared/constants/roles.js";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

const studentFieldsSchema = z.object({
  rollNumber: z.coerce.number().int().positive("Roll number must be positive"),
  class: z.string().regex(objectIdRegex, "class must be a valid MongoDB ObjectId"),
});

const commonRegisterSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Invalid email address").toLowerCase(),
  password: passwordSchema,
  departmentId: z
    .string()
    .regex(objectIdRegex, "departmentId must be a valid MongoDB ObjectId"),
});

export const registerSchema = z.discriminatedUnion("role", [
  commonRegisterSchema.extend({
    role: z.literal(ROLES.STUDENT),
    ...studentFieldsSchema.shape,
  }),
  commonRegisterSchema.extend({
    role: z.literal(ROLES.TEACHER),
  }),
]);

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export type RegisterBody = z.infer<typeof registerSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
