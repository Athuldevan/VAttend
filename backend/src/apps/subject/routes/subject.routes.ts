import { Router } from "express";
import { authenticate } from "../../../middleware/auth.middleware.js";
import { authorize } from "../../../middleware/authorize.middleware.js";
import { ROLES } from "../../../shared/constants/roles.js";
import { getSubjects, createSubject } from "../controller/subject.controller.js";
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
  validate(z.object({ name: z.string().trim().min(2, "Subject name must be at least 2 characters"), semester: z.coerce.number().int().min(1) })),
  createSubject,
);

export default router;
