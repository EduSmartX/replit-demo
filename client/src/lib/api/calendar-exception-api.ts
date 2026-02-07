/**
 * Calendar Exception API Service
 * Handles all API calls for calendar exceptions
 */

import { api, API_ENDPOINTS } from "../api";
import type {
  BulkCreateCalendarExceptionsRequest,
  BulkCreateCalendarExceptionsResponse,
  CalendarException,
  CalendarExceptionCreate,
  CalendarExceptionUpdate,
} from "./calendar-exception-types";
import type { ApiListResponse, ApiResponse } from "./types";

export interface CalendarExceptionFilters {
  page?: number;
  page_size?: number;
  ordering?: string;
  search?: string;
  override_type?: string;
  from_date?: string;
  to_date?: string;
  is_applicable_to_all_classes?: string;
  classes?: string[]; // Array of class public IDs
  [key: string]: string | number | string[] | undefined;
}

/**
 * Fetch calendar exceptions with filtering and pagination
 */
export async function fetchCalendarExceptions(
  filters?: CalendarExceptionFilters
): Promise<ApiListResponse<CalendarException>> {
  const params = new URLSearchParams();

  if (filters?.page) {
    params.append("page", filters.page.toString());
  }
  if (filters?.page_size) {
    params.append("page_size", filters.page_size.toString());
  }
  if (filters?.ordering) {
    params.append("ordering", filters.ordering);
  }
  if (filters?.search) {
    params.append("search", filters.search);
  }
  if (filters?.override_type) {
    params.append("override_type", filters.override_type);
  }
  if (filters?.from_date) {
    params.append("from_date", filters.from_date);
  }
  if (filters?.to_date) {
    params.append("to_date", filters.to_date);
  }
  if (filters?.is_applicable_to_all_classes) {
    params.append("is_applicable_to_all_classes", filters.is_applicable_to_all_classes);
  }
  if (filters?.classes && filters.classes.length > 0) {
    filters.classes.forEach((classId) => {
      params.append("classes", classId);
    });
  }

  const queryString = params.toString();
  const url = queryString
    ? `${API_ENDPOINTS.attendance.calendarException}?${queryString}`
    : API_ENDPOINTS.attendance.calendarException;

  const response = await api.get<ApiListResponse<CalendarException>>(url);
  return response;
}

/**
 * Fetch a single calendar exception by public_id
 */
export async function fetchCalendarException(publicId: string): Promise<CalendarException> {
  const response = await api.get<ApiResponse<CalendarException>>(
    API_ENDPOINTS.attendance.calendarExceptionDetail(publicId)
  );
  return response.data;
}

/**
 * Create a new calendar exception
 */
export async function createCalendarException(
  data: CalendarExceptionCreate
): Promise<CalendarException> {
  const response = await api.post<ApiResponse<CalendarException>>(
    API_ENDPOINTS.attendance.calendarException,
    data
  );
  return response.data;
}

/**
 * Update a calendar exception (full update)
 */
export async function updateCalendarException(
  publicId: string,
  data: CalendarExceptionUpdate
): Promise<CalendarException> {
  const response = await api.put<ApiResponse<CalendarException>>(
    API_ENDPOINTS.attendance.calendarExceptionDetail(publicId),
    data
  );
  return response.data;
}

/**
 * Update a calendar exception (partial update)
 */
export async function patchCalendarException(
  publicId: string,
  data: Partial<CalendarExceptionUpdate>
): Promise<CalendarException> {
  const response = await api.patch<ApiResponse<CalendarException>>(
    API_ENDPOINTS.attendance.calendarExceptionDetail(publicId),
    data
  );
  return response.data;
}

/**
 * Delete a calendar exception
 */
export async function deleteCalendarException(publicId: string): Promise<void> {
  await api.delete<void>(API_ENDPOINTS.attendance.calendarExceptionDetail(publicId));
}

/**
 * Bulk create calendar exceptions
 */
export async function bulkCreateCalendarExceptions(
  data: BulkCreateCalendarExceptionsRequest
): Promise<BulkCreateCalendarExceptionsResponse> {
  const response = await api.post<ApiResponse<BulkCreateCalendarExceptionsResponse>>(
    API_ENDPOINTS.attendance.calendarExceptionBulkCreate,
    data
  );
  return response.data;
}
