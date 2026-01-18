export const TeacherValidationMessages = {
  employeeId: {
    required: "Employee ID is required",
    maxLength: "Employee ID must not exceed 50 characters",
    format: "Employee ID can only contain letters, numbers, hyphens, and underscores",
  },
  email: {
    required: "Email is required",
    invalid: "Please enter a valid email address",
    maxLength: "Email must not exceed 255 characters",
  },
  firstName: {
    required: "First name is required",
    minLength: "First name must be at least 2 characters",
    maxLength: "First name must not exceed 100 characters",
    format: "First name can only contain letters, spaces, hyphens, and apostrophes",
  },
  lastName: {
    required: "Last name is required",
    minLength: "Last name must be at least 2 characters",
    maxLength: "Last name must not exceed 100 characters",
    format: "Last name can only contain letters, spaces, hyphens, and apostrophes",
  },
  phone: {
    invalid: "Please enter a valid phone number",
  },
  qualification: {
    maxLength: "Qualification must not exceed 200 characters",
  },
  joiningDate: {
    invalid: "Please enter a valid date",
  },
  specialization: {
    maxLength: "Specialization must not exceed 100 characters",
  },
  designation: {
    maxLength: "Designation must not exceed 100 characters",
  },
  experience: {
    invalid: "Experience must be between 0 and 70 years",
  },
  subjects: {
    maxCount: "A teacher can be assigned to a maximum of 20 subjects",
  },
  emergencyContactName: {
    required: "Emergency contact name is required when emergency contact number is provided",
    maxLength: "Emergency contact name must not exceed 200 characters",
  },
  emergencyContactNumber: {
    required: "Emergency contact number is required when emergency contact name is provided",
    invalid: "Please enter a valid emergency contact number",
  },
  bloodGroup: {
    invalid: "Please select a valid blood group",
  },
  gender: {
    invalid: "Please select a valid gender",
  },
  supervisorEmail: {
    invalid: "Please enter a valid supervisor email address",
    sameAsTeacher: "Supervisor email cannot be the same as teacher email",
  },
};

export const TeacherSuccessMessages = {
  create: {
    title: "Success",
    description: "Teacher has been created successfully",
  },
  update: {
    title: "Success",
    description: "Teacher has been updated successfully",
  },
  delete: {
    title: "Success",
    description: "Teacher has been deleted successfully",
  },
  addressUpdate: {
    title: "Success",
    description: "Address has been updated successfully",
  },
};

export const TeacherErrorMessages = {
  create: {
    title: "Error Creating Teacher",
    description: "Failed to create teacher. Please try again or contact support if the problem persists.",
  },
  update: {
    title: "Error Updating Teacher",
    description: "Failed to update teacher. Please try again or contact support if the problem persists.",
  },
  delete: {
    title: "Error Deleting Teacher",
    description: "Failed to delete teacher. Please try again or contact support if the problem persists.",
  },
  fetch: {
    title: "Error Loading Data",
    description: "Failed to load teacher data. Please refresh the page or contact support if the problem persists.",
  },
  addressUpdate: {
    title: "Warning",
    description: "Teacher updated but address update failed. Please try updating the address separately.",
  },
  addressCreate: {
    title: "Warning",
    description: "Teacher created but address creation failed. Please add the address separately.",
  },
};

export const TeacherMessages = {
  validation: TeacherValidationMessages,
  success: TeacherSuccessMessages,
  error: TeacherErrorMessages,
};
