import { api, API_ENDPOINTS } from "./api";

/**
 * Verify OTP for a given email
 * @param email - The email address to verify
 * @param otpCode - The OTP code to verify
 * @param purpose - The purpose of verification
 * @returns Promise with verification response
 */
export async function verifyOtp(
  email: string,
  otpCode: string,
  purpose: string = "organization_registration"
) {
  return await api.post(API_ENDPOINTS.organizations.verifyOtp, {
    email,
    otp_code: otpCode,
    purpose,
  });
}

/**
 * Send OTP to multiple emails
 * @param emails - Array of email configurations
 * @returns Promise with send response
 */
export async function sendOtps(
  emails: Array<{ email: string; category: string; purpose: string }>
) {
  return await api.post(API_ENDPOINTS.organizations.sendOtp, emails);
}
