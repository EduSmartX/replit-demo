/**
 * Teacher Form Helper Functions
 */

import type { Teacher } from "@/lib/api/teacher-api";
import type { TeacherFormValues } from "../schemas/teacher-form-schema";

export function getDefaultFormValues(): TeacherFormValues {
  return {
    employee_id: "",
    email: "",
    phone: "",
    first_name: "",
    last_name: "",
    highest_qualification: "",
    joining_date: "",
    specialization: "",
    designation: "",
    experience_years: "",
    subjects: [],
    emergency_contact_name: "",
    emergency_contact_number: "",
    blood_group: "",
    gender: "",
    organization_role: "",
    supervisor_email: "",
  };
}

export function getFormValuesFromTeacher(
  teacher: Teacher,
  organizationRoleCode: string
): TeacherFormValues {
  return {
    employee_id: teacher.employee_id || "",
    email: teacher.email || "",
    phone: teacher.phone || "",
    first_name: teacher.user?.first_name || "",
    last_name: teacher.user?.last_name || "",
    highest_qualification: teacher.highest_qualification || "",
    joining_date: teacher.joining_date || "",
    specialization: teacher.specialization || "",
    designation: teacher.designation || "",
    experience_years: teacher.experience_years?.toString() || "",
    subjects: teacher.subjects?.map((s) => parseInt(s.public_id)) || [],
    emergency_contact_name: teacher.emergency_contact_name || "",
    emergency_contact_number: teacher.emergency_contact_number || "",
    blood_group: teacher.user?.blood_group || "",
    gender: teacher.user?.gender || "",
    organization_role: organizationRoleCode,
    supervisor_email:
      (teacher.user as { supervisor?: { email?: string } })?.supervisor?.email || "",
  };
}

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

export function formValuesToCreatePayload(values: TeacherFormValues) {
  return {
    employee_id: values.employee_id,
    email: values.email,
    phone: values.phone || "",
    first_name: values.first_name,
    last_name: values.last_name,
    highest_qualification: values.highest_qualification || "",
    joining_date: values.joining_date || undefined,
    specialization: values.specialization || "",
    designation: values.designation || "",
    experience_years: values.experience_years ? parseInt(values.experience_years) : undefined,
    subjects: values.subjects || [],
    emergency_contact_name: values.emergency_contact_name || "",
    emergency_contact_number: values.emergency_contact_number || "",
    blood_group: values.blood_group || "",
    gender: values.gender || "",
    organization_role: values.organization_role || "",
    supervisor_email: values.supervisor_email || "",
  };
}

export function formValuesToUpdatePayload(values: TeacherFormValues) {
  return formValuesToCreatePayload(values);
}

export function validateExperienceYears(value: string): boolean {
  if (!value) {
    return true;
  }
  const num = parseInt(value, 10);
  return !isNaN(num) && num >= 0 && num <= 70;
}

export function validatePhoneNumber(phone: string): boolean {
  if (!phone) {
    return true;
  }
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
}

export function formatTeacherFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}
