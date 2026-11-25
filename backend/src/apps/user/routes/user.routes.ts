import { Router } from "express";
import { authenticate } from "../../../middleware/auth.middleware.js";
import { authorize } from "../../../middleware/authorize.middleware.js";
import { ROLES } from "../../../shared/constants/roles.js";
import { getTeachers, getTeacher, createTeacher, updateTeacher, deleteTeacher, getStudents, getStudent, createStudent, updateStudent, deleteStudent } from "../controller/user.controller.js";
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
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  validate(z.object({ name: z.string().trim().min(2), email: z.string().trim().email().toLowerCase() })),
  createTeacher,
);
const teacherIdParams = z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/, "id must be a valid MongoDB ObjectId") });
router.get("/teachers/:id", authenticate, authorize(ROLES.ADMIN, ROLES.TEACHER), validate(teacherIdParams, "params"), getTeacher);
router.patch("/teachers/:id", authenticate, authorize(ROLES.ADMIN, ROLES.TEACHER), validate(teacherIdParams, "params"), validate(z.object({ name: z.string().trim().min(2).optional(), email: z.string().trim().email().toLowerCase().optional(), isActive: z.boolean().optional() }).refine((value) => Object.keys(value).length > 0, "At least one field is required")), updateTeacher);
router.delete("/teachers/:id", authenticate, authorize(ROLES.ADMIN, ROLES.TEACHER), validate(teacherIdParams, "params"), deleteTeacher);

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
    rollNumber: z.coerce.number().int().positive(),
    classId: z.string().regex(/^[0-9a-fA-F]{24}$/, "classId must be a valid MongoDB ObjectId"),
  })),
  createStudent,
);

const studentIdParams = z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/, "id must be a valid MongoDB ObjectId") });

router.get("/students/:id", authenticate, authorize(ROLES.ADMIN, ROLES.TEACHER), validate(studentIdParams, "params"), getStudent);
router.patch(
  "/students/:id", authenticate, authorize(ROLES.ADMIN, ROLES.TEACHER), validate(studentIdParams, "params"),
  validate(z.object({
    name: z.string().trim().min(2).optional(), email: z.string().trim().email().toLowerCase().optional(),
    rollNumber: z.coerce.number().int().positive().optional(),
    classId: z.string().regex(/^[0-9a-fA-F]{24}$/, "classId must be a valid MongoDB ObjectId").optional(),
    isActive: z.boolean().optional(),
  }).refine((value) => Object.keys(value).length > 0, "At least one field is required")), updateStudent,
);
router.delete("/students/:id", authenticate, authorize(ROLES.ADMIN, ROLES.TEACHER), validate(studentIdParams, "params"), deleteStudent);

export default router;
