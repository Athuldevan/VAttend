import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createDepartmentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Department name must be at least 2 characters")
    .max(100, "Department name must not exceed 100 characters"),

  code: z
    .string()
    .trim()
    .min(2, "Department code must be at least 2 characters")
    .max(20, "Department code must not exceed 20 characters")
    .regex(
      /^[A-Za-z0-9_-]+$/,
      "Department code can only contain letters, numbers, underscores, and hyphens",
    )
    .transform((value) => value.toUpperCase()),
});

export const updateDepartmentSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Department name must be at least 2 characters")
      .max(100, "Department name must not exceed 100 characters")
      .optional(),

    code: z
      .string()
      .trim()
      .min(2, "Department code must be at least 2 characters")
      .max(20, "Department code must not exceed 20 characters")
      .regex(
        /^[A-Za-z0-9_-]+$/,
        "Department code can only contain letters, numbers, underscores, and hyphens",
      )
      .transform((value) => value.toUpperCase())
      .optional(),
  })
  .refine(
    (data) => data.name !== undefined || data.code !== undefined,
    {
      message: "At least one field is required to update department",
    },
  );

export const departmentIdParamSchema = z.object({
  id: z
    .string()
    .regex(objectIdRegex, "Invalid department ID"),
});

export type CreateDepartmentBody = z.infer<
  typeof createDepartmentSchema
>;

export type UpdateDepartmentBody = z.infer<
  typeof updateDepartmentSchema
>;

export type DepartmentIdParams = z.infer<
  typeof departmentIdParamSchema
>;