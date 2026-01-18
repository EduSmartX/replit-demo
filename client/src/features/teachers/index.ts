/**
 * Teachers Feature - Main Export
 */

export * from './components';

// Schemas
export { teacherFormSchema, type TeacherFormValues } from "./schemas/teacher-form-schema";

// Helpers
export {
  getDefaultFormValues,
  getFormValuesFromTeacher,
  getOrganizationRoleCode,
  formValuesToCreatePayload,
  formValuesToUpdatePayload,
  validateExperienceYears,
  validatePhoneNumber,
  formatTeacherFullName,
} from "./helpers/teacher-form-helpers";

// Hooks
export {
  useSubjects,
  useOrganizationRoles,
  useOrganizationUsers,
  useCreateTeacher,
  useUpdateTeacher,
} from "./hooks/use-teacher-form";

// Constants
export {
  TeacherMessages,
  TeacherValidationMessages,
  TeacherSuccessMessages,
  TeacherErrorMessages,
} from "./constants/teacher-messages";

