import type { Teacher } from "@/lib/api/teacher-api";
import type { TeacherFormValues, MinimalTeacherFormValues } from "../schemas/teacher-form-schema";


function getRoleCodeFromName(roleName: string | undefined): string {
  if (!roleName) {
    return "";
  }
  return roleName.toUpperCase().replace(/\s+/g, "_");
}

export function getFormValuesFromTeacher(teacher: Teacher | null | undefined): Partial<TeacherFormValues> {
  if (!teacher) {
    return {
      employee_id: "",
      email: "",
      first_name: "",
      last_name: "",
      phone: "",
      gender: "",
      blood_group: "",
      date_of_birth: "",
      organization_role: "",
      supervisor_email: "",
      highest_qualification: "",
      specialization: "",
      designation: "",
      joining_date: "",
      experience_years: undefined,
      emergency_contact_name: "",
      emergency_contact_number: "",
      street_address: "",
      address_line_2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "India"
    };
  }

  return {
    employee_id: teacher.employee_id || "",
    email: teacher.user?.email || teacher.email || "",
    first_name: teacher.user?.first_name || "",
    last_name: teacher.user?.last_name || "",
    phone: teacher.user?.phone || teacher.phone || "",
    gender: teacher.user?.gender || "",
    blood_group: teacher.user?.blood_group || "",
    date_of_birth: teacher.user?.date_of_birth || "",
    organization_role: getRoleCodeFromName(teacher.user?.organization_role),
    supervisor_email: teacher.user?.supervisor?.email || "",
    highest_qualification: teacher.highest_qualification || "",
    specialization: teacher.specialization || "",
    designation: teacher.designation || "",
    joining_date: teacher.joining_date || "",
    experience_years: teacher.experience_years,
    emergency_contact_name: teacher.emergency_contact_name || "",
    emergency_contact_number: teacher.emergency_contact_number || "",
    street_address: teacher.user?.address?.street_address || "",
    address_line_2: teacher.user?.address?.address_line_2 || "",
    city: teacher.user?.address?.city || "",
    state: teacher.user?.address?.state || "",
    postal_code: teacher.user?.address?.zip_code || "",
    country: teacher.user?.address?.country || "India"
  };
}

export function getTeacherPayloadFromForm(values: TeacherFormValues | MinimalTeacherFormValues) {
  const hasAddress = 'street_address' in values && (
    values.street_address || 
    values.address_line_2 ||
    values.city || 
    values.state || 
    values.postal_code || 
    values.country
  );

  return {
    employee_id: values.employee_id,
    ...(('highest_qualification' in values && values.highest_qualification) && { highest_qualification: values.highest_qualification }),
    ...(('joining_date' in values && values.joining_date) && { joining_date: values.joining_date }),
    ...(('specialization' in values && values.specialization) && { specialization: values.specialization }),
    ...(('designation' in values && values.designation) && { designation: values.designation }),
    ...(('experience_years' in values && values.experience_years !== undefined) && { experience_years: values.experience_years }),
    ...(('emergency_contact_name' in values && values.emergency_contact_name) && { emergency_contact_name: values.emergency_contact_name }),
    ...(('emergency_contact_number' in values && values.emergency_contact_number) && { emergency_contact_number: values.emergency_contact_number }),
    user: {
      email: values.email,
      first_name: values.first_name,
      last_name: values.last_name,
      ...((('phone' in values && values.phone)) && { phone: values.phone }),
      gender: values.gender,
      ...(('blood_group' in values && values.blood_group) && { blood_group: values.blood_group }),
      ...(('date_of_birth' in values && values.date_of_birth) && { date_of_birth: values.date_of_birth }),
      ...(values.organization_role && { organization_role: values.organization_role }),
      ...(('supervisor_email' in values && values.supervisor_email) && { supervisor_email: values.supervisor_email }),
      ...(hasAddress && {
        address: {
          street_address: 'street_address' in values ? values.street_address || "" : "",
          address_line_2: 'address_line_2' in values ? values.address_line_2 || "" : "",
          city: 'city' in values ? values.city || "" : "",
          state: 'state' in values ? values.state || "" : "",
          zip_code: 'postal_code' in values ? values.postal_code || "" : "",
          country: 'country' in values ? values.country || "India" : "India"
        }
      })
    }
  };
}

export function getDefaultMinimalTeacher(): MinimalTeacherFormValues {
  return {
    employee_id: "",
    email: "",
    first_name: "",
    last_name: "",
    gender: "",
    organization_role: ""
  };
}
