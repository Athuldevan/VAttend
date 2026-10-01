import { Program } from "../../program/program.modal.js";
import { Department } from "../../department/modal/department.modal.js";
import { Class } from "../model/class.model.js";
import { Types } from "mongoose";
import type {
  CreateClassBody,
  UpdateClassBody,
} from "../validations/class.validation.js";

// CREATE
export async function createClassService(input: CreateClassBody) {
  const { programId, departmentId, ...classInput } = input;
  const department = await Department.findById(input.departmentId);

  if (!department) {
    throw new Error("Department not found");
  }

  if (programId) {
    const program = await Program.findById(programId);

    if (!program) {
      throw new Error("Program not found");
    }

    // Program must belong to department
    if (program.departmentId.toString() !== input.departmentId) {
      throw new Error("Program does not belong to the specified department");
    }

    // Year cannot exceed program duration
    if (input.year > program.durationYears) {
      throw new Error(
        `Year cannot exceed program duration of ${program.durationYears} years`,
      );
    }
  }

  // Semester validation
  if (input.currentSemester > input.year * 2) {
    throw new Error("Current semester is invalid for the selected year");
  }

  // Duplicate check
  const existingClass = await Class.findOne({
    departmentId: new Types.ObjectId(input.departmentId),
    ...(programId
      ? { programId: new Types.ObjectId(programId) }
      : { programId: { $exists: false } }),
    year: input.year,
    academicYear: input.academicYear,
  });

  if (existingClass) {
    throw new Error(
      "Class already exists for this program, year and academic year",
    );
  }

  const classData = await Class.create({
    ...classInput,
    departmentId: new Types.ObjectId(departmentId),
    ...(programId && { programId: new Types.ObjectId(programId) }),
  });

  return classData;
}

// GET ALL
export async function getClassesService(departmentId?: string) {
  const filter = departmentId
    ? { departmentId: new Types.ObjectId(departmentId) }
    : {};

  const classes = await Class.find(filter)
    .populate("programId", "name level durationYears")
    .populate("departmentId", "name code")
    .sort({
      year: 1,
      academicYear: -1,
    });

  return classes;
}

// GET BY ID
export async function getClassByIdService(classId: string) {
  const classData = await Class.findById(classId)
    .populate("programId", "name level durationYears")
    .populate("departmentId", "name code");

  if (!classData) {
    throw new Error("Class not found");
  }

  return classData;
}

// UPDATE
export async function updateClassService(
  classId: string,
  input: UpdateClassBody,
) {
  const classData = await Class.findById(classId);

  if (!classData) {
    throw new Error("Class not found");
  }

  const programId = input.programId ?? classData.programId?.toString();

  const departmentId = input.departmentId ?? classData.departmentId.toString();

  const year = input.year ?? classData.year;

  const academicYear = input.academicYear ?? classData.academicYear;

  const currentSemester = input.currentSemester ?? classData.currentSemester;

  if (programId) {
    const program = await Program.findById(programId);

    if (!program) {
      throw new Error("Program not found");
    }

    // Program must belong to department
    if (program.departmentId.toString() !== departmentId) {
      throw new Error("Program does not belong to the specified department");
    }

    // Year cannot exceed program duration
    if (year > program.durationYears) {
      throw new Error(
        `Year cannot exceed program duration of ${program.durationYears} years`,
      );
    }
  }

  // Semester validation
  if (currentSemester > year * 2) {
    throw new Error("Current semester is invalid for the selected year");
  }

  // Check duplicate
  const duplicateClass = await Class.findOne({
    departmentId: new Types.ObjectId(departmentId),
    ...(programId
      ? { programId: new Types.ObjectId(programId) }
      : { programId: { $exists: false } }),
    year,
    academicYear,
    _id: {
      $ne: classId,
    },
  });

  if (duplicateClass) {
    throw new Error(
      "Another class already exists for this program, year and academic year",
    );
  }

  Object.assign(classData, input);

  await classData.save();

  return classData;
}

// DELETE
export async function deleteClassService(classId: string) {
  const classData = await Class.findById(classId);

  if (!classData) {
    throw new Error("Class not found");
  }
  await Class.findByIdAndDelete(classId);

  return null;
}
