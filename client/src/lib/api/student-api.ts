/**
 * Student API
 * Handles all student-related API operations following Teacher pattern
 */

import type { BulkUploadResponse } from "@/common/components/dialogs/bulk-upload-dialog";
import { api, API_ENDPOINTS, getAccessToken } from "../api";
import type { ApiListResponse, ApiResponse } from "./types";

// Student interface for list view (matching API response structure)
export interface Student {
  public_id: string;
  user_info: {
    public_id: string;
    username: string;
    full_name: string;
  };
  class_info: {
    public_id: string;
    class_master_name: string;
    name: string;
  };
  roll_number: string;
  admission_number: string;
  admission_date: string;
  guardian_name?: string;
  created_at: string;
  updated_at: string;
  created_by_public_id: string;
  created_by_name: string;
  updated_by_public_id: string;
  updated_by_name: string;
}

// Detailed student interface for individual student view/edit
export interface StudentDetail {
  public_id: string;
  user_info: {
    public_id: string;
    username: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    phone: string;
    role: string;
    gender: string;
    blood_group?: string;
    date_of_birth?: string;
    organization_role: string;
    supervisor: {
      email: string;
      full_name: string;
    } | null;
    address?: {
      public_id: string;
      address_type: string;
      street_address: string;
      address_line_2?: string;
      city: string;
      state: string;
      zip_code: string;
      country: string;
      latitude?: string;
      longitude?: string;
      full_address: string;
      created_at: string;
      updated_at: string;
    };
    notification_opt_in: boolean;
    is_active: boolean;
    is_email_verified: boolean;
    full_address?: string;
    location?: {
      lat: number;
      lng: number;
    };
  };
  class_info: {
    public_id: string;
    class_master: {
      id: number;
      name: string;
      code: string;
      display_order: number;
    };
    name: string;
    class_teacher: {
      public_id: string;
      full_name: string;
      email: string;
    } | null;
    info: string;
    capacity: number;
    student_count: number;
    is_full: boolean;
    available_seats: number;
    created_at: string;
    updated_at: string;
    created_by_public_id: string;
    created_by_name: string;
    updated_by_public_id: string;
    updated_by_name: string;
  };
  full_name: string;
  roll_number: string;
  admission_number: string;
  admission_date: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_email?: string;
  guardian_relationship?: string;
  description?: string;
  medical_conditions?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  previous_school_name?: string;
  previous_school_address?: string;
  previous_school_class?: string;
  created_at: string;
  updated_at: string;
  created_by_public_id: string;
  created_by_name: string;
  updated_by_public_id: string;
  updated_by_name: string;
}

export interface StudentCreatePayload {
  user: {
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    role: string;
    gender: string;
    blood_group?: string;
    date_of_birth: string;
    organization_role_code: string;
    supervisor_email?: string;
    address?: {
      address_type: string;
      street_address: string;
      address_line_2?: string;
      city: string;
      state: string;
      zip_code: string;
      country: string;
      latitude?: string;
      longitude?: string;
    };
  };
  roll_number: string;
  admission_number: string;
  admission_date: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_email: string;
  guardian_relationship: string;
  medical_conditions?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  description?: string;
}

export interface StudentUpdatePayload {
  user?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    gender?: string;
    blood_group?: string;
    date_of_birth?: string;
    address?: {
      street_address: string;
      address_line_2?: string;
      city: string;
      state: string;
      zip_code: string;
      country: string;
    };
  };
  roll_number?: string;
  admission_number?: string;
  admission_date?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_email?: string;
  guardian_relationship?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_conditions?: string;
  description?: string;
  previous_school_name?: string;
  previous_school_address?: string;
  previous_school_class?: string;
}

export interface StudentListParams {
  class_id?: string;
  search?: string;
  is_deleted?: boolean;
  page?: number;
  page_size?: number;
}

/**
 * Fetch students list (admin level)
 */
export async function getStudents(params?: StudentListParams): Promise<ApiListResponse<Student>> {
  const queryParams = new URLSearchParams();
  
  if (params?.class_id) {
    queryParams.append("class_id", params.class_id);
  }
  if (params?.search) {
    queryParams.append("search", params.search);
  }
  if (params?.is_deleted !== undefined) {
    queryParams.append("is_deleted", params.is_deleted.toString());
  }
  if (params?.page) {
    queryParams.append("page", params.page.toString());
  }
  if (params?.page_size) {
    queryParams.append("page_size", params.page_size.toString());
  }
  
  const url = `${API_ENDPOINTS.students.list}?${queryParams.toString()}`;
  return api.get<ApiListResponse<Student>>(url);
}

/**
 * Create a student in a specific class
 */
export async function createStudent(
  classId: string,
  payload: StudentCreatePayload,
  forceCreate = false
): Promise<StudentDetail> {
  const url = `${API_ENDPOINTS.students.classLevel(classId)}${forceCreate ? "?force_create=true" : ""}`;
  return api.post<StudentDetail>(url, payload);
}

/**
 * Get student details
 */
export async function getStudent(classId: string, publicId: string): Promise<StudentDetail> {
  const response = await api.get<ApiResponse<StudentDetail>>(
    API_ENDPOINTS.students.classDetail(classId, publicId)
  );
  
  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to fetch student details");
  }
  
  return response.data;
}

/**
 * Update a student
 */
export async function updateStudent(
  classId: string,
  publicId: string,
  payload: StudentUpdatePayload
): Promise<StudentDetail> {
  const response = await api.patch<ApiResponse<StudentDetail>>(
    API_ENDPOINTS.students.classDetail(classId, publicId),
    payload
  );
  
  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to update student");
  }
  
  return response.data;
}

/**
 * Delete a student (soft delete)
 */
export async function deleteStudent(classId: string, publicId: string): Promise<void> {
  await api.delete(API_ENDPOINTS.students.classDetail(classId, publicId));
}

/**
 * Reactivate a deleted student
 */
export async function reactivateStudent(classId: string, publicId: string): Promise<StudentDetail> {
  const response = await api.post<ApiResponse<StudentDetail>>(
    API_ENDPOINTS.students.activate(classId, publicId)
  );
  
  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to reactivate student");
  }
  
  return response.data;
}

/**
 * Bulk upload students from Excel file
 */
export async function bulkUploadStudents(file: File): Promise<BulkUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const accessToken = getAccessToken();

  const headers: HeadersInit = {};
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(API_ENDPOINTS.students.bulkUpload, {
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

/**
 * Download student bulk upload template
 */
export async function downloadStudentTemplate(isLimitedFields: boolean = false): Promise<Blob> {
  const queryParams = isLimitedFields ? "?is_limited_fields_only=true" : "";
  const url = `${API_ENDPOINTS.students.downloadTemplate}${queryParams}`;
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
 * Export students data
 */
export async function exportStudentsData(params?: Record<string, string>): Promise<Blob> {
  const queryParams = new URLSearchParams(params);
  const url = `${API_ENDPOINTS.students.exportData}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to export data");
  }

  return response.blob();
}
