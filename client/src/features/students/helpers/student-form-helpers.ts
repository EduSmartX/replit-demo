/**
 * Student Form Helpers
 * Pure transformation functions for converting between form state, API payloads, and student entities
 */

import type { Student } from "@/lib/api/student-api";
import type { StudentFormValues } from "../schemas/student-form-schema";

export function getDefaultFormValues(): StudentFormValues {
  return {
    roll_number: "",
    first_name: "",
    last_name: "",
    admission_number: "",
    email: "",
    phone: "",
    admission_date: "",
    date_of_birth: "",
    blood_group: "",
    gender: "",
    class_id: "",
    guardian_name: "",
    guardian_phone: "",
    guardian_email: "",
    guardian_relationship: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    medical_conditions: "",
    description: "",
    organization_role: "",
    supervisor_email: "",
  };
}

// Entity to form mapping: Extract nested properties from Student entity (user.email, user.supervisor.email)
// and flatten into form-compatible structure
export function getFormValuesFromStudent(
  student: Student,
  organizationRoleCode?: string
): StudentFormValues {
  return {
    roll_number: student.roll_number || "",
    first_name: student.user?.first_name || "",
    last_name: student.user?.last_name || "",
    admission_number: student.admission_number || "",
    email: student.user?.email || "",
    phone: student.user?.phone || "",
    admission_date: student.admission_date || "",
    date_of_birth: student.date_of_birth || "",
    blood_group: student.user?.blood_group || "",
    gender: student.user?.gender || "",
    class_id: student.class_assigned?.public_id || "",
    guardian_name: student.guardian_name || "",
    guardian_phone: student.guardian_phone || "",
    guardian_email: student.guardian_email || "",
    guardian_relationship: student.guardian_relationship || "",
    emergency_contact_name: student.emergency_contact_name || "",
    emergency_contact_phone: student.emergency_contact_phone || "",
    medical_conditions: student.medical_conditions || "",
    description: student.description || "",
    organization_role: organizationRoleCode || "",
    supervisor_email:
      (student.user as { supervisor?: { email?: string } })?.supervisor?.email || "",
  };
}

// Reverse lookup: Map organization role display name (from API) back to code (for form)
export function getOrganizationRoleCode(
  roleName: string | undefined,
  orgRoles: Array<{ code: string; name: string }>
): string {
  if (!roleName || orgRoles.length === 0) {
    return "";
  }
  
  const matchingRole = orgRoles.find((role) => role.name === roleName);
  return matchingRole?.code || "";
}
// Form to API payload transformation: Only include non-empty optional fields to minimize payload size

export function formValuesToCreatePayload(values: StudentFormValues): StudentCreatePayload {
  const payload: StudentCreatePayload = {
    roll_number: values.roll_number,
    first_name: values.first_name,
    last_name: values.last_name,
  };

  // Optional fields - only include if they have values
  if (values.admission_number) { payload.admission_number = values.admission_number; }
  if (values.email) { payload.email = values.email; }
  if (values.phone) { payload.phone_number = values.phone; }
  if (values.admission_date) { payload.admission_date = values.admission_date; }
  if (values.date_of_birth) { payload.date_of_birth = values.date_of_birth; }
  if (values.blood_group) { payload.blood_group = values.blood_group; }
  if (values.gender) { payload.gender = values.gender; }
  if (values.guardian_name) { payload.guardian_name = values.guardian_name; }
  if (values.guardian_phone) { payload.guardian_phone = values.guardian_phone; }
  if (values.guardian_email) { payload.guardian_email = values.guardian_email; }
  if (values.guardian_relationship) { payload.guardian_relationship = values.guardian_relationship; }
  if (values.emergency_contact_name) { payload.emergency_contact_name = values.emergency_contact_name; }
  if (values.emergency_contact_phone) { payload.emergency_contact_phone = values.emergency_contact_phone; }
  if (values.medical_conditions) { payload.medical_conditions = values.medical_conditions; }
  if (values.description) { payload.description = values.description; }
  if (values.organization_role) { payload.organization_role = values.organization_role; }
  if (values.supervisor_email) { payload.supervisor_email = values.supervisor_email; }

  return payload;
}

export function formValuesToUpdatePayload(values: StudentFormValues): StudentUpdatePayload {
  const payload: StudentUpdatePayload = {
    roll_number: values.roll_number,
    first_name: values.first_name,
    last_name: values.last_name,
  };

  // Include email in update payload (made updatable)
  if (values.email) { payload.email = values.email; }

  // Optional fields
  if (values.admission_number) { payload.admission_number = values.admission_number; }
  if (values.phone) { payload.phone_number = values.phone; }
  if (values.admission_date) { payload.admission_date = values.admission_date; }
  if (values.date_of_birth) { payload.date_of_birth = values.date_of_birth; }
  if (values.blood_group) { payload.blood_group = values.blood_group; }
  if (values.gender) { payload.gender = values.gender; }
  if (values.guardian_name) { payload.guardian_name = values.guardian_name; }
  if (values.guardian_phone) { payload.guardian_phone = values.guardian_phone; }
  if (values.guardian_email) { payload.guardian_email = values.guardian_email; }
  if (values.guardian_relationship) { payload.guardian_relationship = values.guardian_relationship; }
  if (values.emergency_contact_name) { payload.emergency_contact_name = values.emergency_contact_name; }
  if (values.emergency_contact_phone) { payload.emergency_contact_phone = values.emergency_contact_phone; }
  if (values.medical_conditions) { payload.medical_conditions = values.medical_conditions; }
  if (values.description) { payload.description = values.description; }
  if (values.organization_role) { payload.organization_role = values.organization_role; }
  if (values.supervisor_email) { payload.supervisor_email = values.supervisor_email; }

  return payload;
}

export function formatStudentFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate age based on date of birth
 */
export function validateAge(dateOfBirth: string): { valid: boolean; age?: number } {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    return { valid: age - 1 >= 3 && age - 1 <= 25, age: age - 1 };
  }
  
  return { valid: age >= 3 && age <= 25, age };
}

/**
 * Type definitions for API payloads
 */
export interface StudentCreatePayload {
  roll_number: string;
  first_name: string;
  last_name: string;
  admission_number?: string;
  email?: string;
  phone_number?: string;
  admission_date?: string;
  date_of_birth?: string;
  blood_group?: string;
  gender?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_email?: string;
  guardian_relationship?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_conditions?: string;
  description?: string;
  organization_role?: string;
  supervisor_email?: string;
}

export interface StudentUpdatePayload {
  roll_number: string;
  first_name: string;
  last_name: string;
  admission_number?: string;
  email?: string;
  phone_number?: string;
  admission_date?: string;
  date_of_birth?: string;
  blood_group?: string;
  gender?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_email?: string;
  guardian_relationship?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_conditions?: string;
  description?: string;
  organization_role?: string;
  supervisor_email?: string;
}
