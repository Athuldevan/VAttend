import mongoose from "mongoose";
import "../config/env.js";
import { connectDB } from "../config/db.js";
import { Department } from "../apps/department/modal/department.modal.js";
import User from "../apps/user/user.model.js";
import { ROLES } from "../../constants/roles.js";
import { hashPassword } from "../../utils/password.js";

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "Admin@12345";

async function seedAdmin(): Promise<void> {
  await connectDB();

  const department = await Department.findOneAndUpdate(
    { code: "ADMIN" },
    {
      $setOnInsert: {
        name: "Administration",
        code: "ADMIN",
        isDeleted: false,
      },
    },
    { new: true, upsert: true },
  );

  const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
  if (existingAdmin) {
    console.log(`Admin already exists: ${ADMIN_EMAIL}`);
    return;
  }

  await User.create({
    name: "System Admin",
    email: ADMIN_EMAIL,
    password: await hashPassword(ADMIN_PASSWORD),
    role: ROLES.ADMIN,
    departmentId: department._id,
    isActive: true,
  });

  console.log(`Admin created: ${ADMIN_EMAIL}`);
}

seedAdmin()
  .catch((error: unknown) => {
    console.error("Failed to seed admin:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });