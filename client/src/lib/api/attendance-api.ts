/**
 * Attendance API
 * API functions for attendance management
 */

import { API_ENDPOINTS, apiRequest, type ApiResponse } from "@/lib/api";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface AttendanceRecord {
  public_id: string;
  user: {
    public_id: string;
    name: string;
    email: string;
    role: string;
  };
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: "PRESENT" | "ABSENT" | "HALF_DAY" | "ON_LEAVE";
  work_hours: number;
  created_at: string;
  updated_at: string;
}

export interface AttendanceSummary {
  total_days: number;
  present_days: number;
  absent_days: number;
  half_days: number;
  leave_days: number;
  attendance_percentage: number;
}

export interface MyAttendanceResponse {
  records: AttendanceRecord[];
  summary: AttendanceSummary;
}

export interface CheckInPayload {
  latitude?: number;
  longitude?: number;
  notes?: string;
}

export interface CheckOutPayload {
  latitude?: number;
  longitude?: number;
  notes?: string;
}

export interface TodayAttendanceResponse {
  has_checked_in: boolean;
  has_checked_out: boolean;
  check_in_time: string | null;
  check_out_time: string | null;
  status: string | null;
  work_hours: number | null;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get today's attendance status
 */
export async function getTodayAttendance(): Promise<ApiResponse<TodayAttendanceResponse>> {
  const response = await apiRequest<ApiResponse<TodayAttendanceResponse>>(
    `${API_ENDPOINTS.attendance.myAttendance}today/`,
    {
      method: "GET",
    }
  );

  return response;
}

/**
 * Check in for today
 */
export async function checkIn(
  payload: CheckInPayload = {}
): Promise<ApiResponse<AttendanceRecord>> {
  const response = await apiRequest<ApiResponse<AttendanceRecord>>(
    `${API_ENDPOINTS.attendance.myAttendance}check-in/`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to check in");
  }

  return response;
}

/**
 * Check out for today
 */
export async function checkOut(
  payload: CheckOutPayload = {}
): Promise<ApiResponse<AttendanceRecord>> {
  const response = await apiRequest<ApiResponse<AttendanceRecord>>(
    `${API_ENDPOINTS.attendance.myAttendance}check-out/`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to check out");
  }

  return response;
}

/**
 * Get my attendance history
 */
export async function getMyAttendance(params?: {
  start_date?: string;
  end_date?: string;
  status?: string;
}): Promise<ApiResponse<MyAttendanceResponse>> {
  const queryParams = new URLSearchParams();

  if (params?.start_date) {
    queryParams.append("start_date", params.start_date);
  }
  if (params?.end_date) {
    queryParams.append("end_date", params.end_date);
  }
  if (params?.status) {
    queryParams.append("status", params.status);
  }

  const url = queryParams.toString()
    ? `${API_ENDPOINTS.attendance.myAttendance}?${queryParams.toString()}`
    : API_ENDPOINTS.attendance.myAttendance;

  const response = await apiRequest<ApiResponse<MyAttendanceResponse>>(url, {
    method: "GET",
  });

  return response;
}
