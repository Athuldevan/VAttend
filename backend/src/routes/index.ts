import { Router } from "express";
import authRoutes from "../apps/auth/routes/auth.routes.js";
import departmentRoutes from "../apps/department/routes/department.routes.js";
import programRoutes from "../apps/program/program.routes.js";
import classRoutes from "../apps/class/routes/class.routes.js";
import timetableRoutes from "../apps/timetable/router.js";
``;

const router = Router();

router.use("/auth", authRoutes);
router.use("/departments", departmentRoutes);
router.use("/programs", programRoutes);
router.use("/classes", classRoutes);
router.use("/timetable", timetableRoutes);

export default router;
