/**
 * Organization Role Constants
 * Centralized constants for organization role codes
 */

export const ORGANIZATION_ROLE_CODES = {
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
  PRINCIPAL: "PRINCIPAL",
  VICE_PRINCIPAL: "VICE_PRINCIPAL",
  HOD: "HOD",
  ADMIN: "ADMIN",
  COORDINATOR: "COORDINATOR",
  COUNSELOR: "COUNSELOR",
  LIBRARIAN: "LIBRARIAN",
  LAB_ASST: "LAB_ASST",
  ACCOUNTANT: "ACCOUNTANT",
  PARENT: "PARENT",
} as const;

export type OrganizationRoleCode = typeof ORGANIZATION_ROLE_CODES[keyof typeof ORGANIZATION_ROLE_CODES];
