/**
 * Subject API Module
 * Handles subject assignment operations (linking classes, subjects, and teachers)
 */

import { api, API_ENDPOINTS, getAccessToken } from "../api";
import type { ApiListResponse } from "./types";

/**
 * CoreSubject - Master subject data from core API
 * Uses numeric ID (not public_id)
 */
export interface CoreSubject {
  id: number; // Core subjects use numeric ID
  public_id: string; // Also has public_id but ID is primary
  name: string;
  code: string;
  description?: string;
  is_deleted?: boolean;
}

/**
 * SubjectInfo - Core subject information embedded in Subject assignment
 * This is CoreSubject data returned with the Subject assignment
 */
export interface SubjectInfo {
  id: number; // Core subject numeric ID
  public_id: string;
  name: string;
  code: string;
}

export interface ClassInfo {
  public_id: string;
  class_master_name: string;
  name: string;
}

export interface TeacherInfo {
  public_id: string;
  employee_id: string;
  full_name: string;
  email: string;
  specialization?: string;
  designation?: string;
}

/**
 * Subject - Assignment model linking Class + CoreSubject + Teacher
 * Uses public_id for the assignment itself
 */
export interface Subject {
  public_id: string; // Subject assignment public_id
  class_info: ClassInfo;
  subject_info: SubjectInfo; // Core subject data
  teacher_info: TeacherInfo;
  description?: string;
  created_at: string;
  updated_at: string;
  created_by_public_id: string;
  created_by_name: string;
  updated_by_public_id: string;
  updated_by_name: string;
}

export interface SubjectCreatePayload {
  class_id: string; // Class public_id
  subject_id: number; // Core subject ID (numeric)
  teacher_id: string; // Teacher public_id
  description?: string;
}

export interface SubjectUpdatePayload {
  teacher_id?: string;
  description?: string;
}

export interface SubjectFilters {
  search?: string;
  class_assigned__public_id?: string;
  subject_master__id?: string;
  teacher__public_id?: string;
  is_deleted?: boolean;
  page?: number;
  page_size?: number;
}

/**
 * Fetch all subjects with optional filters
 */
export async function getSubjects(
  filters?: SubjectFilters
): Promise<ApiListResponse<Subject>> {
  const params = new URLSearchParams();
  
  if (filters?.search) {params.append("search", filters.search);}
  if (filters?.class_assigned__public_id) {params.append("class_assigned__public_id", filters.class_assigned__public_id);}
  if (filters?.subject_master__id) {params.append("subject_master__id", filters.subject_master__id);}
  if (filters?.teacher__public_id) {params.append("teacher__public_id", filters.teacher__public_id);}
  if (filters?.is_deleted !== undefined) {params.append("is_deleted", filters.is_deleted.toString());}
  if (filters?.page) {params.append("page", filters.page.toString());}
  if (filters?.page_size) {params.append("page_size", filters.page_size.toString());}

  const url = `${API_ENDPOINTS.subjects.list}${params.toString() ? `?${params.toString()}` : ""}`;
  return api.get<ApiListResponse<Subject>>(url);
}

/**
 * Get a single subject by public_id
 */
export async function getSubject(publicId: string): Promise<Subject> {
  return api.get<Subject>(API_ENDPOINTS.subjects.detail(publicId));
}

/**
 * Create a new subject assignment
 */
export async function createSubject(data: SubjectCreatePayload, forceCreate?: boolean): Promise<Subject> {
  const url = forceCreate ? `${API_ENDPOINTS.subjects.list}?force_create=true` : API_ENDPOINTS.subjects.list;
  return api.post<Subject>(url, data);
}

/**
 * Update an existing subject assignment (only teacher or description)
 */
export async function updateSubject(
  publicId: string,
  data: SubjectUpdatePayload
): Promise<Subject> {
  return api.patch<Subject>(API_ENDPOINTS.subjects.detail(publicId), data);
}

/**
 * Delete a subject assignment
 */
export async function deleteSubject(publicId: string): Promise<void> {
  return api.delete(API_ENDPOINTS.subjects.detail(publicId));
}

/**
 * Reactivate a deleted subject assignment
 */
export async function reactivateSubject(publicId: string): Promise<Subject> {
  return api.post<Subject>(API_ENDPOINTS.subjects.activate(publicId), {});
}

/**
 * Download subject bulk upload template
 */
export async function downloadSubjectTemplate(): Promise<Blob> {
  const url = API_ENDPOINTS.subjects.downloadTemplate;
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
 * Bulk upload subjects from Excel file
 */
export async function bulkUploadSubjects(file: File): Promise<unknown> {
  const formData = new FormData();
  formData.append("file", file);
  const accessToken = getAccessToken();

  const headers: HeadersInit = {};
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(API_ENDPOINTS.subjects.bulkUpload, {
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
