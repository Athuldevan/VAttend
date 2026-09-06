export const ROLES = {
  ADMIN: "ADMIN",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Roles that can be self-registered (public registration). */
export const PUBLIC_REGISTRABLE_ROLES: readonly Role[] = [
  ROLES.STUDENT,
  ROLES.TEACHER,
] as const;
