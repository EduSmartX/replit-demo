/**
 * Frontend Error Messages Constants
 * Centralized error messages for consistent user experience
 */

export const AuthErrorMessages = {
  // Login errors
  LOGIN_FAILED: "Failed to login. Please try again.",
  INVALID_CREDENTIALS: "Invalid username or password.",
  ACCOUNT_DISABLED: "This account has been disabled.",
  
  // Password reset errors
  RESET_CODE_SEND_FAILED: "Failed to send reset code. Please try again.",
  PASSWORD_RESET_FAILED: "Failed to reset password. Please try again.",
  PASSWORDS_DO_NOT_MATCH: "Passwords do not match.",
  
  // OTP errors
  OTP_INVALID: "Invalid OTP code.",
  OTP_EXPIRED: "OTP has expired. Please request a new one.",
  OTP_SEND_FAILED: "Failed to send OTP. Please try again.",
  OTP_VERIFY_FAILED: "Failed to verify OTP. Please try again.",
  
  // Token errors
  TOKEN_EXPIRED: "Your session has expired. Please login again.",
  TOKEN_INVALID: "Invalid authentication token.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
} as const;

export const ValidationErrorMessages = {
  // Generic validation
  REQUIRED_FIELD: "This field is required.",
  INVALID_EMAIL: "Please enter a valid email address.",
  INVALID_PHONE: "Please enter a valid phone number.",
  INVALID_DATE: "Please enter a valid date.",
  
  // Password validation
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters.",
  PASSWORD_REQUIRED: "Password is required.",
  CONFIRM_PASSWORD_REQUIRED: "Please confirm your password.",
  
  // Username validation
  USERNAME_REQUIRED: "Username is required.",
  USERNAME_INVALID: "Username can only contain letters, numbers, and underscores.",
  
  // Email validation
  EMAIL_REQUIRED: "Email is required.",
  EMAIL_ALREADY_EXISTS: "This email is already registered.",
  
  // Organization validation
  ORG_NAME_REQUIRED: "Organization name is required.",
  ORG_EMAIL_REQUIRED: "Organization email is required.",
} as const;

export const OrganizationErrorMessages = {
  REGISTRATION_FAILED: "Failed to register organization. Please try again.",
  VERIFICATION_PENDING: "Your organization is pending verification.",
  APPROVAL_PENDING: "Your organization is pending admin approval.",
  NOT_APPROVED: "Your organization has not been approved yet.",
} as const;

export const NetworkErrorMessages = {
  CONNECTION_FAILED: "Unable to connect to server. Please check your internet connection.",
  TIMEOUT: "Request timed out. Please try again.",
  SERVER_ERROR: "Server error occurred. Please try again later.",
  NOT_FOUND: "The requested resource was not found.",
  FORBIDDEN: "You don't have permission to access this resource.",
} as const;

export const FormErrorMessages = {
  SUBMISSION_FAILED: "Failed to submit form. Please try again.",
  INVALID_DATA: "Please check the form for errors.",
  MISSING_REQUIRED_FIELDS: "Please fill in all required fields.",
} as const;

// Combined export for easy imports
export const ErrorMessages = {
  Auth: AuthErrorMessages,
  Validation: ValidationErrorMessages,
  Organization: OrganizationErrorMessages,
  Network: NetworkErrorMessages,
  Form: FormErrorMessages,
} as const;

// Type exports for TypeScript
export type AuthErrorMessage = typeof AuthErrorMessages[keyof typeof AuthErrorMessages];
export type ValidationErrorMessage = typeof ValidationErrorMessages[keyof typeof ValidationErrorMessages];
