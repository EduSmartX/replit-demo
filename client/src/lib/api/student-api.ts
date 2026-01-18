/**
 * Student Management API
 * Handles CRUD operations and filtering for students
 */

import { apiRequest, getAccessToken } from "../api";
import { createEntityService } from "../utils/api-service-utils";
import type { Address } from "./address-api";
import {
  fetchClasses,
  fetchCoreClasses,
  type CoreClass,
  type MasterClass
} from "./class-api";

export type { Address } from "./address-api";
export type { MasterClass as Class, CoreClass as ClassMaster } from "./class-api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export interface Student {
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
    organization_role?: string;
    supervisor?: {
      email: string;
      full_name: string;
    };
    address?: Address;
    [key: string]: unknown;
  };
  roll_number: string;
  admission_number?: string;
  admission_date?: string;
  date_of_birth?: string;
  full_name: string;
  class_assigned?: {
    public_id: string;
    name: string;
    class_master?: {
      name: string;
      code: string;
    };
  };
  guardian_name?: string;
  guardian_phone?: string;
  guardian_email?: string;
  guardian_relationship?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_conditions?: string;
  description?: string;
  is_first_login?: boolean;
  addresses?: Address[];
  created_at: string;
  updated_at: string;
}

export interface StudentCreatePayload {
  roll_number: string;
  first_name: string;
  last_name: string;
  admission_number?: string;
  email?: string;
  phone_number?: string;
  admission_date?: string;
  date_of_birth?: string;
  blood_group?: string;
  gender?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_email?: string;
  guardian_relationship?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_conditions?: string;
  description?: string;
  organization_role?: string;
  supervisor_email?: string;
}

export interface StudentUpdatePayload {
  roll_number?: string;
  first_name?: string;
  last_name?: string;
  admission_number?: string;
  email?: string;
  phone_number?: string;
  admission_date?: string;
  date_of_birth?: string;
  blood_group?: string;
  gender?: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_email?: string;
  guardian_relationship?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_conditions?: string;
  description?: string;
  organization_role?: string;
  supervisor_email?: string;
}

export interface StudentListParams {
  class_master_id?: string;
  section_id?: string;
  class_id?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface StudentListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Student[];
}

export interface OrganizationRole {
  code: string;
  name: string;
}

// Wrapper functions to reuse class-api logic instead of duplicating code
export const fetchClassMasters = async (): Promise<CoreClass[]> => {
  const response = await fetchCoreClasses({ page_size: 100 });
  return response.data || [];
};

export const fetchSectionsByClassMaster = async (classMasterId: number): Promise<MasterClass[]> => {
  const response = await fetchClasses({ class_master: classMasterId, page_size: 100 });
  return response.data || [];
};

const studentService = createEntityService<
  Student,
  StudentCreatePayload,
  StudentUpdatePayload
>(
  `${API_BASE_URL}/api/students/`,
  (publicId: string) => `${API_BASE_URL}/api/students/${publicId}/`
);

// Custom fetchStudents: Supports multi-level filtering (class_master_id → section_id → search)
// for cascading dropdown UX pattern
export const fetchStudents = async (params?: StudentListParams): Promise<StudentListResponse> => {
  const token = getAccessToken();
  const queryParams = new URLSearchParams();
  
  if (params?.class_master_id) {
    queryParams.append("class_master_id", params.class_master_id);
  }
  if (params?.section_id) {
    queryParams.append("section_id", params.section_id);
  }
  if (params?.class_id) {
    queryParams.append("class_id", params.class_id);
  }
  if (params?.search) {
    queryParams.append("search", params.search);
  }
  if (params?.page) {
    queryParams.append("page", params.page.toString());
  }
  if (params?.page_size) {
    queryParams.append("page_size", params.page_size.toString());
  }

  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/api/students/${queryString ? `?${queryString}` : ""}`;

  const response = await apiRequest<StudentListResponse>(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
};

export const fetchStudentById = async (publicId: string): Promise<Student> => {
  const token = getAccessToken();
  const response = await apiRequest<{ data: Student }>(
    `${API_BASE_URL}/api/students/${publicId}/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const createStudent = async (payload: StudentCreatePayload): Promise<Student> => {
  const token = getAccessToken();
  const response = await apiRequest<{ data: Student }>(
    `${API_BASE_URL}/api/students/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );
  return response.data;
};

export const updateStudent = async (
  publicId: string,
  payload: StudentUpdatePayload
): Promise<Student> => {
  const token = getAccessToken();
  const response = await apiRequest<{ data: Student }>(
    `${API_BASE_URL}/api/students/${publicId}/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );
  return response.data;
};

/**
 * Delete a student (soft delete)
 */
export const deleteStudent = async (publicId: string): Promise<void> => {
  const token = getAccessToken();
  await apiRequest<void>(`${API_BASE_URL}/api/students/${publicId}/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const fetchOrganizationRoles = async (): Promise<OrganizationRole[]> => {
  const token = getAccessToken();
  const response = await apiRequest<{ results: OrganizationRole[] }>(
    `${API_BASE_URL}/api/organization/roles/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.results;
};

export const fetchOrganizationUsers = async (): Promise<
  Array<{ email: string; full_name: string; public_id: string }>
> => {
  const token = getAccessToken();
  const response = await apiRequest<{
    results: Array<{ email: string; full_name: string; public_id: string }>;
  }>(`${API_BASE_URL}/api/organization/users/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.results;
};

export const bulkUploadStudents = async (
  classId: string,
  file: File
): Promise<{ message: string; created_count: number }> => {
  const token = getAccessToken();
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiRequest<{ message: string; created_count: number }>(
    `${API_BASE_URL}/api/classes/${classId}/students/bulk-upload/`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );
  return response;
};

export const downloadStudentTemplate = async (classId: string): Promise<Blob> => {
  const token = getAccessToken();
  const response = await fetch(
    `${API_BASE_URL}/api/classes/${classId}/students/download-template/`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to download template");
  }

  return response.blob();
};
