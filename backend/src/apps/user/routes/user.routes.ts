import { Router } from "express";
import { authenticate } from "../../../middleware/auth.middleware.js";
import { authorize } from "../../../middleware/authorize.middleware.js";
import { ROLES } from "../../../shared/constants/roles.js";
import { getTeachers, createTeacher, getStudents, createStudent } from "../controller/user.controller.js";
import { z } from "zod";
import { validate } from "../../../middleware/validate.middleware.js";

const router = Router();

// Teachers and admins can assign any active teacher from their department.
router.get(
  "/teachers",
  authenticate,
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  getTeachers,
);
router.post(
  "/teachers",
  authenticate,
  authorize(ROLES.ADMIN),
  validate(z.object({ name: z.string().trim().min(2), email: z.string().trim().email().toLowerCase() })),
  createTeacher,
);

router.get(
  "/students",
  authenticate,
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  getStudents,
);
router.post(
  "/students",
  authenticate,
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  validate(z.object({
    name: z.string().trim().min(2),
    email: z.string().trim().email().toLowerCase(),
    password: z.string().min(5),
    rollNumber: z.coerce.number().int().positive(),
    classId: z.string().regex(/^[0-9a-fA-F]{24}$/, "classId must be a valid MongoDB ObjectId"),
  })),
  createStudent,
);

export default router;
