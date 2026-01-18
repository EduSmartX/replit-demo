/**
 * API Configuration for Django Backend
 * Centralizes all API endpoint configurations and request utilities
 */

// Re-export standard types
export { isPaginatedResponse, isSuccessResponse } from "./api/types";
export type { ApiErrorResponse, ApiListResponse, ApiResponse, Pagination } from "./api/types";

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * API endpoints configuration
 */
export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/api/auth/login/`,
    logout: `${API_BASE_URL}/api/auth/logout/`,
    refresh: `${API_BASE_URL}/api/auth/token/refresh/`,
    me: `${API_BASE_URL}/api/auth/me/`,
    passwordResetRequest: `${API_BASE_URL}/api/auth/password-reset-request/`,
    passwordResetVerify: `${API_BASE_URL}/api/auth/password-reset-verify/`,
  },
  organizations: {
    list: `${API_BASE_URL}/api/organizations/`,
    detail: (id: string) => `${API_BASE_URL}/api/organizations/${id}/`,
    sendOtp: `${API_BASE_URL}/api/organizations/otp/send/`,
    verifyOtp: `${API_BASE_URL}/api/organizations/otp/verify/`,
    register: `${API_BASE_URL}/api/organizations/register/`,
  },
  users: {
    list: `${API_BASE_URL}/api/users/`,
    detail: (id: string) => `${API_BASE_URL}/api/users/${id}/`,
  },
  core: {
    leaveTypes: `${API_BASE_URL}/api/core/leave-types/`,
    organizationRoles: `${API_BASE_URL}/api/core/organization-role-types/`,
    subjects: `${API_BASE_URL}/api/core/subjects/`,
    coreClasses: `${API_BASE_URL}/api/core/classes/`,
  },
  classes: {
    list: `${API_BASE_URL}/api/classes/admin/`,
    detail: (publicId: string) => `${API_BASE_URL}/api/classes/admin/${publicId}/`,
    downloadTemplate: `${API_BASE_URL}/api/classes/admin/download-template/`,
    bulkUpload: `${API_BASE_URL}/api/classes/admin/bulk-upload/`,
  },
  leave: {
    allocations: `${API_BASE_URL}/api/leave/leave-allocations/`,
    allocationDetail: (publicId: string) =>
      `${API_BASE_URL}/api/leave/leave-allocations/${publicId}/`,
  },
  attendance: {
    holidayCalendar: `${API_BASE_URL}/api/attendance/admin/holiday-calendar/`,
    workingDayPolicy: `${API_BASE_URL}/api/attendance/admin/working-day-policy/`,
  },
  teacher: {
    list: `${API_BASE_URL}/api/teacher/admin/`,
    detail: (publicId: string) => `${API_BASE_URL}/api/teacher/admin/${publicId}/`,
    activate: (publicId: string) => `${API_BASE_URL}/api/teacher/admin/${publicId}/activate/`,
  },
  // Add more endpoints as needed
} as const;

/**
 * Storage keys for tokens
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
} as const;

/**
 * Get access token from storage
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

/**
 * Get refresh token from storage
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

/**
 * Save tokens to storage
 */
export function saveTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
}

/**
 * Clear tokens from storage
 */
export function clearTokens(): void {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
}

export interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Make an authenticated API request to Django backend
 */
export async function apiRequest<T = unknown>(url: string, options: ApiRequestOptions = {}): Promise<T> {
  const { skipAuth, ...fetchOptions } = options;
  const accessToken = getAccessToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  // Add authorization header if token exists and skipAuth is not true
  if (accessToken && !skipAuth) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // Handle 401 Unauthorized - try to refresh token (skip for public endpoints)
    if (response.status === 401 && accessToken && !skipAuth) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry the original request with new token
        headers["Authorization"] = `Bearer ${getAccessToken()}`;
        const retryResponse = await fetch(url, {
          ...fetchOptions,
          headers,
        });

        if (!retryResponse.ok) {
          const errorData = await retryResponse.json().catch(() => null);
          throw errorData || new Error(`HTTP ${retryResponse.status}: ${retryResponse.statusText}`);
        }

        return await retryResponse.json();
      } else {
        // Refresh failed, clear tokens and throw error
        clearTokens();
        throw new Error("Authentication failed. Please log in again.");
      }
    }

    // Handle 204 No Content - no body to parse (check before trying to parse body)
    if (response.status === 204) {
      return {
        success: true,
        message: "Success",
        code: 204,
        data: null,
      } as T;
    }

    // Try to parse response body (even for errors)
    let responseData;
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      const text = await response.text();      
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = text;
      }
    }

    // If response is not ok, throw the parsed response data
    if (!response.ok) {      
      if (responseData && typeof responseData === "object") {
        throw responseData;
      }      
      throw {
        success: false,
        message: responseData || response.statusText || "Request failed",
        code: response.status,
        errors: null,
        data: null,
      };
    }

    return responseData;
  } catch (error) {
    // If it's already a structured error, re-throw it
    if (error && typeof error === "object" && "code" in error) {
      throw error;
    }
    
    throw {
      success: false,
      message: error instanceof Error ? error.message : "Network error occurred",
      code: 0,
      errors: error,
      data: null,
    };
  }
}

/**
 * Refresh the access token using the refresh token
 */
async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return false;
  }

  try {
    const response = await fetch(API_ENDPOINTS.auth.refresh, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();

    if (data.access) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.access);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return false;
  }
}

/**
 * Convenience methods for common HTTP methods
 */
export const api = {
  get: <T = unknown>(url: string, options?: ApiRequestOptions) =>
    apiRequest<T>(url, { ...options, method: "GET" }),

  post: <T = unknown>(url: string, data?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(url, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = unknown>(url: string, data?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(url, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T = unknown>(url: string, data?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(url, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = unknown>(url: string, options?: ApiRequestOptions) =>
    apiRequest<T>(url, { ...options, method: "DELETE" }),
};
