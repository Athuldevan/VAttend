import { Router } from "express";

import {
  createProgram,
  getPrograms,
  getProgramById,
  updateProgram,
  deleteProgram,
} from "./program.controller.js";



import { ROLES } from "../../../constants/roles.js";

import {
  createProgramSchema,
  updateProgramSchema,
  programIdParamSchema,
} from "./program.validation.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";

const router = Router();


// GET /api/v1/programs?departmentId=
router.get(
  "/",
  authenticate,
//   validate(getProgramsQuerySchema),
  getPrograms,
);


// GET /api/v1/programs/:id
router.get(
  "/:id",
  authenticate,
  validate(programIdParamSchema),
  getProgramById,
);


// POST /api/v1/programs
router.post(
  "/",
  authenticate,
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  validate(createProgramSchema),
  createProgram,
);


// PATCH /api/v1/programs/:id
router.patch(
  "/:id",
  authenticate,
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  validate(programIdParamSchema),
  validate(updateProgramSchema),
  updateProgram,
);


// DELETE /api/v1/programs/:id
router.delete(
  "/:id",
  authenticate,
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  validate(programIdParamSchema),
  deleteProgram,
);


export default router;