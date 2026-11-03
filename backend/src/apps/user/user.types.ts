import type { Document, Types } from "mongoose";
import type { Role } from "../../shared/constants/roles.js";

/** Raw User document shape (excludes Mongoose internals). */
export interface IUser {
  name: string;
  email: string;
  password: string;
  role: Role;
  departmentId: Types.ObjectId;
  isActive: boolean;
  rollNumber? : number;
  class? : Types.ObjectId;
  refreshTokenHash?: string | undefined;
  passwordSetupCodeHash?: string | undefined;
  passwordSetupExpiresAt?: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
}

/** Mongoose document = IUser + Document helpers. */
export interface IUserDocument extends IUser, Document {}

/** Safe user data that can be returned in API responses (no secrets). */
export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  rollNumber : number 
  departmentId: string;
  isActive: boolean;
}
