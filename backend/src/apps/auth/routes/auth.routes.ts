import { Router } from "express";
import * as authController from "../controller/auth.controller.js";
import { validate } from "../../../middleware/validate.middleware.js";
import { authenticate } from "../../../middleware/auth.middleware.js";
import { registerSchema, registerWithDepartmentSchema, setPasswordSchema, loginSchema } from "../auth.validation.js";

const   router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post(
  "/register-with-department",
  validate(registerWithDepartmentSchema),
  authController.registerWithDepartment,
);
router.post("/set-password", validate(setPasswordSchema), authController.setPassword);
router.get("/registration-departments", authController.getRegistrationDepartments);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.getMe);

export default router;
