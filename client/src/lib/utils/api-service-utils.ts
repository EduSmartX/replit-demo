/**
 * Generic API Service Utilities
 * Reusable CRUD functions that handle standard API response unwrapping and error handling
 */

import { apiRequest } from "../api";

/**
 * Generic API Response Types
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  code: number;
}

export interface PaginatedApiResponse<T> {
  success: boolean;
  message: string;
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
  };
  code: number;
}

/**
 * Generic fetch list function
 * Unwraps paginated response structure (data.results) and validates success
 */
export async function fetchList<T>(url: string): Promise<T[]> {
  try {
    const response = await apiRequest<PaginatedApiResponse<T>>(url, {
      method: "GET",
    });

    // Check if response is valid
    if (!response) {
      console.error("Fetch list: No response received");
      return [];
    }

    if (!response.success || response.code < 200 || response.code >= 300) {
      console.error("Fetch list error:", response.message);
      throw new Error(response.message || "Failed to fetch data");
    }

    // Ensure data and results exist
    if (!response.data || !response.data.results) {
      console.error("Fetch list: Invalid response structure", response);
      return [];
    }

    return response.data.results;
  } catch (error) {
    console.error("Fetch list exception:", error);
    throw error;
  }
}

/**
 * Unwraps single-entity response structure (data) and validates success
 * Generic fetch detail function
 */
export async function fetchDetail<T>(url: string): Promise<T> {
  try {
    const response = await apiRequest<ApiResponse<T>>(url, {
      method: "GET",
    });

    if (!response) {
      throw new Error("No response received");
    }

    if (!response.success || response.code < 200 || response.code >= 300) {
      throw new Error(response.message || "Failed to fetch details");
    }

    if (!response.data) {
      throw new Error("Invalid response structure");
    }

    return response.data;
  } catch (error) {
    console.error("Fetch detail exception:", error);
    throw error;
  }
}

/**
 * Sends POST request with JSON payload, unwraps response
 * Generic create function
 */
export async function createEntity<T, P = any>(url: string, payload: P): Promise<T> {
  const response = await apiRequest<ApiResponse<T>>(url, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to create entity");
  }

  return response.data;
}

/**
 * Generic update function
 */
export async function updateEntity<T, P = any>(url: string, payload: Partial<P>): Promise<T> {
  const response = await apiRequest<ApiResponse<T>>(url, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to update entity");
  }

  return response.data;
}

/**
 * Generic delete function
 */
export async function deleteEntity(url: string): Promise<void> {
  const response = await apiRequest<ApiResponse<null>>(url, {
    method: "DELETE",
  });

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to delete entity");
  }
}

/**
 * Generic bulk upload function
 */
export async function bulkUpload<T>(url: string, file: File): Promise<T> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Failed to upload file");
  }

  return await response.json();
}

/**
 * Create a generic API service for an entity
 */
export interface EntityService<T, CreatePayload = any, UpdatePayload = any> {
  fetchList: () => Promise<T[]>;
  fetchDetail: (id: string) => Promise<T>;
  create: (payload: CreatePayload) => Promise<T>;
  update: (id: string, payload: Partial<UpdatePayload>) => Promise<T>;
  delete: (id: string) => Promise<void>;
}

export function createEntityService<T, CreatePayload = any, UpdatePayload = any>(
  baseUrl: string,
  detailUrl: (id: string) => string
): EntityService<T, CreatePayload, UpdatePayload> {
  return {
    fetchList: () => fetchList<T>(baseUrl),
    fetchDetail: (id: string) => fetchDetail<T>(detailUrl(id)),
    create: (payload: CreatePayload) => createEntity<T, CreatePayload>(baseUrl, payload),
    update: (id: string, payload: Partial<UpdatePayload>) =>
      updateEntity<T, UpdatePayload>(detailUrl(id), payload),
    delete: (id: string) => deleteEntity(detailUrl(id)),
  };
}
