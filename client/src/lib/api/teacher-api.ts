/**
 * API functions for Teacher management
 * Using generic API service utilities for consistent CRUD operations
 */

import { apiRequest, API_ENDPOINTS, getAccessToken } from "../api";
import { createEntityService } from "../utils/api-service-utils";
import type { Address } from "./address-api";

// Re-export Address type for convenience
export type { Address } from "./address-api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * Teacher interfaces
 */
export interface Teacher {
  public_id: string;
  user?: {
    public_id: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    email?: string;
    phone?: string;
    role?: string;
    gender?: string;
    blood_group?: string;
    date_of_birth?: string;
    organization_role?: string;
    supervisor?: {
      email: string;
      full_name: string;
    };
    address?: Address;
  };
  employee_id: string;
  full_name: string;
  email: string;
  phone: string;
  highest_qualification?: string;
  joining_date?: string;
  specialization?: string;
  designation?: string;
  experience_years?: number;
  subjects?: Array<{ public_id: string; name: string; code?: string }>;
  emergency_contact_name?: string;
  emergency_contact_number?: string;
  is_first_login?: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeacherCreatePayload {
  employee_id: string;
  highest_qualification?: string;
  joining_date?: string;
  specialization?: string;
  designation?: string;
  experience_years?: number;
  subjects?: number[];
  emergency_contact_name?: string;
  emergency_contact_number?: string;
  user: {
    email: string;
    phone?: string;
    first_name: string;
    last_name: string;
    blood_group?: string;
    date_of_birth?: string;
    gender?: string;
    organization_role?: string;
    supervisor_email?: string;
    address?: Address;
  };
}

export interface TeacherUpdatePayload {
  employee_id?: string;
  highest_qualification?: string;
  joining_date?: string;
  specialization?: string;
  designation?: string;
  experience_years?: number;
  subjects?: number[];
  emergency_contact_name?: string;
  emergency_contact_number?: string;
  user?: {
    email?: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    blood_group?: string;
    date_of_birth?: string;
    gender?: string;
    organization_role?: string;
    supervisor_email?: string;
    address?: Address;
  };
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  description?: string;
}

export interface OrganizationRole {
  id: number;
  name: string;
  code: string;
  description?: string;
  display_order: number;
}

export interface User {
  public_id: string;
  email: string;
  full_name: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  code: number;
  pagination?: unknown;
}

interface TeachersResponse {
  success: boolean;
  message: string;
  data: Teacher[];
  code: number;
  pagination?: {
    count: number;
    next: string | null;
    previous: string | null;
    page_size: number;
    current_page: number;
    total_pages: number;
  };
}

/**
 * Fetch all teachers with pagination and filters
 */
export async function fetchTeachers(params?: {
  page?: number;
  page_size?: number;
  specialization?: string;
  designation?: string;
  search?: string;
  is_deleted?: boolean;
}): Promise<TeachersResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page) {
    queryParams.append("page", params.page.toString());
  }
  if (params?.page_size) {
    queryParams.append("page_size", params.page_size.toString());
  }
  if (params?.specialization) {
    queryParams.append("specialization", params.specialization);
  }
  if (params?.designation) {
    queryParams.append("designation", params.designation);
  }
  if (params?.search) {
    queryParams.append("search", params.search);
  }
  if (params?.is_deleted !== undefined) {
    queryParams.append("is_deleted", params.is_deleted.toString());
  }

  const url = `${API_BASE_URL}/api/teacher/admin/${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const response = await apiRequest<TeachersResponse>(url, {
    method: "GET",
  });

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to fetch teachers");
  }

  return response;
}

/**
 * Create Teacher Service using generic utilities
 */
const teacherService = createEntityService<Teacher, TeacherCreatePayload, TeacherUpdatePayload>(
  `${API_BASE_URL}/api/teacher/admin/`,
  (publicId: string) => `${API_BASE_URL}/api/teacher/admin/${publicId}/`
);

/**
 * Export teacher CRUD functions
 */
export const fetchTeacherDetail = teacherService.fetchDetail;
export const fetchTeacherById = teacherService.fetchDetail; // Alias for consistency
export const createTeacher = teacherService.create;
export const updateTeacher = teacherService.update;
export const deleteTeacher = teacherService.delete;

/**
 * Reactivate a deleted teacher
 */
export async function reactivateTeacher(publicId: string): Promise<ApiResponse<Teacher>> {
  const response = await apiRequest<ApiResponse<Teacher>>(
    API_ENDPOINTS.teacher.activate(publicId),
    {
      method: "POST",
    }
  );

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to reactivate teacher");
  }

  return response;
}

/**
 * Fetch all subjects from core API
 */
export async function fetchSubjects(): Promise<Subject[]> {
  try {
    const response = await apiRequest<ApiResponse<Subject[]>>(
      `${API_BASE_URL}/api/core/subjects/`,
      {
        method: "GET",
      }
    );

    if (!response || typeof response !== "object") {
      console.error("Invalid subjects response type:", response);
      return [];
    }

    // Check if response has the expected structure
    if ("success" in response && "data" in response) {
      if (!response.success || response.code < 200 || response.code >= 300) {
        console.error("Subjects API Error:", response.message);
        throw new Error(response.message || "Failed to fetch subjects");
      }

      // The API returns data directly as an array
      if (Array.isArray(response.data)) {
        return response.data;
      }
    }

    // If response is directly an array
    if (Array.isArray(response)) {
      return response as Subject[];
    }

    console.error("Unexpected subjects response structure:", response);
    return [];
  } catch (error) {
    console.error("Fetch subjects error:", error);
    throw error;
  }
}

/**
 * Fetch all organization roles from core API
 */
export async function fetchOrganizationRoles(): Promise<OrganizationRole[]> {
  try {
    const response = await apiRequest<ApiResponse<OrganizationRole[]>>(
      `${API_BASE_URL}/api/core/organization-role-types/`,
      {
        method: "GET",
      }
    );

    if (!response || typeof response !== "object") {
      return [];
    }

    if ("success" in response && "data" in response) {
      if (!response.success || response.code < 200 || response.code >= 300) {
        console.error("Organization Roles API Error:", response.message);
        throw new Error(response.message || "Failed to fetch organization roles");
      }

      if (Array.isArray(response.data)) {
        return response.data;
      }
    }

    if (Array.isArray(response)) {
      return response as OrganizationRole[];
    }

    return [];
  } catch (error) {
    console.error("Fetch organization roles error:", error);
    throw error;
  }
}

/**
 * Fetch all users (admins and teachers) in the organization for supervisor selection
 */
export async function fetchOrganizationUsers(): Promise<User[]> {
  try {
    const response = await apiRequest<{
      success: boolean;
      message: string;
      data: User[];
      pagination?: unknown;
      code: number;
    }>(`${API_BASE_URL}/api/users/supervisors/`, {
      method: "GET",
    });

    if (!response || typeof response !== "object") {
      return [];
    }

    if (!response.success || response.code < 200 || response.code >= 300) {
      console.error("Supervisors API Error:", response.message);
      throw new Error(response.message || "Failed to fetch supervisors");
    }

    // The new API returns data directly as an array
    if (Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  } catch (error) {
    console.error("Fetch supervisors error:", error);
    throw error;
  }
}

/**
 * Download teacher bulk upload template
 */
export async function downloadTeacherTemplate(isLimitedFields: boolean = false): Promise<Blob> {
  const queryParams = isLimitedFields ? "?is_limited_fields_only=true" : "";
  const url = `${API_BASE_URL}/api/teacher/admin/download-template${queryParams}`;
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
 * Bulk upload teachers from Excel file
 */
export async function bulkUploadTeachers(file: File): Promise<unknown> {
  const formData = new FormData();
  formData.append("file", file);
  const accessToken = getAccessToken();

  const headers: HeadersInit = {};
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/teacher/admin/bulk-upload/`, {
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
