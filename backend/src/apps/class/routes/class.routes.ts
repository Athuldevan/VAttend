import { Router } from "express";

import {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass,
} from "../controller/class.controller.js";

import { ROLES } from "../../../shared/constants/roles.js";

import {
  createClassSchema,
  updateClassSchema,
  classIdParamSchema,
} from "../validations/class.validation.js";
import { authenticate } from "../../../middleware/auth.middleware.js";
import { authorize } from "../../../middleware/authorize.middleware.js";
import { validate } from "../../../middleware/validate.middleware.js";



const router = Router();


// GET /api/v1/classes
router.get(
  "/",
  authenticate,
  getClasses,
);


// GET /api/v1/classes/:id
router.get(
  "/:id",
  authenticate,
  validate(classIdParamSchema),
  getClassById,
);


// POST /api/v1/classes
router.post(
  "/",
  authenticate,
  authorize(ROLES.ADMIN),
  validate(createClassSchema),
  createClass,
);


// PATCH /api/v1/classes/:id
router.patch(
  "/:id",
  authenticate,
  authorize(ROLES.ADMIN),
  validate(classIdParamSchema),
  validate(updateClassSchema),
  updateClass,
);


// DELETE /api/v1/classes/:id
router.delete(
  "/:id",
  authenticate,
  authorize(ROLES.ADMIN),
  validate(classIdParamSchema),
  deleteClass,
);


export default router;