import { Router } from "express";
import authRoutes from "../modules/auth/routes/auth.routes.js";
import departmentRoutes from "../modules/department/routes/department.routes.js";
import programRoutes from "../modules/program/program.routes.js";
import classRoutes from "../modules/class/routes/class.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/departments", departmentRoutes);
router.use("/programs", programRoutes);
router.use("/classes", classRoutes);

export default router;
