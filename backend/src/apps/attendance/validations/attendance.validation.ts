import { z } from "zod";

/**
 * MongoDB ObjectId validation
 */
export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

export const attendanceStatusSchema = z.enum([
  "present",
  "absent",
  "half_day",
  "leave",
]);

/**
 * POST /api/attendance/mark
 */
export const markAttendanceSchema = z.object({
  timetableSlotId: objectIdSchema,
  date: z.string().min(1, "Date is required"),
  records: z
    .array(
      z.object({
        studentId: objectIdSchema,
        status: attendanceStatusSchema,
      }),
    )
    .min(1, "At least one student attendance record is required"),
});

export type MarkAttendanceBody = z.infer<typeof markAttendanceSchema>;

/**
 * PATCH /api/attendance/:id
 */
export const updateAttendanceSchema = z.object({
  status: attendanceStatusSchema,
});

export type UpdateAttendanceBody = z.infer<typeof updateAttendanceSchema>;

/**
 * Parameter validation for /api/attendance/:id
 */
export const attendanceIdParamSchema = z.object({
  id: objectIdSchema,
});

export type AttendanceIdParam = z.infer<typeof attendanceIdParamSchema>;

/**
 * GET /api/attendance/student/:studentId
 */
export const studentIdParamSchema = z.object({
  studentId: objectIdSchema,
});

export type StudentIdParam = z.infer<typeof studentIdParamSchema>;

export const getStudentAttendanceQuerySchema = z.object({
  subjectId: objectIdSchema.optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export type GetStudentAttendanceQuery = z.infer<
  typeof getStudentAttendanceQuerySchema
>;

/**
 * GET /api/attendance/defaulters?classId=&threshold=75
 */
export const getDefaultersQuerySchema = z
  .object({
    classId: objectIdSchema.optional(),
    batchId: objectIdSchema.optional(),
    threshold: z.coerce.number().min(0).max(100).default(75).optional(),
  })
  .refine((data) => Boolean(data.classId || data.batchId), {
    message: "classId (or batchId) is required",
    path: ["classId"],
  });

export type GetDefaultersQuery = z.infer<typeof getDefaultersQuerySchema>;

/**
 * GET /api/attendance/slot/:timetableSlotId/date/:date
 */
export const getSlotAttendanceParamsSchema = z.object({
  timetableSlotId: objectIdSchema,
  date: z.string().min(1, "Date is required"),
});

export type GetSlotAttendanceParams = z.infer<
  typeof getSlotAttendanceParamsSchema
>;
