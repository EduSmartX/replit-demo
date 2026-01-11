/**
 * Frontend Success Messages Constants
 * Centralized success messages for consistent user experience
 */

export const AuthSuccessMessages = {
  LOGIN_SUCCESS: "Login successful.",
  LOGOUT_SUCCESS: "Logged out successfully.",
  PASSWORD_RESET_SUCCESS: "Password reset successful.",
  PASSWORD_CHANGED: "Password changed successfully.",
  RESET_CODE_SENT: "Password reset code sent to your email.",
} as const;

export const OrganizationSuccessMessages = {
  REGISTRATION_SUCCESS: "Organization registered successfully!",
  VERIFICATION_SUCCESS: "Organization verified successfully.",
  OTP_SENT: "Verification code sent successfully.",
  OTP_VERIFIED: "Email verified successfully.",
} as const;

export const FormSuccessMessages = {
  SAVE_SUCCESS: "Changes saved successfully.",
  UPDATE_SUCCESS: "Updated successfully.",
  CREATE_SUCCESS: "Created successfully.",
  DELETE_SUCCESS: "Deleted successfully.",
} as const;

// Combined export
export const SuccessMessages = {
  Auth: AuthSuccessMessages,
  Organization: OrganizationSuccessMessages,
  Form: FormSuccessMessages,
} as const;

// Type exports
export type AuthSuccessMessage = typeof AuthSuccessMessages[keyof typeof AuthSuccessMessages];
export type OrganizationSuccessMessage = typeof OrganizationSuccessMessages[keyof typeof OrganizationSuccessMessages];
