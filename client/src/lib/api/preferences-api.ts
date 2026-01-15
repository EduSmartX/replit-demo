/**
 * Organization Preferences API Functions
 */

import { apiRequest, API_ENDPOINTS } from "@/lib/api";
import type { ApiResponse, ApiListResponse } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface Preference {
  public_id: string;
  display_name: string;
  key: string;
  category: string;
  field_type: "string" | "number" | "radio" | "choice" | "multi-choice";
  default_value: string;
  applicable_values: string[] | null;
  description: string;
  value: string | string[];
}

export interface GroupedPreference {
  category: string;
  preferences: Preference[];
  count: number;
}

// Using standard API response types
export type PreferencesResponse = ApiResponse<GroupedPreference[]>;
export type PreferenceResponse = ApiResponse<Preference>;

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch grouped organization preferences
 */
export async function fetchGroupedPreferences(): Promise<PreferencesResponse> {
  const url = `${API_BASE_URL}/api/organization-preferences/?grouped=true`;
  const response = await apiRequest<PreferencesResponse>(url, {
    method: "GET",
  });
  
  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to fetch preferences");
  }
  
  return response;
}

/**
 * Fetch single preference by public ID
 */
export async function fetchPreference(publicId: string): Promise<PreferenceResponse> {
  const url = `${API_BASE_URL}/api/organization-preferences/${publicId}/`;
  const response = await apiRequest<PreferenceResponse>(url, {
    method: "GET",
  });
  
  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to fetch preference");
  }
  
  return response;
}

/**
 * Update a preference value
 */
export async function updatePreference(
  publicId: string,
  value: string | string[]
): Promise<PreferenceResponse> {
  const url = `${API_BASE_URL}/api/organization-preferences/${publicId}/`;
  const response = await apiRequest<PreferenceResponse>(url, {
    method: "PATCH",
    body: JSON.stringify({ value }),
  });
  
  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to update preference");
  }
  
  return response;
}

/**
 * Bulk update preferences
 */
export async function bulkUpdatePreferences(
  updates: { public_id: string; value: string | string[] }[]
): Promise<ApiResponse<{ updated: number; failed: number }>> {
  const url = `${API_BASE_URL}/api/organization-preferences/bulk-update/`;
  const response = await apiRequest<ApiResponse<{ updated: number; failed: number }>>(url, {
    method: "POST",
    body: JSON.stringify({ preferences: updates }),
  });
  
  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to bulk update preferences");
  }
  
  return response;
}
