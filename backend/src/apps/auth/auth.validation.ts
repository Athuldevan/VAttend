import { z } from "zod";
import { ROLES, PUBLIC_REGISTRABLE_ROLES } from "../../../constants/roles.js";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const passwordSchema = z
  .string()
  .min(5, "Password must be at least 8 characters")

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

const newDepartmentSchema = z.object({
  name: z.string().trim().min(2, "Department name must be at least 2 characters"),
  code: z.string().trim().min(2, "Department code must be at least 2 characters").toUpperCase(),
});

export const registerSchema = z.discriminatedUnion("role", [
  commonRegisterSchema.extend({
    role: z.literal(ROLES.STUDENT),
    ...studentFieldsSchema.shape,
  }),
  commonRegisterSchema.extend({
    role: z.literal(ROLES.TEACHER),
  }),
  commonRegisterSchema.extend({
    role: z.literal(ROLES.ADMIN),
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

/** Public bootstrap flow for creating a department alongside its first staff account. */
export const registerWithDepartmentSchema = commonRegisterSchema
  .omit({ departmentId: true })
  .extend({
    role: z.union([z.literal(ROLES.ADMIN), z.literal(ROLES.TEACHER)]),
    department: newDepartmentSchema,
  });

export const setPasswordSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: passwordSchema,
});

export type RegisterBody = z.infer<typeof registerSchema>;
export type RegisterWithDepartmentBody = z.infer<typeof registerWithDepartmentSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
