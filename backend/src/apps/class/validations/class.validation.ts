import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const objectIdSchema = z
  .string()
  .regex(
    objectIdRegex,
    "Must be a valid MongoDB ObjectId",
  );

const academicYearSchema = z
  .string()
  .trim()
  .regex(
    /^\d{4}-\d{2}$/,
    'Academic year must be in format "2026-27"',
  );


// CREATE
export const createClassSchema = z.object({
  programId: objectIdSchema.optional(),

  departmentId: objectIdSchema,

  year: z
    .number()
    .int("Year must be a whole number")
    .min(1, "Year must be at least 1")
    .max(6, "Year must not exceed 6"),

  academicYear: academicYearSchema,

  currentSemester: z
    .number()
    .int("Semester must be a whole number")
    .min(1, "Semester must be at least 1")
    .max(12, "Semester must not exceed 12"),
});


// UPDATE
export const updateClassSchema = z
  .object({
    programId: objectIdSchema.optional(),

    departmentId: objectIdSchema.optional(),

    year: z
      .number()
      .int("Year must be a whole number")
      .min(1, "Year must be at least 1")
      .max(6, "Year must not exceed 6")
      .optional(),

    academicYear: academicYearSchema.optional(),

    currentSemester: z
      .number()
      .int("Semester must be a whole number")
      .min(1, "Semester must be at least 1")
      .max(12, "Semester must not exceed 12")
      .optional(),
  })
  .refine(
    (data) =>
      data.programId !== undefined ||
      data.departmentId !== undefined ||
      data.year !== undefined ||
      data.academicYear !== undefined ||
      data.currentSemester !== undefined,
    {
      message:
        "At least one field is required to update the class",
    },
  );


// PARAMS
export const classIdParamSchema = z.object({
  id: objectIdSchema,
});


export type CreateClassBody = z.infer<
  typeof createClassSchema
>;

export type UpdateClassBody = z.infer<
  typeof updateClassSchema
>;

export type ClassIdParams = z.infer<
  typeof classIdParamSchema
>;