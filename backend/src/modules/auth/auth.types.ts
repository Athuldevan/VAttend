import type { Role } from "../../../shared/constants/roles.js";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: Role;
  departmentId: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
