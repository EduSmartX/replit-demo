/**
 * API Configuration for Django Backend
 * Centralizes all API endpoint configurations and request utilities
 */

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
  },
  leave: {
    allocations: `${API_BASE_URL}/api/leave/leave-allocations/`,
    allocationDetail: (publicId: string) => `${API_BASE_URL}/api/leave/leave-allocations/${publicId}/`,
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

/**
 * Make an authenticated API request to Django backend
 */
export async function apiRequest<T = unknown>(url: string, options: RequestInit = {}): Promise<T> {
  const accessToken = getAccessToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add authorization header if token exists
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized - try to refresh token
  if (response.status === 401 && accessToken) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry the original request with new token
      headers["Authorization"] = `Bearer ${getAccessToken()}`;
      const retryResponse = await fetch(url, {
        ...options,
        headers,
      });

      if (!retryResponse.ok) {
        throw new Error(`HTTP ${retryResponse.status}: ${retryResponse.statusText}`);
      }

      return await retryResponse.json();
    } else {
      // Refresh failed, clear tokens and throw error
      clearTokens();
      throw new Error("Authentication failed. Please log in again.");
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
  }

  // Handle 204 No Content - no body to parse
  if (response.status === 204) {
    return {} as T;
  }

  return await response.json();
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
  get: <T = unknown>(url: string, options?: RequestInit) =>
    apiRequest<T>(url, { ...options, method: "GET" }),

  post: <T = unknown>(url: string, data?: unknown, options?: RequestInit) =>
    apiRequest<T>(url, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = unknown>(url: string, data?: unknown, options?: RequestInit) =>
    apiRequest<T>(url, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T = unknown>(url: string, data?: unknown, options?: RequestInit) =>
    apiRequest<T>(url, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = unknown>(url: string, options?: RequestInit) =>
    apiRequest<T>(url, { ...options, method: "DELETE" }),
};
