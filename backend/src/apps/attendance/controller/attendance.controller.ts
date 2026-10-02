import type { Request, Response } from "express";
import {
  markAttendanceService,
  updateAttendanceRecordService,
  getStudentAttendanceService,
  getStudentSummaryService,
  getDefaultersService,
  getSlotAttendanceService,
} from "../services/attendance.service.js";
import { sendSuccess } from "../../../../utils/apiResponse.js";
import { HTTP_STATUS } from "../../../../utils/errorCodes.js";
import { AppError } from "../../../../utils/AppError.js";
import type {
  MarkAttendanceBody,
  UpdateAttendanceBody,
  AttendanceIdParam,
  StudentIdParam,
  GetStudentAttendanceQuery,
  GetSlotAttendanceParams,
} from "../validations/attendance.validation.js";

/**
 * POST /api/attendance/mark
 */
export const markAttendance = async (
  req: Request<{}, {}, MarkAttendanceBody>,
  res: Response,
) => {
  if (!req.user) {
    throw new AppError("Authentication required", HTTP_STATUS.UNAUTHORIZED);
  }

  const result = await markAttendanceService(
    req.body,
    req.user.userId,
    req.user.role,
  );

  sendSuccess(
    res,
    HTTP_STATUS.CREATED,
    `Attendance marked successfully for ${result.length} student(s)`,
    result,
  );
};

/**
 * PATCH /api/attendance/:id
 */
export const updateAttendance = async (
  req: Request<AttendanceIdParam, {}, UpdateAttendanceBody>,
  res: Response,
) => {
  if (!req.user) {
    throw new AppError("Authentication required", HTTP_STATUS.UNAUTHORIZED);
  }

  const updatedRecord = await updateAttendanceRecordService(
    req.params.id,
    req.body.status,
    req.user.userId,
    req.user.role,
  );

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    "Attendance record updated successfully",
    updatedRecord,
  );
};

/**
 * GET /api/attendance/student/:studentId?subjectId=&from=&to=
 */
export const getStudentAttendance = async (
  req: Request<StudentIdParam, {}, {}, GetStudentAttendanceQuery>,
  res: Response,
) => {
  if (!req.user) {
    throw new AppError("Authentication required", HTTP_STATUS.UNAUTHORIZED);
  }

  const records = await getStudentAttendanceService(
    req.params.studentId,
    req.query,
    req.user.userId,
    req.user.role,
  );

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    "Student attendance fetched successfully",
    records,
  );
};

/**
 * GET /api/attendance/summary/:studentId
 */
export const getStudentSummary = async (
  req: Request<StudentIdParam>,
  res: Response,
) => {
  if (!req.user) {
    throw new AppError("Authentication required", HTTP_STATUS.UNAUTHORIZED);
  }

  const summary = await getStudentSummaryService(
    req.params.studentId,
    req.user.userId,
    req.user.role,
  );

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    "Attendance summary calculated successfully",
    summary,
  );
};

/**
 * GET /api/attendance/defaulters?classId=&threshold=75
 */
export const getDefaulters = async (req: Request, res: Response) => {
  const classId = (req.query.classId || req.query.batchId) as
    | string
    | undefined;

  if (!classId) {
    throw new AppError("classId parameter is required", HTTP_STATUS.BAD_REQUEST);
  }

  const threshold = req.query.threshold
    ? Number(req.query.threshold)
    : 75;

  if (isNaN(threshold) || threshold < 0 || threshold > 100) {
    throw new AppError(
      "Threshold must be a valid number between 0 and 100",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const defaultersData = await getDefaultersService(classId, threshold);

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    "Defaulters list fetched successfully",
    defaultersData,
  );
};

/**
 * GET /api/attendance/slot/:timetableSlotId/date/:date
 */
export const getSlotAttendance = async (
  req: Request<GetSlotAttendanceParams>,
  res: Response,
) => {
  const { timetableSlotId, date } = req.params;

  const data = await getSlotAttendanceService(timetableSlotId, date);

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    "Slot attendance fetched successfully",
    data,
  );
};
