import { Router } from "express";

import {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  restoreDepartment,
} from "../controller/department.controller.js";

import { authenticate } from "../../../middleware/auth.middleware.js";
import { authorize } from "../../../middleware/authorize.middleware.js";
import { validate } from "../../../middleware/validate.middleware.js";

import {
  createDepartmentSchema,
  updateDepartmentSchema,
  departmentIdParamSchema,
} from "../validators/department.validators.js";

const router = Router();

// GET ALL
router.get("/", authenticate, getDepartments);

// GET BY ID
router.get(
  "/:id",
  authenticate,
  validate(departmentIdParamSchema),
  getDepartmentById,
);

// CREATE
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createDepartmentSchema),
  createDepartment,
);

// UPDATE
router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(departmentIdParamSchema),
  validate(updateDepartmentSchema),
  updateDepartment,
);

// SOFT DELETE
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(departmentIdParamSchema),
  deleteDepartment,
);

// RESTORE
router.patch(
  "/:id/restore",
  authenticate,
  authorize("ADMIN"),
  validate(departmentIdParamSchema),
  restoreDepartment,
);

export default router ;
