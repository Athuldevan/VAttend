import type { Request, Response } from "express";
import User from "../user.model.js";
import { Department } from "../../department/modal/department.modal.js";
import { ROLES } from "../../../shared/constants/roles.js";
import { AppError } from "../../../../utils/AppError.js";
import { HTTP_STATUS } from "../../../../utils/errorCodes.js";
import { sendSuccess } from "../../../../utils/apiResponse.js";
import { hashPassword } from "../../../../utils/password.js";
import { sendTeacherInviteEmail } from "../../../../utils/email.service.js";
import crypto from "crypto";
import { Class } from "../../class/model/class.model.js";

/** Returns active teachers that can be assigned to a timetable slot. */
export const getTeachers = async (req: Request, res: Response) => {
  // Faculty are college-wide; their department is only their home department.
  const teachers = await User.find({
    role: ROLES.TEACHER,
    isActive: true,
  })
    .select("name email departmentId")
    .populate("departmentId", "name code")
    .sort({ name: 1 })
    .lean();

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    "Teachers fetched successfully",
    teachers.map((teacher) => ({
      id: teacher._id.toString(),
      name: teacher.name,
      email: teacher.email,
      primaryDepartment: teacher.departmentId && typeof teacher.departmentId === "object"
        ? { id: (teacher.departmentId as any)._id.toString(), name: (teacher.departmentId as any).name, code: (teacher.departmentId as any).code }
        : undefined,
    })),
  );
};

export const createTeacher = async (req: Request, res: Response) => {
  const departmentId = req.user?.departmentId;
  if (!departmentId)
    throw new AppError(
      "Department ID not found in request.",
      HTTP_STATUS.BAD_REQUEST,
    );
  const { name, email } = req.body as { name: string; email: string };

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser && existingUser.isActive) {
    throw new AppError(
      "A user with this email already exists and is active.",
      HTTP_STATUS.CONFLICT,
    );
  }

  // Generate 6-digit setup code
  const setupCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedCode = crypto
    .createHash("sha256")
    .update(setupCode)
    .digest("hex");
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

  const department = await Department.findById(departmentId).select("name");

  let teacher;
  if (existingUser && !existingUser.isActive) {
    existingUser.name = name;
    existingUser.departmentId = departmentId as any;
    existingUser.passwordSetupCodeHash = hashedCode;
    existingUser.passwordSetupExpiresAt = expiresAt;
    await existingUser.save();
    teacher = existingUser;
  } else {
    teacher = await User.create({
      name,
      email: email.toLowerCase(),
      password: await hashPassword(crypto.randomBytes(32).toString("hex")),
      role: ROLES.TEACHER,
      departmentId,
      isActive: false,
      passwordSetupCodeHash: hashedCode,
      passwordSetupExpiresAt: expiresAt,
    });
  }

  // Send invitation email
  let emailSent = false;
  try {
    await sendTeacherInviteEmail({
      toEmail: email.toLowerCase(),
      teacherName: name,
      departmentName: department?.name,
      setupCode,
    });
    emailSent = true;
  } catch (err: any) {
    console.error("[Email] Failed to send invite email:", err?.message || err);
  }

  sendSuccess(
    res,
    HTTP_STATUS.CREATED,
    emailSent
      ? `Invitation email sent to ${email} with setup code.`
      : `Teacher invited! (Email delivery failed, share setup code: ${setupCode})`,
    {
      id: teacher._id.toString(),
      name: teacher.name,
      email: teacher.email,
      setupCode,
      emailSent,
    },
  );
};

const teacherResponse = (teacher: any) => ({ id: teacher._id.toString(), name: teacher.name, email: teacher.email, isActive: teacher.isActive });
const findDepartmentTeacher = async (id: string, departmentId: string) => {
  const teacher = await User.findOne({ _id: id, departmentId, role: ROLES.TEACHER });
  if (!teacher) throw new AppError("Faculty member not found in your department.", HTTP_STATUS.NOT_FOUND);
  return teacher;
};
export const getTeacher = async (req: Request, res: Response) => {
  const departmentId = req.user?.departmentId;
  if (!departmentId) throw new AppError("Department ID not found in request.", HTTP_STATUS.BAD_REQUEST);
  sendSuccess(res, HTTP_STATUS.OK, "Faculty member fetched successfully", teacherResponse(await findDepartmentTeacher(req.params.id as string, departmentId)));
};
export const updateTeacher = async (req: Request, res: Response) => {
  const departmentId = req.user?.departmentId;
  if (!departmentId) throw new AppError("Department ID not found in request.", HTTP_STATUS.BAD_REQUEST);
  const teacher = await findDepartmentTeacher(req.params.id as string, departmentId);
  const { name, email, isActive } = req.body as { name?: string; email?: string; isActive?: boolean };
  if (email && email !== teacher.email) {
    if (await User.exists({ email: email.toLowerCase(), _id: { $ne: teacher._id } })) throw new AppError("A user with this email already exists.", HTTP_STATUS.CONFLICT);
    teacher.email = email.toLowerCase();
  }
  if (name !== undefined) teacher.name = name;
  if (isActive !== undefined) teacher.isActive = isActive;
  await teacher.save();
  sendSuccess(res, HTTP_STATUS.OK, "Faculty member updated successfully", teacherResponse(teacher));
};
export const deleteTeacher = async (req: Request, res: Response) => {
  const departmentId = req.user?.departmentId;
  if (!departmentId) throw new AppError("Department ID not found in request.", HTTP_STATUS.BAD_REQUEST);
  const teacher = await findDepartmentTeacher(req.params.id as string, departmentId);
  teacher.isActive = false;
  await teacher.save();
  sendSuccess(res, HTTP_STATUS.OK, "Faculty member deleted successfully", teacherResponse(teacher));
};

/** Lists active students, optionally for one selected class. */
export const getStudents = async (req: Request, res: Response) => {
  const departmentId = typeof req.query.departmentId === "string" ? req.query.departmentId : undefined;
  const year = typeof req.query.year === "string" ? Number(req.query.year) : undefined;
  const academicYear = typeof req.query.academicYear === "string" ? req.query.academicYear : undefined;
  const students = await User.find({
    role: ROLES.STUDENT,
    isActive: true,
    ...(departmentId ? { departmentId } : {}),
    ...(year ? { year } : {}),
    ...(academicYear ? { academicYear } : {}),
  })
    .select("name email rollNumber departmentId year academicYear isActive")
    .sort({ rollNumber: 1, name: 1 })
    .lean();

  sendSuccess(res, HTTP_STATUS.OK, "Students fetched successfully", students.map((student) => ({
    id: student._id.toString(),
    name: student.name,
    email: student.email,
    rollNumber: student.rollNumber,
    departmentId: student.departmentId?.toString(),
    year: student.year,
    academicYear: student.academicYear,
    isActive: student.isActive,
  })));
};

/** Creates an active student account in the selected class's department. */
export const createStudent = async (req: Request, res: Response) => {
  const { name, rollNumber, departmentId, year, academicYear } = req.body as {
    name: string; rollNumber: number; departmentId: string; year: number; academicYear: string;
  };
  const department = await Department.exists({ _id: departmentId, isDeleted: false });
  if (!department) {
    throw new AppError("Choose an active department.", HTTP_STATUS.NOT_FOUND);
  }
  const existing = await User.findOne({ rollNumber });
  if (existing) {
    throw new AppError("A student with this roll number already exists.", HTTP_STATUS.CONFLICT);
  }

  const student = await User.create({
    name,
    // Students do not log in, so do not require or expose a personal email.
    // The User model retains email for faculty accounts; this internal value
    // keeps its legacy required/unique constraint satisfied.
    email: `student-${crypto.randomUUID()}@internal.invalid`,
    // Students have no portal. This is an unshared random credential required
    // by the legacy User schema and cannot be used to sign in.
    password: await hashPassword(crypto.randomBytes(32).toString("hex")),
    role: ROLES.STUDENT,
    rollNumber,
    departmentId,
    year,
    academicYear,
    isActive: true,
  });

  sendSuccess(res, HTTP_STATUS.CREATED, "Student added successfully", {
    id: student._id.toString(), name: student.name, email: student.email,
    rollNumber: student.rollNumber, departmentId: student.departmentId.toString(), year: student.year, academicYear: student.academicYear, isActive: student.isActive,
  });
};

const studentResponse = (student: any) => ({ id: student._id.toString(), name: student.name, email: student.email, rollNumber: student.rollNumber, departmentId: student.departmentId?.toString(), year: student.year, academicYear: student.academicYear, isActive: student.isActive });

const findManagedStudent = async (id: string) => {
  const student = await User.findOne({ _id: id, role: ROLES.STUDENT });
  if (!student) throw new AppError("Student not found.", HTTP_STATUS.NOT_FOUND);
  return student;
};

export const getStudent = async (req: Request, res: Response) => {
  sendSuccess(res, HTTP_STATUS.OK, "Student fetched successfully", studentResponse(await findManagedStudent(req.params.id as string)));
};

export const updateStudent = async (req: Request, res: Response) => {
  const student = await findManagedStudent(req.params.id as string);
  const { name, email, rollNumber, departmentId, year, academicYear, isActive } = req.body as { name?: string; email?: string; rollNumber?: number; departmentId?: string; year?: number; academicYear?: string; isActive?: boolean };
  if (departmentId) {
    const department = await Department.exists({ _id: departmentId, isDeleted: false });
    if (!department) throw new AppError("Choose an active department.", HTTP_STATUS.NOT_FOUND);
    student.departmentId = departmentId as any;
  }
  if (email && email !== student.email) {
    if (await User.exists({ email: email.toLowerCase(), _id: { $ne: student._id } })) throw new AppError("A user with this email already exists.", HTTP_STATUS.CONFLICT);
    student.email = email.toLowerCase();
  }
  if (rollNumber !== undefined && rollNumber !== student.rollNumber) {
    if (await User.exists({ rollNumber, _id: { $ne: student._id } })) throw new AppError("A user with this roll number already exists.", HTTP_STATUS.CONFLICT);
    student.rollNumber = rollNumber;
  }
  if (name !== undefined) student.name = name;
  if (year !== undefined) student.year = year;
  if (academicYear !== undefined) student.academicYear = academicYear;
  if (isActive !== undefined) student.isActive = isActive;
  await student.save();
  sendSuccess(res, HTTP_STATUS.OK, "Student updated successfully", studentResponse(student));
};

// Soft delete preserves existing attendance records for audits.
export const deleteStudent = async (req: Request, res: Response) => {
  const student = await findManagedStudent(req.params.id as string);
  student.isActive = false;
  await student.save();
  sendSuccess(res, HTTP_STATUS.OK, "Student deleted successfully", studentResponse(student));
};
