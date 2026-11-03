import mongoose from "mongoose";
import "../config/env.js";
import { connectDB } from "../config/db.js";
import { Department } from "../apps/department/modal/department.modal.js";
import User from "../apps/user/user.model.js";
import { ROLES } from "../../constants/roles.js";
import { hashPassword } from "../../utils/password.js";

const USER_EMAIL = "richu@gmail.com";
const USER_PASSWORD = "richu@123";

async function seedRichu(): Promise<void> {
  await connectDB();

  // Ensure department exists
  let department = await Department.findOne({ isDeleted: false });
  if (!department) {
    department = await Department.create({
      name: "Computer Science",
      code: "CS",
      isDeleted: false,
    });
  }

  const hashedPassword = await hashPassword(USER_PASSWORD);

  // Check if user already exists
  let user = await User.findOne({ email: USER_EMAIL.toLowerCase() });
  if (user) {
    user.password = hashedPassword;
    user.isActive = true;
    user.departmentId = department._id as any;
    user.name = "Richu";
    await user.save();
    console.log(`Updated user ${USER_EMAIL} with new password and department: ${department.name}`);
  } else {
    user = await User.create({
      name: "Richu",
      email: USER_EMAIL.toLowerCase(),
      password: hashedPassword,
      role: ROLES.TEACHER,
      departmentId: department._id,
      isActive: true,
    });
    console.log(`Created user ${USER_EMAIL} with role ${ROLES.TEACHER}`);
  }
}

seedRichu()
  .catch((error: unknown) => {
    console.error("Failed to seed richu:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
