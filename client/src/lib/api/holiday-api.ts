/**
 * Holiday Calendar API Functions
 * Handles all API calls related to organization holiday calendar
 */

import { apiRequest, API_ENDPOINTS } from "@/lib/api";
import type { ApiListResponse, ApiResponse } from "./types";

// ============================================================================
// Types & Interfaces
// ============================================================================

export type HolidayType = "SUNDAY" | "SATURDAY" | "SECOND_SATURDAY" | "NATIONAL_HOLIDAY" | "FESTIVAL" | "ORGANIZATION_HOLIDAY" | "OTHER";

export interface Holiday {
  public_id: string;
  start_date: string;
  end_date: string;
  holiday_type: HolidayType;
  description: string;
}

export type HolidayCalendarResponse = ApiListResponse<Holiday>;

export interface FetchHolidayCalendarParams {
  from_date?: string;
  to_date?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface CreateHolidayPayload {
  start_date: string;
  end_date?: string;
  holiday_type: Exclude<HolidayType, "SUNDAY" | "SATURDAY">; // Exclude auto-generated weekend types
  description: string;
}

export interface CreateHolidayResponse {
  public_id: string;
  start_date: string;
  end_date: string;
  holiday_type: HolidayType;
  description: string;
  created_at: string;
  updated_at: string;
  created_by_public_id: string | null;
  created_by_name: string | null;
  updated_by_public_id: string | null;
  updated_by_name: string | null;
}

export type SaturdayOffPattern = "NONE" | "SECOND_ONLY" | "SECOND_AND_FOURTH" | "ALL";

export interface WorkingDayPolicy {
  public_id: string;
  sunday_off: boolean;
  saturday_off_pattern: SaturdayOffPattern;
  effective_from: string;
  effective_to: string | null;
  created_at: string;
  updated_at: string;
  created_by_public_id: string | null;
  created_by_name: string | null;
  updated_by_public_id: string | null;
  updated_by_name: string | null;
}

export type WorkingDayPolicyResponse = ApiListResponse<WorkingDayPolicy>;

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch holiday calendar data with optional filters
 */
export async function fetchHolidayCalendar(
  params?: FetchHolidayCalendarParams
): Promise<HolidayCalendarResponse> {
  const queryParams = new URLSearchParams();

  if (params?.from_date) queryParams.append("from_date", params.from_date);
  if (params?.to_date) queryParams.append("to_date", params.to_date);
  if (params?.ordering) queryParams.append("ordering", params.ordering);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.page_size) queryParams.append("page_size", params.page_size.toString());

  const url = `${API_ENDPOINTS.attendance.holidayCalendar}${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const response = await apiRequest<HolidayCalendarResponse>(url, {
    method: "GET",
  });

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to fetch holiday calendar");
  }

  return response;
}

/**
 * Fetch working day policy
 */
export async function fetchWorkingDayPolicy(): Promise<WorkingDayPolicyResponse> {
  const response = await apiRequest<WorkingDayPolicyResponse>(
    API_ENDPOINTS.attendance.workingDayPolicy,
    {
      method: "GET",
    }
  );

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to fetch working day policy");
  }

  return response;
}

export interface CreateWorkingDayPolicyPayload {
  sunday_off: boolean;
  saturday_off_pattern: SaturdayOffPattern;
  effective_from: string;
  effective_to?: string | null;
}

/**
 * Create a new working day policy
 */
export async function createWorkingDayPolicy(
  payload: CreateWorkingDayPolicyPayload
): Promise<ApiResponse<WorkingDayPolicy>> {
  const response = await apiRequest<ApiResponse<WorkingDayPolicy>>(
    API_ENDPOINTS.attendance.workingDayPolicy,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to create working day policy");
  }

  return response;
}

/**
 * Update an existing working day policy
 */
export async function updateWorkingDayPolicy(
  publicId: string,
  payload: Partial<CreateWorkingDayPolicyPayload>
): Promise<ApiResponse<WorkingDayPolicy>> {
  const response = await apiRequest<ApiResponse<WorkingDayPolicy>>(
    `${API_ENDPOINTS.attendance.workingDayPolicy}${publicId}/`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to update working day policy");
  }

  return response;
}

/**
 * Create a single holiday
 */
export async function createHoliday(
  payload: CreateHolidayPayload
): Promise<ApiResponse<CreateHolidayResponse>> {
  const response = await apiRequest<ApiResponse<CreateHolidayResponse>>(
    API_ENDPOINTS.attendance.holidayCalendar,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to create holiday");
  }

  return response;
}

/**
 * Create multiple holidays in bulk
 */
export async function createHolidaysBulk(
  payloads: CreateHolidayPayload[]
): Promise<ApiResponse<CreateHolidayResponse[]>> {
  const response = await apiRequest<ApiResponse<CreateHolidayResponse[]>>(
    API_ENDPOINTS.attendance.holidayCalendar,
    {
      method: "POST",
      body: JSON.stringify(payloads),
    }
  );

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to create holidays");
  }

  return response;
}

/**
 * Update a holiday
 */
export async function updateHoliday(
  publicId: string,
  payload: CreateHolidayPayload
): Promise<ApiResponse<CreateHolidayResponse>> {
  const response = await apiRequest<ApiResponse<CreateHolidayResponse>>(
    `${API_ENDPOINTS.attendance.holidayCalendar}${publicId}/`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to update holiday");
  }

  return response;
}

/**
 * Delete a holiday
 */
export async function deleteHoliday(publicId: string): Promise<ApiResponse<null>> {
  const response = await apiRequest<ApiResponse<null>>(
    `${API_ENDPOINTS.attendance.holidayCalendar}${publicId}/`,
    {
      method: "DELETE",
    }
  );

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to delete holiday");
  }

  return response;
}

/**
 * Download holiday calendar template (Excel file)
 */
export async function downloadHolidayTemplate(): Promise<Blob> {
  const response = await fetch(`${API_ENDPOINTS.attendance.holidayCalendar}download-template/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to download template");
  }

  return await response.blob();
}

/**
 * Bulk upload holidays from Excel file
 */
export interface BulkUploadError {
  row: number;
  error: string;
  data: {
    start_date: string;
    end_date: string;
    holiday_type: string;
    description: string;
  };
}

export interface BulkUploadResult {
  success: boolean;
  created_count: number;
  failed_count: number;
  total_rows: number;
  errors: BulkUploadError[];
}

export async function bulkUploadHolidays(file: File): Promise<ApiResponse<BulkUploadResult>> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_ENDPOINTS.attendance.holidayCalendar}bulk-upload/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get color configuration for holiday types
 */
export function getHolidayTypeColor(type: HolidayType): {
  bg: string;
  text: string;
  border: string;
  badge: string;
} {
  const colors = {
    SUNDAY: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-300",
      badge: "bg-rose-400",
    },
    SATURDAY: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-300",
      badge: "bg-amber-400",
    },
    SECOND_SATURDAY: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      border: "border-yellow-300",
      badge: "bg-yellow-500",
    },
    NATIONAL_HOLIDAY: {
      bg: "bg-red-100",
      text: "text-red-700",
      border: "border-red-300",
      badge: "bg-red-500",
    },
    FESTIVAL: {
      bg: "bg-orange-100",
      text: "text-orange-700",
      border: "border-orange-300",
      badge: "bg-orange-500",
    },
    ORGANIZATION_HOLIDAY: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      border: "border-blue-300",
      badge: "bg-blue-500",
    },
    OTHER: {
      bg: "bg-gray-100",
      text: "text-gray-700",
      border: "border-gray-300",
      badge: "bg-gray-500",
    },
  };

  return colors[type] || colors.FESTIVAL;
}

/**
 * Format holiday type for display
 */
export function formatHolidayType(type: HolidayType): string {
  const labels: Record<HolidayType, string> = {
    SUNDAY: "Sunday",
    SATURDAY: "Saturday",
    SECOND_SATURDAY: "Second Saturday",
    NATIONAL_HOLIDAY: "National Holiday",
    FESTIVAL: "Festival",
    ORGANIZATION_HOLIDAY: "Organization Holiday",
    OTHER: "Other",
  };

  return labels[type] || type;
}

/**
 * Holiday type options for forms (excludes auto-generated weekend types)
 */
export const HOLIDAY_TYPE_OPTIONS = [
  { value: "NATIONAL_HOLIDAY" as const, label: "National Holiday" },
  { value: "FESTIVAL" as const, label: "Festival" },
  { value: "SECOND_SATURDAY" as const, label: "Second Saturday" },
  { value: "ORGANIZATION_HOLIDAY" as const, label: "Organization Holiday" },
  { value: "OTHER" as const, label: "Other" },
] as const;

/**
 * Calculate duration in days between two dates
 */
export function calculateDuration(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
  return diffDays;
}

/**
 * Get the nth occurrence of a weekday in a month
 * @param year - The year
 * @param month - The month (0-11)
 * @param weekday - The day of week (0=Sunday, 6=Saturday)
 * @param n - The occurrence number (1=first, 2=second, etc.)
 */
function getNthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): Date | null {
  const firstDay = new Date(year, month, 1);
  const firstWeekday = firstDay.getDay();
  
  // Calculate the date of the first occurrence
  let date = 1 + ((weekday - firstWeekday + 7) % 7);
  
  // Add weeks to get to the nth occurrence
  date += (n - 1) * 7;
  
  // Check if this date exists in the month
  const resultDate = new Date(year, month, date);
  if (resultDate.getMonth() !== month) {
    return null; // The nth occurrence doesn't exist this month
  }
  
  return resultDate;
}

/**
 * Check if a date is the nth occurrence of a weekday in its month
 */
export function isNthWeekdayOfMonth(date: Date, weekday: number, occurrences: number[]): boolean {
  if (date.getDay() !== weekday) return false;
  
  const year = date.getFullYear();
  const month = date.getMonth();
  
  for (const n of occurrences) {
    const nthDate = getNthWeekdayOfMonth(year, month, weekday, n);
    if (nthDate && nthDate.getDate() === date.getDate()) {
      return true;
    }
  }
  
  return false;
}
