// This file is deprecated. Use src/shared/constants/roles.ts instead.
// Re-exporting is not practical due to module resolution from a non-src root.
// Import from "src/shared/constants/roles.js" directly.

export const ROLES = {
  ADMIN: "ADMIN",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const PUBLIC_REGISTRABLE_ROLES: readonly Role[] = [
  ROLES.STUDENT,
  ROLES.TEACHER,
] as const;
