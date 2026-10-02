import { Router } from "express";

import {
  getMyTimetable,
  createTimetable,
  updateTimetable,
  deleteTimetable,
} from "./controller/timeTable.controller.js";

import { ROLES } from "../../../constants/roles.js";

import {
  createTimetableSchema,
  updateTimetableSchema,
  timetableIdParamSchema,
  getClassTimetableQuerySchema,
} from "./timtable.validator.js";

import { getClassTimetable } from "./controller/timeTable.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { authorize } from "../../middleware/authorize.middleware.js";

const router = Router();

// GET /api/v1/timetable?classId=...

router.get(
  "/",
  authenticate,
  validate(getClassTimetableQuerySchema),
  getClassTimetable,
);

// GET /api/v1/timetable/me

router.get("/me", authenticate, authorize(ROLES.TEACHER), getMyTimetable);

// POST /api/v1/timetable

router.post(
  "/",
  authenticate,
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  validate(createTimetableSchema),
  createTimetable,
);

// PATCH /api/v1/timetable/:id

router.patch(
  "/:id",
  authenticate,
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  validate(timetableIdParamSchema),
  validate(updateTimetableSchema),
  updateTimetable,
);

// DELETE /api/v1/timetable/:id

router.delete(
  "/:id",
  authenticate,
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  validate(timetableIdParamSchema),
  deleteTimetable,
);

export default router;
