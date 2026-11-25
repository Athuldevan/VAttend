import type { Request, Response } from "express";
import Subject from "../model/subject.model.js";
import { AppError } from "../../../../utils/AppError.js";
import { HTTP_STATUS } from "../../../../utils/errorCodes.js";
import { sendSuccess } from "../../../../utils/apiResponse.js";
import { ROLES } from "../../../shared/constants/roles.js";
import { Department } from "../../department/modal/department.modal.js";

/** Returns subjects from the signed-in user's department. */
export const getSubjects = async (req: Request, res: Response) => {
  const departmentId = req.user?.departmentId;

  if (!departmentId) {
    throw new AppError("Department ID not found in request.", HTTP_STATUS.BAD_REQUEST);
  }

  const semesterParam = req.query.semester;
  const semester =
    typeof semesterParam === "string" && semesterParam.trim() !== ""
      ? Number(semesterParam)
      : undefined;

  if (semester !== undefined && (!Number.isInteger(semester) || semester < 1)) {
    throw new AppError("Semester must be a positive whole number.", HTTP_STATUS.BAD_REQUEST);
  }

  // `mongoose.models.Subject` is typed as a generic model in this project;
  // cast here to retain the concrete filter shape for the lookup query.
  const subjects = await (Subject as any).find(
    semester === undefined
      ? { departmentId }
      : {
          departmentId,
          $or: [
            { semester },
            { semester: { $exists: false } },
            { semester: null },
          ],
        },
  )
    .sort({ name: 1 })
    .lean();

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    "Subjects fetched successfully",
    subjects.map((subject: { _id: { toString(): string }; name: string; code?: string; semester?: number }) => ({
      id: subject._id.toString(),
      name: subject.name,
      code: subject.code,
      semester: subject.semester,
    })),
  );
};

export const createSubject = async (req: Request, res: Response) => {
  const departmentId = req.user?.departmentId;
  if (!departmentId) throw new AppError("Department ID not found in request.", HTTP_STATUS.BAD_REQUEST);
  const { name, semester, departmentId: selectedDepartmentId } = req.body as { name: string; semester: number; departmentId: string };
  const targetDepartment = await Department.exists({ _id: selectedDepartmentId, isDeleted: false });
  if (!targetDepartment) throw new AppError("Choose an active department.", HTTP_STATUS.BAD_REQUEST);
  const existing = await (Subject as any).findOne({ departmentId: selectedDepartmentId, name, semester });
  if (existing) throw new AppError("This subject already exists for the selected semester.", HTTP_STATUS.CONFLICT);
  const subject = await (Subject as any).create({ departmentId: selectedDepartmentId, name, semester });
  sendSuccess(res, HTTP_STATUS.CREATED, "Subject created successfully", {
    id: subject._id.toString(), name: subject.name, semester: subject.semester,
  });
};

export const updateSubject = async (req: Request, res: Response) => {
  const departmentId = req.user?.departmentId;
  if (!departmentId) throw new AppError("Department ID not found in request.", HTTP_STATUS.BAD_REQUEST);
  const subject = await (Subject as any).findOne({ _id: req.params.id, departmentId });
  if (!subject) throw new AppError("Subject not found in your department.", HTTP_STATUS.NOT_FOUND);
  const { name, code, semester } = req.body as { name?: string; code?: string; semester?: number };
  if (name !== undefined) subject.name = name;
  if (code !== undefined) subject.code = code;
  if (semester !== undefined) subject.semester = semester;
  await subject.save();
  sendSuccess(res, HTTP_STATUS.OK, "Subject updated successfully", { id: subject._id.toString(), name: subject.name, code: subject.code, semester: subject.semester });
};

export const deleteSubject = async (req: Request, res: Response) => {
  const departmentId = req.user?.departmentId;
  if (!departmentId) throw new AppError("Department ID not found in request.", HTTP_STATUS.BAD_REQUEST);
  const subject = await (Subject as any).findOneAndDelete({ _id: req.params.id, departmentId });
  if (!subject) throw new AppError("Subject not found in your department.", HTTP_STATUS.NOT_FOUND);
  sendSuccess(res, HTTP_STATUS.OK, "Subject deleted successfully", null);
};
