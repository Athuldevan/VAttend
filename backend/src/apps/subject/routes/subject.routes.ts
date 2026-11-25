import { Router } from "express";
import { authenticate } from "../../../middleware/auth.middleware.js";
import { authorize } from "../../../middleware/authorize.middleware.js";
import { ROLES } from "../../../shared/constants/roles.js";
import { getSubjects, createSubject, updateSubject, deleteSubject } from "../controller/subject.controller.js";
import { validate } from "../../../middleware/validate.middleware.js";
import { z } from "zod";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  getSubjects,
);
router.post(
  "/",
  authenticate,
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  validate(z.object({ name: z.string().trim().min(2, "Subject name must be at least 2 characters"), semester: z.coerce.number().int().min(1), departmentId: z.string().regex(/^[0-9a-fA-F]{24}$/, "departmentId must be a valid MongoDB ObjectId") })),
  createSubject,
);
const subjectIdParams = z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/, "id must be a valid MongoDB ObjectId") });
const subjectUpdateSchema = z.object({
  name: z.string().trim().min(2).optional(),
  code: z.string().trim().min(1).optional(),
  semester: z.coerce.number().int().min(1).optional(),
}).refine((value) => Object.keys(value).length > 0, "At least one field is required");
router.patch("/:id", authenticate, authorize(ROLES.ADMIN, ROLES.TEACHER), validate(subjectIdParams, "params"), validate(subjectUpdateSchema), updateSubject);
router.delete("/:id", authenticate, authorize(ROLES.ADMIN, ROLES.TEACHER), validate(subjectIdParams, "params"), deleteSubject);

export default router;
