import { Department } from "../modal/department.modal.js";

import type {
  CreateDepartmentBody,
  UpdateDepartmentBody,
} from "../validators/department.validators.js";


// CREATE
export async function createDepartmentService(
  input: CreateDepartmentBody,
) {
  const existingDepartment = await Department.findOne({
    code: input.code,
    isDeleted: false,
  });

  if (existingDepartment) {
    throw new Error("Department with this code already exists");
  }

  const department = await Department.create(input);

  return department;
}


// GET ALL
export async function getDepartmentsService() {
  const departments = await Department.find({
    isDeleted: false,
  }).sort({
    name: 1,
  });

  return departments;
}


// GET BY ID
export async function getDepartmentByIdService(
  departmentId: string,
) {
  const department = await Department.findOne({
    _id: departmentId,
    isDeleted: false,
  });

  if (!department) {
    throw new Error("Department not found");
  }

  return department;
}


// UPDATE
export async function updateDepartmentService(
  departmentId: string,
  input: UpdateDepartmentBody,
) {
  const department = await Department.findOne({
    _id: departmentId,
    isDeleted: false,
  });

  if (!department) {
    throw new Error("Department not found");
  }

  if (input.code && input.code !== department.code) {
    const existingDepartment = await Department.findOne({
      code: input.code,
      _id: { $ne: departmentId },
      isDeleted: false,
    });

    if (existingDepartment) {
      throw new Error(
        "Department with this code already exists",
      );
    }
  }

  Object.assign(department, input);

  await department.save();

  return department;
}


// SOFT DELETE
export async function deleteDepartmentService(
  departmentId: string,
) {
  const department = await Department.findOne({
    _id: departmentId,
    isDeleted: false,
  });

  if (!department) {
    throw new Error("Department not found");
  }

  department.isDeleted = true;

  await department.save();

  return department;
}


// RESTORE
export async function restoreDepartmentService(
  departmentId: string,
) {
  const department = await Department.findOne({
    _id: departmentId,
    isDeleted: true,
  });

  if (!department) {
    throw new Error("Deleted department not found");
  }

  const duplicateCode = await Department.findOne({
    code: department.code,
    isDeleted: false,
    _id: { $ne: departmentId },
  });

  if (duplicateCode) {
    throw new Error(
      "Another active department already uses this code",
    );
  }

  department.isDeleted = false;

  await department.save();

  return department;
}