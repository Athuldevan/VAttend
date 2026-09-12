import mongoose, { Schema } from "mongoose";
import type { IUserDocument } from "./user.types.js";
import { ROLES } from "../../shared/constants/roles.js";

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    rollNumber: {
      type: Number,
      required: [true, "Roll number is required"],
      unique: true,
      index: true,
    },
    class: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: [true, "Class is required"],
      index: true,
    },
    role: {
      type: String,
      enum: {
        values: Object.values(ROLES),
        message: "Role must be one of: ADMIN, TEACHER, STUDENT",
      },
      required: [true, "Role is required"],
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    refreshTokenHash: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

// Compound index useful for department-scoped user queries
userSchema.index({ departmentId: 1, role: 1 });

const User = mongoose.model<IUserDocument>("User", userSchema);

export default User;
