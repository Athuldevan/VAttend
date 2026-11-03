import { Router } from "express";
import authRoutes from "../apps/auth/routes/auth.routes.js";
import departmentRoutes from "../apps/department/routes/department.routes.js";
import programRoutes from "../apps/program/program.routes.js";
import classRoutes from "../apps/class/routes/class.routes.js";
import timetableRoutes from "../apps/timetable/router.js";
import attendanceRoutes from "../apps/attendance/routes/attendance.routes.js";
import userRoutes from "../apps/user/routes/user.routes.js";
import subjectRoutes from "../apps/subject/routes/subject.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/departments", departmentRoutes);
router.use("/programs", programRoutes);
router.use("/classes", classRoutes);
router.use("/timetable", timetableRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/users", userRoutes);
router.use("/subjects", subjectRoutes);

export default router;

