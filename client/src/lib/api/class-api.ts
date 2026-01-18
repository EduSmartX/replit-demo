/**
 * Class/Section Management API Functions
 * Handles all API calls related to classes (sections) management
 */

import { API_ENDPOINTS, apiRequest, getAccessToken } from "@/lib/api";
import type { ApiListResponse, ApiResponse } from "./types";

// Re-export for convenience
export { API_ENDPOINTS, apiRequest };

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Core Class (Grade/Level) from /api/core/classes/
 * These are the base classes like Pre-KG, LKG, Class 1, etc.
 */
export interface CoreClass {
  id: number;
  name: string; // e.g., "Pre-KG", "Class 1", "Class 10"
  code: string; // e.g., "PRE_KG", "CLASS_1", "CLASS_10"
  display_order: number;
  description: string;
}

/**
 * Master Class (Section) from /api/classes/admin/
 * These are the actual sections like "Class 1 - A", "Class 10 - B"
 */
export interface MasterClass {
  public_id: string;
  class_master: {
    id: number;
    name: string;
    code: string;
    display_order: number;
  };
  name: string;
  organization: {
    public_id: string;
    name: string;
    email: string;
    phone: string;
    admin_name: string;
    admin_public_id: string;
  };
  class_teacher: {
    public_id: string;
    email: string;
    full_name: string;
    first_name: string;
    last_name: string;
    employee_id: string;
    specialization: string;
    designation: string;
  } | null;
  info: string | null; // Description
  capacity: number | null;
  student_count: number;
  created_at: string;
  updated_at: string;
  created_by_public_id: string | null;
  created_by_name: string | null;
  updated_by_public_id: string | null;
  updated_by_name: string | null;
}

export interface ClassCreatePayload {
  class_master: number;
  name: string;
  class_teacher?: string;
  info?: string; // Description
  capacity?: number;
}

export interface ClassUpdatePayload {
  class_master?: number;
  name?: string;
  class_teacher?: string;
  info?: string;
  capacity?: number;
}

// Using standard API response types
export type CoreClassesResponse = ApiListResponse<CoreClass>;
export type ClassesResponse = ApiListResponse<MasterClass>;
export type ClassResponse = ApiResponse<MasterClass>;

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch core classes (grades/levels) from /api/core/classes/
 * Returns base grade levels (Pre-KG, Class 1-12) used as templates for creating sections
 */
export async function fetchCoreClasses(params?: {
  page?: number;
  page_size?: number;
}): Promise<CoreClassesResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page) {queryParams.append("page", params.page.toString());}
  if (params?.page_size) {queryParams.append("page_size", params.page_size.toString());}

  const url = `${API_ENDPOINTS.core.coreClasses}${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const response = await apiRequest<CoreClassesResponse>(url, {
    method: "GET",
  });

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to fetch core classes");
  }

  return response;
}

/**
 * Fetch all classes (sections) with pagination and filters
 */
export async function fetchClasses(params?: {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
  class_master?: number;
}): Promise<ClassesResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page) {queryParams.append("page", params.page.toString());}
  if (params?.page_size) {queryParams.append("page_size", params.page_size.toString());}
  if (params?.search) {queryParams.append("search", params.search);}
  if (params?.is_active !== undefined) {queryParams.append("is_active", params.is_active.toString());}
  if (params?.class_master) {queryParams.append("class_master", params.class_master.toString());}

  const url = `${API_ENDPOINTS.classes.list}${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const response = await apiRequest<ClassesResponse>(url, {
    method: "GET",
  });

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to fetch classes");
  }

  return response;
}

/**
 * Fetch a specific class by public ID
 */
export async function fetchClass(publicId: string): Promise<ClassResponse> {
  const response = await apiRequest<ClassResponse>(
    API_ENDPOINTS.classes.detail(publicId),
    {
      method: "GET",
    }
  );

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to fetch class");
  }

  return response;
}

/**
 * Create a new class (single or multiple)
 */
export async function createClass(
  payload: ClassCreatePayload | ClassCreatePayload[]
): Promise<ClassResponse | ApiResponse<MasterClass[]>> {
  const response = await apiRequest<ClassResponse | ApiResponse<MasterClass[]>>(
    API_ENDPOINTS.classes.list,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  if (!response.success || response.code < 200 || response.code >= 300) {
    let errorMessage = response.message || "Failed to create class";

    if (response.errors) {
      const errorMessages: string[] = [];
      const errorFields = Object.keys(response.errors);
      
      errorFields.forEach((field) => {
        const fieldErrors = response.errors[field];
        if (Array.isArray(fieldErrors)) {
          fieldErrors.forEach((err) => {
            if (field === 'non_field_errors') {
              errorMessages.push(err);
            } else {
              errorMessages.push(`${field}: ${err}`);
            }
          });
        }
      });
      
      if (errorMessages.length > 0) {
        errorMessage = errorMessages.join('; ');
      }
    }

    throw new Error(errorMessage);
  }

  return response;
}

/**
 * Update a class
 */
export async function updateClass(
  publicId: string,
  payload: ClassUpdatePayload
): Promise<ClassResponse> {
  const response = await apiRequest<ClassResponse>(
    API_ENDPOINTS.classes.detail(publicId),
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );

  if (!response.success || response.code < 200 || response.code >= 300) {
    let errorMessage = response.message || "Failed to update class";

    if (response.errors) {
      const errorFields = Object.keys(response.errors);
      if (errorFields.length > 0) {
        const firstError = response.errors[errorFields[0]];
        if (Array.isArray(firstError) && firstError.length > 0) {
          errorMessage = `${errorFields[0]}: ${firstError[0]}`;
        }
      }
    }

    throw new Error(errorMessage);
  }

  return response;
}

/**
 * Delete a class (soft delete)
 */
export async function deleteClass(publicId: string): Promise<ApiResponse<null>> {
  const response = await apiRequest<ApiResponse<null>>(
    API_ENDPOINTS.classes.detail(publicId),
    {
      method: "DELETE",
    }
  );

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to delete class");
  }

  return response;
}

/**
 * Download class/section bulk upload template
 */
export async function downloadClassTemplate(isLimitedFields: boolean = false): Promise<Blob> {
  const queryParams = isLimitedFields ? "?is_limited_fields_only=true" : "";
  const url = `${API_ENDPOINTS.classes.downloadTemplate}${queryParams}`;
  const accessToken = getAccessToken();

  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
    credentials: "include",
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`Failed to download template: ${response.status} - ${errorText}`);
  }

  return response.blob();
}

/**
 * Bulk upload classes/sections from Excel file
 */
export async function bulkUploadClasses(file: File): Promise<unknown> {
  const formData = new FormData();
  formData.append("file", file);
  const accessToken = getAccessToken();

  const headers: HeadersInit = {};
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(API_ENDPOINTS.classes.bulkUpload, {
    method: "POST",
    headers,
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw errorData || new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}
