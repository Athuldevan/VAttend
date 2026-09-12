import { Router } from "express";
import * as authController from "../controller/auth.controller.js";
import { validate } from "../../../middleware/validate.middleware.js";
import { authenticate } from "../../../middleware/auth.middleware.js";
import { registerSchema, loginSchema } from "../auth.validation.js";

const   router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.getMe);

export default router;
