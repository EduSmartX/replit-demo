/**
 * Students Feature - Main Export
 */

export * from './components';

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
  type StudentCreatePayload,
  type StudentUpdatePayload,
} from "./helpers/student-form-helpers";

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
