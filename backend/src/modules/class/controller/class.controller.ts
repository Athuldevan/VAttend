import type {
  Request,
  Response,
} from "express";

import {
  sendSuccess,
} from "../../../shared/utils/apiResponse.js";

import {
  HTTP_STATUS,
} from "../../../shared/errors/errorCodes.js";

import {
  createClassService,
  getClassesService,
  getClassByIdService,
  updateClassService,
  deleteClassService,
} from "../services/class.service.js";

import type {
  CreateClassBody,
  UpdateClassBody,
  ClassIdParams,
} from "../validations/class.validation.js";


// CREATE
export const createClass = async (
  req: Request<
    {},
    {},
    CreateClassBody
  >,
  res: Response,
) => {
  const classData =
    await createClassService(
      req.body,
    );

  sendSuccess(
    res,
    HTTP_STATUS.CREATED,
    "Class created successfully",
    classData,
  );
};


// GET ALL
export const getClasses = async (
  req: Request,
  res: Response,
) => {
  const departmentId =
    req.query.departmentId as
      | string
      | undefined;

  const classes =
    await getClassesService(
      departmentId,
    );

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    "Classes fetched successfully",
    classes,
  );
};


// GET BY ID
export const getClassById = async (
  req: Request<ClassIdParams>,
  res: Response,
) => {
  const classData =
    await getClassByIdService(
      req.params.id,
    );

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    "Class fetched successfully",
    classData,
  );
};


// UPDATE
export const updateClass = async (
  req: Request<
    ClassIdParams,
    {},
    UpdateClassBody
  >,
  res: Response,
) => {
  const classData =
    await updateClassService(
      req.params.id,
      req.body,
    );

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    "Class updated successfully",
    classData,
  );
};


// DELETE
export const deleteClass = async (
  req: Request<ClassIdParams>,
  res: Response,
) => {
  await deleteClassService(
    req.params.id,
  );

  sendSuccess(
    res,
    HTTP_STATUS.OK,
    "Class deleted successfully",
    null,
  );
};