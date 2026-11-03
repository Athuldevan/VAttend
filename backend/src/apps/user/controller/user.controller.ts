import type { Request, Response } from "express";
import User from "../user.model.js";
import { ROLES } from "../../../shared/constants/roles.js";
import { AppError } from "../../../../utils/AppError.js";
import { HTTP_STATUS } from "../../../../utils/errorCodes.js";
import { sendSuccess } from "../../../../utils/apiResponse.js";
import { hashPassword } from "../../../../utils/password.js";
import crypto from "crypto";

/** Returns active teachers that can be assigned to a timetable slot. */
export const getTeachers = async (req: Request, res: Response) => {
  const departmentId = req.user?.departmentId;

  if (!departmentId) {
    throw new AppError("Department ID not found in request.", HTTP_STATUS.BAD_REQUEST);
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
  if (!departmentId) throw new AppError("Department ID not found in request.", HTTP_STATUS.BAD_REQUEST);
  const { name, email } = req.body as { name: string; email: string };
  const teacher = await User.create({
    name,
    email,
    password: await hashPassword(crypto.randomBytes(32).toString("hex")),
    role: ROLES.TEACHER,
    departmentId,
    isActive: false,
  });
  sendSuccess(res, HTTP_STATUS.CREATED, "Teacher created. They can now register using this email.", {
    id: teacher._id.toString(), name: teacher.name, email: teacher.email,
  });
};
