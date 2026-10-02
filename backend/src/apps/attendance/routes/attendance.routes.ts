import { Router } from "express";
import {
  markAttendance,
  updateAttendance,
  getStudentAttendance,
  getStudentSummary,
  getDefaulters,
  getSlotAttendance,
} from "../controller/attendance.controller.js";
import { ROLES } from "../../../shared/constants/roles.js";
import { authenticate } from "../../../middleware/auth.middleware.js";
import { authorize } from "../../../middleware/authorize.middleware.js";
import { validate } from "../../../middleware/validate.middleware.js";
import {
  markAttendanceSchema,
  updateAttendanceSchema,
  attendanceIdParamSchema,
  studentIdParamSchema,
  getSlotAttendanceParamsSchema,
} from "../validations/attendance.validation.js";

const router = Router();

/**
 * POST /api/v1/attendance/mark
 * Role: Teacher (or Admin)
 * Purpose: Mark attendance for a whole class, one period, one date
 */
router.post(
  "/mark",
  authenticate,
  authorize(ROLES.TEACHER, ROLES.ADMIN),
  validate(markAttendanceSchema, "body"),
  markAttendance,
);

/**
 * PATCH /api/v1/attendance/:id
 * Role: Teacher (own, <=48h) / Admin
 * Purpose: Correct a single student's status; appends to editHistory rather than overwriting
 */
router.patch(
  "/:id",
  authenticate,
  authorize(ROLES.TEACHER, ROLES.ADMIN),
  validate(attendanceIdParamSchema, "params"),
  validate(updateAttendanceSchema, "body"),
  updateAttendance,
);

/**
 * GET /api/v1/attendance/student/:studentId?subjectId=&from=&to=
 * Role: Self (student) / Teacher / Admin
 * Purpose: A student's attendance records, filterable by subject and date range
 */
router.get(
  "/student/:studentId",
  authenticate,
  authorize(ROLES.STUDENT, ROLES.TEACHER, ROLES.ADMIN),
  validate(studentIdParamSchema, "params"),
  getStudentAttendance,
);

/**
 * GET /api/v1/attendance/summary/:studentId
 * Role: Self / Teacher / Admin
 * Purpose: Computed overall % and subject-wise %
 */
router.get(
  "/summary/:studentId",
  authenticate,
  authorize(ROLES.STUDENT, ROLES.TEACHER, ROLES.ADMIN),
  validate(studentIdParamSchema, "params"),
  getStudentSummary,
);

/**
 * GET /api/v1/attendance/defaulters?classId=&threshold=75
 * Role: Teacher / Admin
 * Purpose: Students in a class below the attendance threshold, sorted worst-first
 */
router.get(
  "/defaulters",
  authenticate,
  authorize(ROLES.TEACHER, ROLES.ADMIN),
  getDefaulters,
);

/**
 * GET /api/v1/attendance/slot/:timetableSlotId/date/:date
 * Role: Teacher / Admin
 * Purpose: Fetch an already-marked period's records, to load the edit view
 */
router.get(
  "/slot/:timetableSlotId/date/:date",
  authenticate,
  authorize(ROLES.TEACHER, ROLES.ADMIN),
  validate(getSlotAttendanceParamsSchema, "params"),
  getSlotAttendance,
);

export default router;
