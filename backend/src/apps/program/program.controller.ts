import type { Request, Response } from "express";

import {
  createProgramService,
  getProgramsService,
  getProgramByIdService,
  updateProgramService,
  deleteProgramService,
} from "./program.service.js";

import type {
  CreateProgramBody,
  UpdateProgramBody,
  ProgramIdParams,
} from "./program.validation.js";
import { sendSuccess } from "../../../utils/apiResponse.js";
import { HTTP_STATUS } from "../../../utils/errorCodes.js";

// CREATE
export const createProgram = async (
  req: Request<{}, {}, CreateProgramBody>,
  res: Response,
) => {
  const program = await createProgramService(req.body);

  sendSuccess(
    res,
    HTTP_STATUS.CREATED,
    "Program created successfully",
    program,
  );
};

// GET ALL
export const getPrograms = async (req: Request, res: Response) => {
  const departmentId = req.query.departmentId as string;

  const programs = await getProgramsService(departmentId);

  sendSuccess(res, HTTP_STATUS.OK, "Programs fetched successfully", programs);
};

// GET BY ID
export const getProgramById = async (
  req: Request<ProgramIdParams>,
  res: Response,
) => {
  const program = await getProgramByIdService(req.params.id);

  sendSuccess(res, HTTP_STATUS.OK, "Program fetched successfully", program);
};

// UPDATE
export const updateProgram = async (
  req: Request<ProgramIdParams, {}, UpdateProgramBody>,
  res: Response,
) => {
  const program = await updateProgramService(req.params.id, req.body);

  sendSuccess(res, HTTP_STATUS.OK, "Program updated successfully", program);
};

// DELETE
export const deleteProgram = async (
  req: Request<ProgramIdParams>,
  res: Response,
) => {
  await deleteProgramService(req.params.id);

  sendSuccess(res, HTTP_STATUS.OK, "Program deleted successfully", null);
};
