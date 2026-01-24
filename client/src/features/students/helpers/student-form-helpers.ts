/**
 * Student Form Helpers
 * Pure transformation functions for converting between form state, API payloads, and student entities
 */

import type { StudentDetail, StudentCreatePayload, StudentUpdatePayload } from "@/lib/api/student-api";
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
    previous_school_name: "",
    previous_school_address: "",
    previous_school_class: "",
  };
}

// Entity to form mapping: Extract nested properties from StudentDetail entity
export function getFormValuesFromStudent(
  student: StudentDetail,
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
    date_of_birth: student.user_info?.date_of_birth || "",
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
    previous_school_name: "",
    previous_school_address: "",
    previous_school_class: "",
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

// Form to API payload transformation: Map form values to nested user object structure
export function formValuesToCreatePayload(values: StudentFormValues): StudentCreatePayload {
  const payload: StudentCreatePayload = {
    user: {
      username: values.email || undefined,
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email || undefined,
      phone: values.phone || undefined,
      role: "student",
      gender: values.gender || undefined,
      blood_group: values.blood_group || undefined,
      date_of_birth: values.date_of_birth || undefined,
      organization_role_code: values.organization_role || "STUDENT",
      supervisor_email: values.supervisor_email || undefined,
    },
    roll_number: values.roll_number,
    admission_number: values.admission_number || undefined,
    admission_date: values.admission_date || undefined,
    guardian_name: values.guardian_name || undefined,
    guardian_phone: values.guardian_phone || undefined,
    guardian_email: values.guardian_email || undefined,
    guardian_relationship: values.guardian_relationship || undefined,
    medical_conditions: values.medical_conditions || undefined,
    emergency_contact_name: values.emergency_contact_name || undefined,
    emergency_contact_phone: values.emergency_contact_phone || undefined,
    description: values.description || undefined,
  };

  // Remove undefined fields from user object
  Object.keys(payload.user).forEach(key => {
    if (payload.user[key as keyof typeof payload.user] === undefined) {
      delete payload.user[key as keyof typeof payload.user];
    }
  });

  // Remove undefined fields from root payload
  Object.keys(payload).forEach(key => {
    if (key !== 'user' && payload[key as keyof typeof payload] === undefined) {
      delete payload[key as keyof typeof payload];
    }
  });

  return payload;
}

export function formValuesToUpdatePayload(values: StudentFormValues): StudentUpdatePayload {
  const payload: StudentUpdatePayload = {
    user: {
      first_name: values.first_name,
      last_name: values.last_name,
      email: values.email || undefined,
      phone: values.phone || undefined,
      gender: values.gender || undefined,
      blood_group: values.blood_group || undefined,
      date_of_birth: values.date_of_birth || undefined,
    },
    roll_number: values.roll_number,
    admission_number: values.admission_number || undefined,
    admission_date: values.admission_date || undefined,
    guardian_name: values.guardian_name || undefined,
    guardian_phone: values.guardian_phone || undefined,
    guardian_email: values.guardian_email || undefined,
    guardian_relationship: values.guardian_relationship || undefined,
    emergency_contact_name: values.emergency_contact_name || undefined,
    emergency_contact_phone: values.emergency_contact_phone || undefined,
    medical_conditions: values.medical_conditions || undefined,
    description: values.description || undefined,
  };

  // Remove undefined fields from user object
  Object.keys(payload.user).forEach(key => {
    if (payload.user[key as keyof typeof payload.user] === undefined) {
      delete payload.user[key as keyof typeof payload.user];
    }
  });

  // Remove undefined fields from root payload
  Object.keys(payload).forEach(key => {
    if (key !== 'user' && payload[key as keyof typeof payload] === undefined) {
      delete payload[key as keyof typeof payload];
    }
  });

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

