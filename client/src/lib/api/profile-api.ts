/**
 * Profile API
 * Handles all profile-related API operations
 */

import { api } from "../api";
import type { ApiResponse } from "./types";

export interface UserProfile {
  public_id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  role: string;
  gender: string;
  blood_group?: string;
  date_of_birth?: string;
  organization_role: string;
  is_active: boolean;
  is_email_verified: boolean;
  notification_opt_in: boolean;
  address?: {
    public_id: string;
    street_address: string;
    address_line_2?: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    full_address: string;
  };
}

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  phone?: string;
  gender?: string;
  blood_group?: string;
  date_of_birth?: string;
  notification_opt_in?: boolean;
  address?: {
    street_address: string;
    address_line_2?: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface UpdateEmailPayload {
  new_email: string;
  otp: string;
}

export interface UpdatePhonePayload {
  new_phone: string;
  otp: string;
}

export interface SendOTPPayload {
  email?: string;
  phone?: string;
  purpose: "EMAIL_VERIFICATION" | "PHONE_VERIFICATION";
}

/**
 * Get current user profile
 */
export async function getUserProfile(): Promise<ApiResponse<UserProfile>> {
  return api.get<ApiResponse<UserProfile>>("/api/users/profile/me/");
}

/**
 * Update user profile
 */
export async function updateProfile(
  payload: UpdateProfilePayload
): Promise<ApiResponse<UserProfile>> {
  return api.patch<ApiResponse<UserProfile>>("/api/users/profile/me/", payload);
}

/**
 * Change password
 */
export async function changePassword(
  payload: ChangePasswordPayload
): Promise<ApiResponse<{ message: string }>> {
  return api.post<ApiResponse<{ message: string }>>("/api/auth/change-password/", payload);
}

/**
 * Send OTP for email/phone verification
 */
export async function sendOTP(
  payload: SendOTPPayload
): Promise<ApiResponse<{ message: string; expires_in_minutes: number }>> {
  return api.post<ApiResponse<{ message: string; expires_in_minutes: number }>>(
    "/api/users/send-otp/",
    payload
  );
}

/**
 * Update email with OTP verification
 */
export async function updateEmail(payload: UpdateEmailPayload): Promise<ApiResponse<UserProfile>> {
  return api.post<ApiResponse<UserProfile>>("/api/users/update-email/", payload);
}

/**
 * Update phone with OTP verification
 */
export async function updatePhone(payload: UpdatePhonePayload): Promise<ApiResponse<UserProfile>> {
  return api.post<ApiResponse<UserProfile>>("/api/users/update-phone/", payload);
}
