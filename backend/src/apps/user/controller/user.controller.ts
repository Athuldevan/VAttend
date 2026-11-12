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
  const departmentId = req.user?.departmentId;

  if (!departmentId) {
    throw new AppError(
      "Department ID not found in request.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const teachers = await User.find({
    departmentId,
    role: ROLES.TEACHER,
    isActive: true,
  })
    .select("name email")
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

/** Lists the signed-in faculty member's department students, optionally by class. */
export const getStudents = async (req: Request, res: Response) => {
  const departmentId = req.user?.departmentId;
  if (!departmentId) throw new AppError("Department ID not found in request.", HTTP_STATUS.BAD_REQUEST);

  const classId = typeof req.query.classId === "string" ? req.query.classId : undefined;
  const students = await User.find({
    departmentId,
    role: ROLES.STUDENT,
    ...(classId ? { class: classId } : {}),
  })
    .select("name email rollNumber class isActive")
    .sort({ rollNumber: 1, name: 1 })
    .lean();

  sendSuccess(res, HTTP_STATUS.OK, "Students fetched successfully", students.map((student) => ({
    id: student._id.toString(),
    name: student.name,
    email: student.email,
    rollNumber: student.rollNumber,
    classId: student.class?.toString(),
    isActive: student.isActive,
  })));
};

/** Creates an active student account in a class belonging to the caller's department. */
export const createStudent = async (req: Request, res: Response) => {
  const departmentId = req.user?.departmentId;
  if (!departmentId) throw new AppError("Department ID not found in request.", HTTP_STATUS.BAD_REQUEST);

  const { name, email, password, rollNumber, classId } = req.body as {
    name: string; email: string; password: string; rollNumber: number; classId: string;
  };
  const classRecord = await Class.findOne({ _id: classId, departmentId });
  if (!classRecord) {
    throw new AppError("Choose a class from your department.", HTTP_STATUS.FORBIDDEN);
  }
  const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { rollNumber }] });
  if (existing) {
    throw new AppError("A user with this email or roll number already exists.", HTTP_STATUS.CONFLICT);
  }

  const student = await User.create({
    name,
    email: email.toLowerCase(),
    password: await hashPassword(password),
    role: ROLES.STUDENT,
    rollNumber,
    class: classRecord._id,
    departmentId,
    isActive: true,
  });

  sendSuccess(res, HTTP_STATUS.CREATED, "Student added successfully", {
    id: student._id.toString(), name: student.name, email: student.email,
    rollNumber: student.rollNumber, classId: student.class?.toString(), isActive: student.isActive,
  });
};
