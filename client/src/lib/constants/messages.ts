/**
 * Application Messages Constants
 * Centralized string literals for consistent messaging across the app
 */

// Error Messages - General
export const ERROR_MESSAGES = {
  // Generic Errors
  UNEXPECTED_ERROR: "An unexpected error occurred. Please try again later.",
  GENERIC_ERROR: "An error occurred. Please try again.",
  TECHNICAL_ERROR:
    "A technical error occurred. Please try again or contact support if the problem persists.",

  // Network Errors
  NETWORK_ERROR: "Unable to connect to the server. Please check your internet connection.",
  FETCH_FAILED: "Unable to load data. Please check your connection and try again.",
  NO_RESPONSE: "No response received",
  TIMEOUT: "The request took too long. Please try again.",

  // Authentication Errors
  AUTH_REQUIRED: "Please log in to continue.",
  AUTH_FAILED: "Authentication failed. Please log in again.",
  FORBIDDEN: "Access denied. Please contact your administrator.",

  // Validation Errors
  INVALID_DATA: "The information provided is not valid. Please check and try again.",
  VALIDATION_FAILED: "Validation error occurred",
  INVALID_RESPONSE: "Invalid response structure",

  // Entity Not Found
  STUDENT_NOT_FOUND: "Student not found",
  NOT_FOUND: "Resource not found",

  // API Operation Errors
  FETCH_DATA_FAILED: "Failed to fetch data",
  CREATE_FAILED: "Failed to create entity",
  UPDATE_FAILED: "Failed to update entity",
  DELETE_FAILED: "Failed to delete entity",
  UPLOAD_FAILED: "Failed to upload file",
  EXPORT_FAILED: "Failed to export data",
  DOWNLOAD_FAILED: "Failed to download template",

  // Specific Entity Errors
  STUDENT_UPDATE_REQUIRED: "Student ID is required for update",
  ADDRESS_UPDATE_FAILED: "Failed to update address",
  CLASS_FETCH_FAILED: "Failed to fetch classes",
  CLASS_DELETE_FAILED: "Failed to delete class",
  CLASS_REACTIVATE_FAILED: "Failed to reactivate class",
  CORE_CLASS_FETCH_FAILED: "Failed to fetch core classes",
  TEACHER_FETCH_FAILED: "Failed to fetch teachers",
  TEACHER_REACTIVATE_FAILED: "Failed to reactivate teacher",
  STUDENT_FETCH_FAILED: "Failed to fetch student details",
  STUDENT_UPDATE_FAILED: "Failed to update student",
  STUDENT_REACTIVATE_FAILED: "Failed to reactivate student",
  SUBJECT_FETCH_FAILED: "Failed to fetch subjects",
  SUPERVISOR_FETCH_FAILED: "Failed to fetch supervisors",
  ORG_ROLE_FETCH_FAILED: "Failed to fetch organization roles",

  // Holiday/Calendar Errors
  HOLIDAY_CALENDAR_FETCH_FAILED: "Failed to fetch holiday calendar",
  HOLIDAY_CREATE_FAILED: "Failed to create holiday",
  HOLIDAYS_CREATE_FAILED: "Failed to create holidays",
  HOLIDAY_UPDATE_FAILED: "Failed to update holiday",
  HOLIDAY_DELETE_FAILED: "Failed to delete holiday",
  WORKING_DAY_FETCH_FAILED: "Failed to fetch working day policy",
  WORKING_DAY_CREATE_FAILED: "Failed to create working day policy",
  WORKING_DAY_UPDATE_FAILED: "Failed to update working day policy",
  EXCEPTION_CREATE_FAILED: "Failed to create exception",

  // Leave Errors
  LEAVE_TYPE_FETCH_FAILED: "Failed to fetch leave types",
  LEAVE_ALLOCATION_FETCH_FAILED: "Failed to fetch leave allocations",
  LEAVE_ALLOCATION_GET_FAILED: "Failed to fetch leave allocation",
  LEAVE_ALLOCATION_DELETE_FAILED: "Failed to fetch leave allocation",

  // Preferences Errors
  PREFERENCES_FETCH_FAILED: "Failed to fetch preferences",
  PREFERENCE_FETCH_FAILED: "Failed to fetch preference",
  PREFERENCE_UPDATE_FAILED: "Failed to update preference",
  PREFERENCES_BULK_UPDATE_FAILED: "Failed to bulk update preferences",

  // Form Errors
  ADDRESS_FORM_VALIDATION_FAILED: "Address form validation failed",
  UNEXPECTED_RESPONSE_FORMAT: "Unexpected response format",

  // Configuration Errors
  SYSTEM_CONFIG_ERROR: "System configuration error. Please contact support.",
  DATA_MISSING: "Data is missing or unavailable. Please refresh and try again.",
  ROOT_ELEMENT_NOT_FOUND: "Failed to find the root element",

  // Context Errors
  USE_USER_OUTSIDE_PROVIDER: "useUser must be used within UserProvider",
  USE_CAROUSEL_OUTSIDE_PROVIDER: "useCarousel must be used within a <Carousel />",
  USE_CHART_OUTSIDE_PROVIDER: "useChart must be used within a <ChartContainer />",
  USE_FORM_FIELD_OUTSIDE_PROVIDER: "useFormField should be used within <FormField>",
  USE_FORM_ITEM_OUTSIDE_PROVIDER: "useFormField should be used within <FormItem>",
  USE_SIDEBAR_OUTSIDE_PROVIDER: "useSidebar must be used within a SidebarProvider.",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  // General
  OPERATION_SUCCESSFUL: "Operation completed successfully",

  // Authentication
  LOGOUT_SUCCESS: "You have been successfully logged out.",

  // Teacher Operations
  TEACHER_CREATED: "Teacher created successfully",
  TEACHER_UPDATED: "Teacher updated successfully",
  TEACHER_REACTIVATED: "Teacher reactivated successfully",

  // Subject Operations
  SUBJECT_ASSIGNED: "Subject assigned successfully",
  SUBJECT_UPDATED: "Subject updated successfully",
  SUBJECT_REACTIVATED: "Subject reactivated successfully",

  // Leave Request Operations
  LEAVE_REQUEST_APPROVED: "Leave request approved successfully",
  LEAVE_REQUEST_REJECTED: "Leave request rejected successfully",
} as const;

// Validation Messages
export const VALIDATION_MESSAGES = {
  // Date Validations
  SELECT_DATE: "Please select a date",

  // Required Field Messages
  PROVIDE_REASON: "Please provide a reason",
  SELECT_CLASS: "Please select at least one class or apply to all classes",
  SELECT_ONE_CLASS: "Please select at least one class",

  // Context-specific
  CANNOT_UNDO: "This action cannot be undone.",
  REMOVE_STUDENT_CONFIRM: "This will remove the student. This action cannot be undone.",
} as const;

// Info Messages
export const INFO_MESSAGES = {
  // Organization
  ORG_PENDING_REVIEW:
    "Your organization registration is currently under review. Please contact Educard",
  WAIT_FOR_APPROVAL: "Please wait for EduCard admin approval before logging in. You'll receive a",

  // Calendar Exceptions
  EXCEPTION_NOTE: "The system will prevent conflicting exceptions. You cannot force",
} as const;

// API Status Messages
export const API_STATUS_MESSAGES = {
  LOADING: "Loading...",
  SAVING: "Saving...",
  DELETING: "Deleting...",
  UPLOADING: "Uploading...",
  PROCESSING: "Processing...",
} as const;

// Form Field Labels (common)
export const FIELD_LABELS = {
  DATE: "Date",
  REASON: "Reason",
  CLASS: "Class",
  CLASSES: "Classes",
  STATUS: "Status",
  ACTIONS: "Actions",
  NAME: "Name",
  EMAIL: "Email",
  PHONE: "Phone",
  ADDRESS: "Address",
} as const;

// Button Labels
export const BUTTON_LABELS = {
  SAVE: "Save",
  CANCEL: "Cancel",
  DELETE: "Delete",
  EDIT: "Edit",
  VIEW: "View",
  ADD: "Add",
  CREATE: "Create",
  UPDATE: "Update",
  SUBMIT: "Submit",
  CLOSE: "Close",
  CONFIRM: "Confirm",
  BACK: "Back",
  NEXT: "Next",
  FINISH: "Finish",
  SEARCH: "Search",
  FILTER: "Filter",
  RESET: "Reset",
  EXPORT: "Export",
  IMPORT: "Import",
  DOWNLOAD: "Download",
  UPLOAD: "Upload",
} as const;

// Dialog/Modal Titles
export const DIALOG_TITLES = {
  CONFIRM_DELETE: "Confirm Delete",
  CONFIRM_ACTION: "Confirm Action",
  ERROR: "Error",
  SUCCESS: "Success",
  WARNING: "Warning",
  INFO: "Information",
} as const;
