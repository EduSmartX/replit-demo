/**
 * Form Field Mappings
 * 
 * Defines mappings between backend field names and frontend form field names
 * for various forms across the application.
 */

/**
 * Common field mappings for leave allocation forms
 */
export const LEAVE_FIELD_MAP = {
  'max_carry_forward_days': 'max_carry_forward_days',
  'total_days': 'total_days',
  'leave_type': 'leave_type',
  'roles': 'roles',
  'effective_from': 'effective_from',
  'effective_to': 'effective_to',
  'name': 'name',
  'description': 'description',
} as const;

/**
 * Field mappings for teacher forms
 */
export const TEACHER_FIELD_MAP = {
  'employee_id': 'employee_id',
  'email': 'email',
  'phone': 'phone',
  'first_name': 'first_name',
  'last_name': 'last_name',
  'highest_qualification': 'highest_qualification',
  'joining_date': 'joining_date',
  'specialization': 'specialization',
  'designation': 'designation',
  'experience_years': 'experience_years',
  'subjects': 'subjects',
  'emergency_contact_name': 'emergency_contact_name',
  'emergency_contact_number': 'emergency_contact_number',
  'blood_group': 'blood_group',
  'gender': 'gender',
  'organization_role': 'organization_role',
  'supervisor_email': 'supervisor_email',
  'supervisor': 'supervisor_email',
} as const;

/**
 * Field mappings for class/section forms
 */
export const CLASS_FIELD_MAP = {
  'name': 'name',
  'description': 'description',
  'capacity': 'capacity',
  'display_order': 'display_order',
  'is_active': 'is_active',
} as const;

/**
 * Field mappings for student forms
 */
export const STUDENT_FIELD_MAP = {
  'roll_number': 'roll_number',
  'admission_number': 'admission_number',
  'first_name': 'first_name',
  'last_name': 'last_name',
  'email': 'email',
  'phone': 'phone',
  'phone_number': 'phone',
  'admission_date': 'admission_date',
  'date_of_birth': 'date_of_birth',
  'blood_group': 'blood_group',
  'gender': 'gender',
  'class_id': 'class_id',
  'class_assigned': 'class_id',
  'guardian_name': 'guardian_name',
  'guardian_phone': 'guardian_phone',
  'guardian_email': 'guardian_email',
  'guardian_relationship': 'guardian_relationship',
  'emergency_contact_name': 'emergency_contact_name',
  'emergency_contact_phone': 'emergency_contact_phone',
  'medical_conditions': 'medical_conditions',
  'description': 'description',
  'organization_role': 'organization_role',
  'supervisor_email': 'supervisor_email',
  'supervisor': 'supervisor_email',
} as const;
