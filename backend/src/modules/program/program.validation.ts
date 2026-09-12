import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const departmentIdSchema = z
  .string()
  .regex(
    objectIdRegex,
    "departmentId must be a valid MongoDB ObjectId",
  );

const nameSchema = z
  .string()
  .trim()
  .min(2, "Program name must be at least 2 characters")
  .max(100, "Program name must not exceed 100 characters");

const levelSchema = z.enum(["UG", "PG"], {
  error: "Level must be either UG or PG",
});

const durationYearsSchema = z
  .number()
  .int("Duration must be a whole number")
  .min(1, "Duration must be at least 1 year")
  .max(6, "Duration must not exceed 6 years");


// CREATE
export const createProgramSchema = z.object({
  departmentId: departmentIdSchema,

  name: nameSchema,

  level: levelSchema,

  durationYears: durationYearsSchema,
});


// UPDATE
export const updateProgramSchema = z
  .object({
    name: nameSchema.optional(),

    level: levelSchema.optional(),

    durationYears: durationYearsSchema.optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.level !== undefined ||
      data.durationYears !== undefined,
    {
      message: "At least one field is required to update the program",
    },
  );


// PARAMS
export const programIdParamSchema = z.object({
  id: z
    .string()
    .regex(
      objectIdRegex,
      "id must be a valid MongoDB ObjectId",
    ),
});


export type CreateProgramBody = z.infer<
  typeof createProgramSchema
>;

export type UpdateProgramBody = z.infer<
  typeof updateProgramSchema
>;

export type ProgramIdParams = z.infer<
  typeof programIdParamSchema
>;