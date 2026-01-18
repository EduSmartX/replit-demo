export const StudentValidationMessages = {
  rollNumber: {
    required: "Roll number is required",
    maxLength: "Roll number must not exceed 20 characters",
    format: "Roll number can only contain letters and numbers",
  },
  admissionNumber: {
    maxLength: "Admission number must not exceed 50 characters",
    format: "Admission number can only contain letters, numbers, hyphens, and underscores",
    duplicate: "This admission number is already in use",
  },
  firstName: {
    required: "First name is required",
    minLength: "First name must be at least 2 characters",
    maxLength: "First name must not exceed 100 characters",
    format: "First name can only contain letters, spaces, hyphens, and apostrophes",
  },
  lastName: {
    required: "Last name is required",
    maxLength: "Last name must not exceed 100 characters",
    format: "Last name can only contain letters, spaces, hyphens, and apostrophes",
  },
  email: {
    invalid: "Please enter a valid email address",
    maxLength: "Email must not exceed 255 characters",
    duplicate: "This email is already in use",
  },
  phone: {
    invalid: "Please enter a valid phone number",
  },
  dateOfBirth: {
    invalid: "Please enter a valid date of birth",
    ageRange: "Student age must be between 3 and 25 years",
  },
  admissionDate: {
    invalid: "Please enter a valid admission date",
  },
  guardian: {
    nameMaxLength: "Guardian name must not exceed 255 characters",
    phoneInvalid: "Please enter a valid guardian phone number",
    emailInvalid: "Please enter a valid guardian email address",
    emailMaxLength: "Guardian email must not exceed 255 characters",
    relationshipMaxLength: "Relationship must not exceed 100 characters",
    contactRequired: "Guardian phone or email is required when guardian name is provided",
  },
  emergencyContact: {
    nameMaxLength: "Emergency contact name must not exceed 255 characters",
    phoneInvalid: "Please enter a valid emergency contact number",
    phoneRequired: "Emergency contact phone is required when emergency contact name is provided",
  },
  medicalConditions: {
    maxLength: "Medical conditions must not exceed 500 characters",
  },
  description: {
    maxLength: "Description must not exceed 500 characters",
  },
  supervisor: {
    emailInvalid: "Please enter a valid supervisor email address",
    emailSameAsStudent: "Supervisor email cannot be the same as student email",
  },
  class: {
    required: "Class assignment is required",
  },
} as const;

export const StudentSuccessMessages = {
  create: {
    title: "Student Created Successfully",
    description: "A new student has been added to your organization successfully.",
  },
  update: {
    title: "Student Updated Successfully",
    description: "The student information has been updated successfully.",
  },
  delete: {
    title: "Student Deleted Successfully",
    description: "The student has been removed from your organization.",
  },
  addressUpdate: {
    title: "Address Updated Successfully",
    description: "The student's address has been updated successfully.",
  },
} as const;

export const StudentErrorMessages = {
  create: {
    title: "Failed to Create Student",
    description: "An error occurred while creating the student. Please try again.",
  },
  update: {
    title: "Failed to Update Student",
    description: "An error occurred while updating the student. Please try again.",
  },
  delete: {
    title: "Failed to Delete Student",
    description: "An error occurred while deleting the student. Please try again.",
  },
  fetch: {
    title: "Failed to Load Student Data",
    description: "An error occurred while loading the student information. Please try again.",
  },
  fetchClasses: {
    title: "Failed to Load Classes",
    description: "An error occurred while loading the class list. Please try again.",
  },
  fetchOrgRoles: {
    title: "Failed to Load Organization Roles",
    description: "An error occurred while loading organization roles. Please try again.",
  },
  fetchUsers: {
    title: "Failed to Load Users",
    description: "An error occurred while loading the user list. Please try again.",
  },
  addressUpdate: {
    title: "Address Update Failed",
    description: "The address could not be updated. Please check your information and try again.",
  },
  validation: {
    title: "Validation Error",
    description: "Please check the form for errors and try again.",
  },
  network: {
    title: "Network Error",
    description: "Unable to connect to the server. Please check your internet connection.",
  },
} as const;

export const StudentMessages = {
  validation: StudentValidationMessages,
  success: StudentSuccessMessages,
  error: StudentErrorMessages,
} as const;
