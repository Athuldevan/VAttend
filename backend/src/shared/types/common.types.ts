import type { Role } from "../constants/roles.js";

/** Authenticated user payload attached to Express Request after JWT verification. */
export interface AuthUser {
  userId: string;
  role: Role;
  departmentId: string;
}
