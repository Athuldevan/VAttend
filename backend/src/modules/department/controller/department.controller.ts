import type { Request, Response } from "express";

import { sendSuccess } from "../../../shared/utils/apiResponse.js";
import { HTTP_STATUS } from "../../../shared/errors/errorCodes.js";

import {
  createDepartmentService,
  getDepartmentsService,
  getDepartmentByIdService,
  updateDepartmentService,
  deleteDepartmentService,
  restoreDepartmentService,
} from "../services/department.service.js";

import type {
  CreateDepartmentBody,
  UpdateDepartmentBody,
  DepartmentIdParams,
} from "../validators/department.validators.js";


// CREATE
export const createDepartment = async (
  req: Request<{}, {}, CreateDepartmentBody>,
  res: Response,
) => {
  const department = await createDepartmentService(
    req.body,
  );

  sendSuccess(
    res,
    HTTP_STATUS.CREATED,
    "Department created successfully",
    department,
  );
};


// GET ALL
export const getDepartments = async (
  req: Request,
  res: Response,
) => {
  const departments = await getDepartmentsService();

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    "Departments fetched successfully",
    departments,
  );
};


// GET BY ID
export const getDepartmentById = async (
  req: Request<DepartmentIdParams>,
  res: Response,
) => {
  const department = await getDepartmentByIdService(
    req.params.id,
  );

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    "Department fetched successfully",
    department,
  );
};


// UPDATE
export const updateDepartment = async (
  req: Request<
    DepartmentIdParams,
    {},
    UpdateDepartmentBody
  >,
  res: Response,
) => {
  const department = await updateDepartmentService(
    req.params.id,
    req.body,
  );

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    "Department updated successfully",
    department,
  );
};


// DELETE
export const deleteDepartment = async (
  req: Request<DepartmentIdParams>,
  res: Response,
) => {
  await deleteDepartmentService(req.params.id);

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    "Department deleted successfully",
    null,
  );
};


// RESTORE
export const restoreDepartment = async (
  req: Request<DepartmentIdParams>,
  res: Response,
) => {
  const department = await restoreDepartmentService(
    req.params.id,
  );

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    "Department restored successfully",
    department,
  );
};