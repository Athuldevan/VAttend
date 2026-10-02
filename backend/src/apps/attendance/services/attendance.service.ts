import { Types } from "mongoose";
import Attendance, {
  type AttendanceStatus,
} from "../model/attendance.model.js";
import TimeTable from "../../timetable/model/timeTableSchema.js";
import User from "../../user/user.model.js";
import { AppError } from "../../../../utils/AppError.js";
import { HTTP_STATUS } from "../../../../utils/errorCodes.js";
import { ROLES, type Role } from "../../../shared/constants/roles.js";
import type {
  MarkAttendanceBody,
  GetStudentAttendanceQuery,
} from "../validations/attendance.validation.js";

/**
 * Normalizes any date string or Date object to UTC midnight (00:00:00.000Z)
 */
export const normalizeDateToMidnight = (dateInput: string | Date): Date => {
  if (typeof dateInput === "string") {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateInput);
    if (match && match[1] && match[2] && match[3]) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    }
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    throw new AppError("Invalid date format provided", HTTP_STATUS.BAD_REQUEST);
  }
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0),
  );
};

/**
 * 1. Mark attendance for a whole class, one period, one date.
 * POST /api/attendance/mark
 */
export const markAttendanceService = async (
  data: MarkAttendanceBody,
  userId: string,
  userRole: Role,
) => {
  const { timetableSlotId, date, records } = data;
  const normalizedDate = normalizeDateToMidnight(date);

  // Validate timetable slot exists
  const slot = await TimeTable.findById(timetableSlotId);
  if (!slot || slot.isDeleted) {
    throw new AppError(
      "Timetable slot not found or inactive",
      HTTP_STATUS.NOT_FOUND,
    );
  }

  // If role is TEACHER, verify teacher owns this slot or is authorized
  if (userRole === ROLES.TEACHER) {
    if (slot.teacher.toString() !== userId) {
      throw new AppError(
        "You are not assigned to teach this timetable slot",
        HTTP_STATUS.FORBIDDEN,
      );
    }
  }

  // Duplicate check: Check if attendance for this slot and date was already marked
  const existingRecord = await Attendance.findOne({
    timetableSlotId: new Types.ObjectId(timetableSlotId),
    date: normalizedDate,
  });

  if (existingRecord) {
    throw new AppError(
      "Attendance has already been marked for this timetable slot on this date. Use PATCH /api/attendance/:id to modify records.",
      HTTP_STATUS.CONFLICT,
    );
  }

  const markedAt = new Date();
  const markedByObjId = new Types.ObjectId(userId);
  const timetableSlotObjId = new Types.ObjectId(timetableSlotId);

  const docsToInsert = records.map((record) => ({
    studentId: new Types.ObjectId(record.studentId),
    timetableSlotId: timetableSlotObjId,
    date: normalizedDate,
    status: record.status,
    markedBy: markedByObjId,
    markedAt,
    editHistory: [],
  }));

  try {
    const createdRecords = await Attendance.insertMany(docsToInsert);
    return createdRecords;
  } catch (err: any) {
    // Catch MongoDB duplicate key error if concurrent marks happen
    if (err?.code === 11000) {
      throw new AppError(
        "Duplicate attendance record detected. Attendance has already been marked.",
        HTTP_STATUS.CONFLICT,
      );
    }
    throw err;
  }
};

/**
 * 2. Correct a single student's status; appends to editHistory rather than overwriting.
 * PATCH /api/attendance/:id
 * Allowed: Teacher (own, <= 48h) / Admin
 */
export const updateAttendanceRecordService = async (
  attendanceId: string,
  newStatus: AttendanceStatus,
  userId: string,
  userRole: Role,
) => {
  const record = await Attendance.findById(attendanceId).populate<{
    timetableSlotId: { teacher: Types.ObjectId };
  }>("timetableSlotId");

  if (!record) {
    throw new AppError("Attendance record not found", HTTP_STATUS.NOT_FOUND);
  }

  // Teacher permission and 48-hour edit window check
  if (userRole === ROLES.TEACHER) {
    const slotTeacherId =
      record.timetableSlotId?.teacher?.toString() ||
      record.markedBy?.toString();

    if (
      record.markedBy.toString() !== userId &&
      slotTeacherId !== userId
    ) {
      throw new AppError(
        "You do not have permission to edit this attendance record",
        HTTP_STATUS.FORBIDDEN,
      );
    }

    const markedAtTime = new Date(record.markedAt).getTime();
    const now = Date.now();
    const diffHours = (now - markedAtTime) / (1000 * 60 * 60);

    if (diffHours > 48) {
      throw new AppError(
        "Attendance edit window (48 hours) has expired. Only administrators can edit this record.",
        HTTP_STATUS.FORBIDDEN,
      );
    }
  }

  // If status is the same, no edit needed
  if (record.status === newStatus) {
    return record;
  }

  // Append to edit history
  record.editHistory.push({
    editedBy: new Types.ObjectId(userId),
    previousStatus: record.status,
    newStatus,
    editedAt: new Date(),
  });

  record.status = newStatus;
  await record.save();

  return record.populate([
    { path: "studentId", select: "name email rollNumber class" },
    { path: "markedBy", select: "name email" },
    { path: "editHistory.editedBy", select: "name email" },
  ]);
};

/**
 * 3. Fetch a student's attendance records, filterable by subject and date range.
 * GET /api/attendance/student/:studentId?subjectId=&from=&to=
 */
export const getStudentAttendanceService = async (
  studentId: string,
  filters: GetStudentAttendanceQuery,
  callerUserId: string,
  callerRole: Role,
) => {
  if (callerRole === ROLES.STUDENT && callerUserId !== studentId) {
    throw new AppError(
      "You are not authorized to view another student's attendance",
      HTTP_STATUS.FORBIDDEN,
    );
  }

  const query: Record<string, any> = {
    studentId: new Types.ObjectId(studentId),
  };

  if (filters.from || filters.to) {
    const dateQuery: Record<string, Date> = {};
    if (filters.from) {
      dateQuery.$gte = normalizeDateToMidnight(filters.from);
    }
    if (filters.to) {
      const toDate = normalizeDateToMidnight(filters.to);
      toDate.setUTCHours(23, 59, 59, 999);
      dateQuery.$lte = toDate;
    }
    query.date = dateQuery;
  }

  if (filters.subjectId) {
    const matchingSlots = await TimeTable.find({
      subject: new Types.ObjectId(filters.subjectId),
    }).select("_id");

    const slotIds = matchingSlots.map((s) => s._id);
    query.timetableSlotId = { $in: slotIds };
  }

  const records = await Attendance.find(query)
    .populate({
      path: "timetableSlotId",
      populate: [
        { path: "subject" },
        { path: "teacher", select: "name email" },
        { path: "class" },
      ],
    })
    .populate("markedBy", "name email")
    .populate("editHistory.editedBy", "name email")
    .sort({ date: -1, createdAt: -1 })
    .lean();

  return records;
};

/**
 * 4. Computed overall % and subject-wise %
 * GET /api/attendance/summary/:studentId
 */
export const getStudentSummaryService = async (
  studentId: string,
  callerUserId: string,
  callerRole: Role,
) => {
  if (callerRole === ROLES.STUDENT && callerUserId !== studentId) {
    throw new AppError(
      "You are not authorized to view another student's attendance summary",
      HTTP_STATUS.FORBIDDEN,
    );
  }

  const student = await User.findById(studentId)
    .populate("class")
    .populate("departmentId", "name code")
    .lean();

  if (!student) {
    throw new AppError("Student not found", HTTP_STATUS.NOT_FOUND);
  }

  const records = await Attendance.find({
    studentId: new Types.ObjectId(studentId),
  })
    .populate<{
      timetableSlotId: {
        _id: Types.ObjectId;
        subject: { _id: Types.ObjectId; name?: string; code?: string } | Types.ObjectId;
      };
    }>({
      path: "timetableSlotId",
      populate: { path: "subject" },
    })
    .lean();

  let present = 0;
  let absent = 0;
  let half_day = 0;
  let leave = 0;

  interface SubjectSummary {
    subjectId: string;
    subjectName: string;
    subjectCode: string;
    total: number;
    present: number;
    absent: number;
    half_day: number;
    leave: number;
    effectiveAttended: number;
    percentage: number;
  }

  const subjectMap = new Map<string, SubjectSummary>();

  for (const rec of records) {
    if (rec.status === "present") present++;
    else if (rec.status === "absent") absent++;
    else if (rec.status === "half_day") half_day++;
    else if (rec.status === "leave") leave++;

    const slot = rec.timetableSlotId as any;
    const subj = slot?.subject;
    const subjId = subj?._id ? subj._id.toString() : (subj ? subj.toString() : "unassigned");
    const subjName = subj?.name || "General Subject";
    const subjCode = subj?.code || "";

    if (!subjectMap.has(subjId)) {
      subjectMap.set(subjId, {
        subjectId: subjId,
        subjectName: subjName,
        subjectCode: subjCode,
        total: 0,
        present: 0,
        absent: 0,
        half_day: 0,
        leave: 0,
        effectiveAttended: 0,
        percentage: 0,
      });
    }

    const s = subjectMap.get(subjId)!;
    s.total++;
    if (rec.status === "present") s.present++;
    else if (rec.status === "absent") s.absent++;
    else if (rec.status === "half_day") s.half_day++;
    else if (rec.status === "leave") s.leave++;
  }

  const total = records.length;
  // Standard calculation: (present + half_day * 0.5) / total * 100
  const effectiveAttended = present + half_day * 0.5;
  const overallPercentage =
    total > 0 ? Number(((effectiveAttended / total) * 100).toFixed(2)) : 0;

  const subjects = Array.from(subjectMap.values()).map((s) => {
    const sEffective = s.present + s.half_day * 0.5;
    const pct =
      s.total > 0 ? Number(((sEffective / s.total) * 100).toFixed(2)) : 0;
    return {
      ...s,
      effectiveAttended: sEffective,
      percentage: pct,
    };
  });

  return {
    student: {
      _id: student._id,
      name: student.name,
      email: student.email,
      rollNumber: student.rollNumber,
      class: student.class,
      department: student.departmentId,
    },
    overall: {
      total,
      present,
      absent,
      half_day,
      leave,
      effectiveAttended,
      percentage: overallPercentage,
    },
    subjects,
  };
};

/**
 * 5. Students in a class below the attendance threshold, sorted worst-first.
 * GET /api/attendance/defaulters?classId=&threshold=75
 */
export const getDefaultersService = async (
  classId: string,
  threshold: number = 75,
) => {
  // Find all active students in this class
  const students = await User.find({
    class: new Types.ObjectId(classId),
    role: ROLES.STUDENT,
    isActive: true,
  })
    .select("_id name email rollNumber class departmentId")
    .lean();

  if (!students.length) {
    return {
      classId,
      threshold,
      totalStudents: 0,
      defaultersCount: 0,
      defaulters: [],
    };
  }

  const studentIds = students.map((s) => s._id);

  // Group attendance stats per student
  const stats = await Attendance.aggregate([
    {
      $match: {
        studentId: { $in: studentIds },
      },
    },
    {
      $group: {
        _id: "$studentId",
        total: { $sum: 1 },
        present: {
          $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] },
        },
        absent: {
          $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] },
        },
        half_day: {
          $sum: { $cond: [{ $eq: ["$status", "half_day"] }, 1, 0] },
        },
        leave: {
          $sum: { $cond: [{ $eq: ["$status", "leave"] }, 1, 0] },
        },
      },
    },
  ]);

  const statsMap = new Map(stats.map((item) => [item._id.toString(), item]));
  const defaulters: Array<{
    student: {
      _id: Types.ObjectId;
      name: string;
      email: string;
      rollNumber?: number | undefined;
    };
    totalSessions: number;
    present: number;
    absent: number;
    half_day: number;
    leave: number;
    effectiveAttended: number;
    percentage: number;
  }> = [];


  for (const st of students) {
    const sStat = statsMap.get(st._id.toString()) || {
      total: 0,
      present: 0,
      absent: 0,
      half_day: 0,
      leave: 0,
    };

    const effective = sStat.present + sStat.half_day * 0.5;
    const percentage =
      sStat.total > 0
        ? Number(((effective / sStat.total) * 100).toFixed(2))
        : 0;

    if (percentage < threshold) {
      defaulters.push({
        student: {
          _id: st._id,
          name: st.name,
          email: st.email,
          rollNumber: st.rollNumber,
        },
        totalSessions: sStat.total,
        present: sStat.present,
        absent: sStat.absent,
        half_day: sStat.half_day,
        leave: sStat.leave,
        effectiveAttended: effective,
        percentage,
      });
    }
  }

  // Sort worst-first (ascending percentage)
  defaulters.sort((a, b) => a.percentage - b.percentage);

  return {
    classId,
    threshold,
    totalStudents: students.length,
    defaultersCount: defaulters.length,
    defaulters,
  };
};

/**
 * 6. Fetch an already-marked period's records, to load the edit view.
 * GET /api/attendance/slot/:timetableSlotId/date/:date
 */
export const getSlotAttendanceService = async (
  timetableSlotId: string,
  dateInput: string,
) => {
  const normalizedDate = normalizeDateToMidnight(dateInput);

  const slot = await TimeTable.findById(timetableSlotId)
    .populate("class")
    .populate("subject")
    .populate("teacher", "name email")
    .populate("department", "name code")
    .lean();

  if (!slot || slot.isDeleted) {
    throw new AppError("Timetable slot not found", HTTP_STATUS.NOT_FOUND);
  }

  const records = await Attendance.find({
    timetableSlotId: new Types.ObjectId(timetableSlotId),
    date: normalizedDate,
  })
    .populate("studentId", "name email rollNumber")
    .populate("markedBy", "name email")
    .populate("editHistory.editedBy", "name email")
    .sort({ "studentId.rollNumber": 1 })
    .lean();

  // If no records marked yet, also fetch enrolled students so frontend can display mark view
  const classId = (slot.class as any)?._id || slot.class;
  const enrolledStudents = await User.find({
    class: classId,
    role: ROLES.STUDENT,
    isActive: true,
  })
    .select("_id name email rollNumber")
    .sort({ rollNumber: 1, name: 1 })
    .lean();

  return {
    slot,
    date: normalizedDate,
    isMarked: records.length > 0,
    recordsCount: records.length,
    records,
    enrolledStudents,
  };
};
