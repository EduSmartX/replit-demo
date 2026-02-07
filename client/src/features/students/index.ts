/**
 * Students Feature - Main Export
 */

export * from "./components";

// Schemas
export { studentFormSchema, type StudentFormValues } from "./schemas/student-form-schema";

// Helpers
export {
  getDefaultFormValues,
  getFormValuesFromStudent,
  getOrganizationRoleCode,
  formValuesToCreatePayload,
  formValuesToUpdatePayload,
  validatePhoneNumber,
  validateAge,
  formatStudentFullName,
} from "./helpers/student-form-helpers";

// Types from API
export type { StudentCreatePayload, StudentUpdatePayload } from "@/lib/api/student-api";

// Hooks
export {
  useClasses,
  useOrganizationRoles,
  useOrganizationUsers,
  useCreateStudent,
  useUpdateStudent,
} from "./hooks/use-student-form";

// Constants
export {
  StudentMessages,
  StudentValidationMessages,
  StudentSuccessMessages,
  StudentErrorMessages,
} from "./constants/student-messages";
