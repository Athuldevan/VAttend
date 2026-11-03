import { z } from "zod";

/**
 * MongoDB ObjectId validation
 */
const objectIdSchema = z
  .string()
  .regex(
    /^[0-9a-fA-F]{24}$/,
    "Invalid MongoDB ObjectId",
  );

/**
 * Time validation
 * Example: 09:00, 10:30, 16:45
 */
const timeSchema = z
  .string()
  .regex(
    /^([01]\d|2[0-3]):[0-5]\d$/,
    "Time must be in HH:mm format",
  );

/**
 * CREATE TIMETABLE
 *
 * POST /api/timetable
 */
export const createTimetableSchema = z.object({
  class: objectIdSchema,

  semester: z.coerce
    .number()
    .int()
    .min(1, "Semester must be at least 1"),

  subject: objectIdSchema,

  teacher: objectIdSchema,

  dayOfWeek: z.coerce
    .number()
    .int()
    .min(0, "Day must be between 0 and 5")
    .max(5, "Day must be between 0 and 5"),

  period: z.coerce
    .number()
    .int()
    .min(1, "Period must be between 1 and 8")
    .max(8, "Period must be between 1 and 8"),

  startTime: timeSchema,

  endTime: timeSchema,
  department: objectIdSchema.optional(),
});

/**
 * UPDATE TIMETABLE
 *
 * PATCH /api/timetable/:id
 *
 * Every field is optional because PATCH
 * only updates the fields supplied by the client.
 */
export const updateTimetableSchema =
  createTimetableSchema.partial();

/**
 * TIMETABLE ID PARAMETER
 *
 * PATCH /api/timetable/:id
 * DELETE /api/timetable/:id
 */
export const timetableIdParamSchema = z.object({
  id: objectIdSchema,
});

/**
 * GET CLASS TIMETABLE
 *
 * GET /api/timetable?classId=...
 */
export const getClassTimetableQuerySchema = z.object({
  classId: objectIdSchema,

  semester: z.coerce
    .number()
    .int()
    .min(1)
    .optional(),
});