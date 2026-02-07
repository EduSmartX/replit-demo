/**
 * Leave Management API Functions
 * Handles all API calls related to leave allocations, types, and roles
 */

import { API_ENDPOINTS, apiRequest } from "@/lib/api";
import type { ApiListResponse, ApiResponse } from "./types";

// Re-export for convenience
export { API_ENDPOINTS, apiRequest };

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface LeaveType {
  id: number;
  name: string;
  code: string;
  description: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Using standard API response types
export type LeaveTypesResponse = ApiListResponse<LeaveType>;

export interface OrganizationRole {
  id: number;
  name: string;
  code: string;
  description: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Using standard API response types
export type OrganizationRolesResponse = ApiListResponse<OrganizationRole>;

export interface LeaveAllocationPayload {
  leave_type: number;
  name: string;
  description: string;
  total_days: string;
  max_carry_forward_days: string;
  roles: number[];
  effective_from: string;
  effective_to?: string;
}

export interface LeaveAllocation {
  public_id: string;
  leave_type_id: number;
  leave_type_name: string;
  name: string | null;
  description: string | null;
  total_days: string;
  max_carry_forward_days: string;
  roles: string; // Comma-separated string of role names
  role_ids?: number[]; // Array of role IDs
  effective_from: string | null;
  effective_to: string | null;
  created_at: string;
  updated_at: string;
  created_by_public_id: string | null;
  created_by_name: string | null;
  updated_by_public_id: string | null;
  updated_by_name: string | null;
}

// Leave Balance interfaces
export interface LeaveBalance {
  public_id: string;
  user: {
    public_id: string;
    full_name: string;
    email: string;
    role: string;
  };
  leave_allocation: {
    public_id: string;
    name: string;
    display_name: string;
    leave_type: {
      id: number;
      name: string;
      code: string;
    };
  };
  total_allocated: number;
  used: number;
  pending: number;
  available: number;
  carried_forward: number;
  created_at: string;
  updated_at: string;
}

// Lightweight Leave Balance for dashboard
export interface LeaveBalanceSummary {
  public_id: string;
  leave_type_name: string;
  leave_type_code: string;
  total_allocated: number;
  used: number;
  pending: number;
  available: number;
  carried_forward: number;
}

// Leave Request interfaces
export interface LeaveRequest {
  public_id: string;
  user_public_id: string;
  user_name: string;
  user_role: string;
  organization_role: string;
  email: string;
  supervisor_name: string;
  supervisor_public_id: string;
  leave_balance_public_id: string;
  leave_balance: {
    public_id: string;
  };
  leave_type_code: string;
  leave_name: string;
  start_date: string;
  end_date: string;
  number_of_days: string;
  total_days: number;
  is_half_day: boolean;
  reason: string;
  remarks?: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  applied_at: string;
  reviewed_by_name: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_comments: string;
  can_be_cancelled: boolean;
  created_at: string;
  updated_at: string;
  created_by_public_id: string;
  created_by_name: string;
  updated_by_public_id: string;
  updated_by_name: string;
}

// Dashboard response interface
export interface LeaveDashboard {
  user: {
    public_id: string;
    name: string;
    email: string;
    role: string;
  };
  leave_balances: LeaveBalance[];
  leave_requests: LeaveRequest[];
  summary: {
    total_leave_types: number;
    total_requests: number;
    pending_requests: number;
  };
}

// Create Leave Request payload
export interface LeaveRequestPayload {
  leave_balance: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  number_of_days?: number;
  is_half_day?: boolean;
  reason: string;
  remarks?: string;
}

// Create Leave Balance payload
export interface LeaveBalancePayload {
  user: string; // public_id
  leave_allocation: string; // public_id
  total_allocated?: number;
  carried_forward?: number;
}

// Update Leave Balance payload
export interface LeaveBalanceUpdatePayload {
  total_allocated?: number;
  carried_forward?: number;
}

// Leave Request Review payload
export interface LeaveRequestReviewPayload {
  comments: string;
}

// User for selection
export interface User {
  public_id: string;
  full_name: string;
  email: string;
  role: string;
  organization_role?: string;
}

// Using standard API response types
export type LeaveAllocationsResponse = ApiListResponse<LeaveAllocation>;
export type LeaveAllocationResponse = ApiResponse<LeaveAllocation>;
export type LeaveDashboardResponse = ApiResponse<LeaveDashboard>;
export type LeaveBalancesResponse = ApiListResponse<LeaveBalance>;
export type LeaveBalanceResponse = ApiResponse<LeaveBalance>;
export type LeaveRequestsResponse = ApiListResponse<LeaveRequest>;
export type LeaveRequestResponse = ApiResponse<LeaveRequest>;
export type UsersResponse = ApiListResponse<User>;

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch all leave types from the system
 */
export async function fetchLeaveTypes(): Promise<LeaveTypesResponse> {
  const response = await apiRequest<LeaveTypesResponse>(API_ENDPOINTS.core.leaveTypes, {
    method: "GET",
  });

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to fetch leave types");
  }

  return response;
}

/**
 * Fetch all organization role types
 */
export async function fetchOrganizationRoles(): Promise<OrganizationRolesResponse> {
  try {
    const response = await apiRequest<unknown>(API_ENDPOINTS.core.organizationRoles, {
      method: "GET",
    });

    // Handle different response formats
    let rolesArray: OrganizationRole[] = [];

    // Check if response itself is an array (direct array response)
    if (Array.isArray(response)) {
      rolesArray = response;
    }
    // Check if response has data property
    else if (typeof response === "object" && response !== null && "data" in response) {
      const data = (response as { data: unknown }).data;
      // Check if data has results (paginated format)
      if (
        typeof data === "object" &&
        data !== null &&
        "results" in data &&
        Array.isArray((data as { results: unknown }).results)
      ) {
        rolesArray = (data as { results: OrganizationRole[] }).results;
      }
      // Check if data is directly an array
      else if (Array.isArray(data)) {
        rolesArray = data as OrganizationRole[];
      }
    }
    // Check if response itself has results
    else if (
      typeof response === "object" &&
      response !== null &&
      "results" in response &&
      Array.isArray((response as { results: unknown }).results)
    ) {
      rolesArray = (response as { results: OrganizationRole[] }).results;
    }

    // Return in expected format
    return {
      success: true,
      message: "Roles fetched successfully",
      data: rolesArray,
      pagination: {
        current_page: 1,
        total_pages: 1,
        count: rolesArray.length,
        page_size: rolesArray.length,
        has_next: false,
        has_previous: false,
        next_page: null,
        previous_page: null,
      },
      code: 200,
    };
  } catch (error) {
    console.error("Error fetching organization roles:", error);
    throw error;
  }
}

/**
 * Create a new leave allocation
 */
export async function createLeaveAllocation(
  payload: LeaveAllocationPayload
): Promise<LeaveAllocationResponse> {
  const response = await apiRequest<LeaveAllocationResponse>(API_ENDPOINTS.leave.allocations, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.success || response.code < 200 || response.code >= 300) {
    // Format error message for better display
    let errorMessage = response.message || "Failed to create leave allocation";

    if (response.errors && typeof response.errors === "object") {
      const errors = response.errors as Record<string, unknown>;
      const errorFields = Object.keys(errors);
      if (errorFields.length > 0) {
        const firstError = errors[errorFields[0]];
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
 * Fetch all leave allocations for the organization
 */
export async function fetchLeaveAllocations(params?: {
  page?: number;
  page_size?: number;
  leave_type?: number;
  role?: number;
  search?: string;
}): Promise<LeaveAllocationsResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page) {
    queryParams.append("page", params.page.toString());
  }
  if (params?.page_size) {
    queryParams.append("page_size", params.page_size.toString());
  }
  if (params?.leave_type) {
    queryParams.append("leave_type", params.leave_type.toString());
  }
  if (params?.role) {
    queryParams.append("role", params.role.toString());
  }
  if (params?.search) {
    queryParams.append("search", params.search);
  }

  const url = `${API_ENDPOINTS.leave.allocations}${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const response = await apiRequest<LeaveAllocationsResponse>(url, {
    method: "GET",
  });

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to fetch leave allocations");
  }

  return response;
}

/**
 * Fetch leave allocations for a specific user (filtered by role and gender on backend)
 */
export async function fetchLeaveAllocationsForUser(
  userPublicId: string
): Promise<LeaveAllocationsResponse> {
  const url = `${API_ENDPOINTS.leave.allocations}for-user/?user_public_id=${userPublicId}`;

  const response = await apiRequest<LeaveAllocationsResponse>(url, {
    method: "GET",
  });

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to fetch allocations for user");
  }

  return response;
}

/**
 * Fetch a specific leave allocation by public ID
 */
export async function fetchLeaveAllocation(publicId: string): Promise<LeaveAllocationResponse> {
  const response = await apiRequest<LeaveAllocationResponse>(
    API_ENDPOINTS.leave.allocationDetail(publicId),
    {
      method: "GET",
    }
  );

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to fetch leave allocation");
  }

  return response;
}

/**
 * Update a leave allocation
 */
export async function updateLeaveAllocation(
  publicId: string,
  payload: Partial<LeaveAllocationPayload>
): Promise<LeaveAllocationResponse> {
  const response = await apiRequest<LeaveAllocationResponse>(
    API_ENDPOINTS.leave.allocationDetail(publicId),
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );

  if (!response.success || response.code < 200 || response.code >= 300) {
    let errorMessage = response.message || "Failed to update leave allocation";

    if (response.errors && typeof response.errors === "object") {
      const errors = response.errors as Record<string, unknown>;
      const errorFields = Object.keys(errors);
      if (errorFields.length > 0) {
        const firstError = errors[errorFields[0]];
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
 * Delete a leave allocation (soft delete)
 */
export async function deleteLeaveAllocation(publicId: string): Promise<ApiResponse<null>> {
  const response = await apiRequest<ApiResponse<null>>(
    API_ENDPOINTS.leave.allocationDetail(publicId),
    {
      method: "DELETE",
    }
  );

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to delete leave allocation");
  }

  return response;
}

// ============================================================================
// Leave Balance & Request Functions
// ============================================================================

/**
 * Fetch current user's leave dashboard (balances + requests)
 */
export async function fetchMyLeaveDashboard(): Promise<LeaveDashboardResponse> {
  const response = await apiRequest<LeaveDashboardResponse>(
    `${API_ENDPOINTS.leave.balances}my-dashboard/`,
    {
      method: "GET",
    }
  );

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to fetch leave dashboard");
  }

  return response;
}

/**
 * Fetch current user's leave balances only (without requests)
 */
export async function fetchMyLeaveBalances(): Promise<LeaveBalancesResponse> {
  const response = await apiRequest<LeaveBalancesResponse>(
    `${API_ENDPOINTS.leave.balances}my-balance/`,
    {
      method: "GET",
    }
  );

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to fetch leave balances");
  }

  return response;
}

/**
 * Fetch lightweight leave balance summary for dashboard (only essential fields)
 */
export async function fetchMyLeaveBalancesSummary(): Promise<ApiResponse<LeaveBalanceSummary[]>> {
  const response = await apiRequest<ApiResponse<LeaveBalanceSummary[]>>(
    `${API_ENDPOINTS.leave.balances}summary/`,
    {
      method: "GET",
    }
  );

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to fetch leave balance summary");
  }

  return response;
}

/**
 * Fetch current user's leave requests with pagination and filters
 */
export async function fetchMyLeaveRequests(params?: {
  page?: number;
  page_size?: number;
  status?: string;
  start_date?: string;
  end_date?: string;
  start_date__gte?: string;
  end_date__lte?: string;
  leave_type?: string;
  leave_type__name?: string;
  number_of_days?: number;
  number_of_days__gte?: number;
  number_of_days__lte?: number;
  is_reviewed?: boolean;
}): Promise<LeaveRequestsResponse> {
  const queryParams = new URLSearchParams();

  if (params?.page) {
    queryParams.append("page", params.page.toString());
  }
  if (params?.page_size) {
    queryParams.append("page_size", params.page_size.toString());
  }
  if (params?.status) {
    queryParams.append("status", params.status);
  }
  if (params?.start_date) {
    queryParams.append("start_date", params.start_date);
  }
  if (params?.end_date) {
    queryParams.append("end_date", params.end_date);
  }
  if (params?.start_date__gte) {
    queryParams.append("start_date__gte", params.start_date__gte);
  }
  if (params?.end_date__lte) {
    queryParams.append("end_date__lte", params.end_date__lte);
  }
  if (params?.leave_type) {
    queryParams.append("leave_type", params.leave_type);
  }
  if (params?.leave_type__name) {
    queryParams.append("leave_type__name", params.leave_type__name);
  }
  if (params?.number_of_days !== undefined) {
    queryParams.append("number_of_days", params.number_of_days.toString());
  }
  if (params?.number_of_days__gte !== undefined) {
    queryParams.append("number_of_days__gte", params.number_of_days__gte.toString());
  }
  if (params?.number_of_days__lte !== undefined) {
    queryParams.append("number_of_days__lte", params.number_of_days__lte.toString());
  }
  if (params?.is_reviewed !== undefined) {
    queryParams.append("is_reviewed", params.is_reviewed.toString());
  }

  const url = `${API_ENDPOINTS.leave.requests}${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const response = await apiRequest<LeaveRequestsResponse>(url, {
    method: "GET",
  });

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to fetch leave requests");
  }

  return response;
}

/**
 * Fetch another user's leave balance summary (for managers/admins)
 */
export async function fetchUserLeaveBalancesSummary(
  userPublicId: string
): Promise<ApiResponse<LeaveBalanceSummary[]>> {
  const response = await apiRequest<ApiResponse<LeaveBalanceSummary[]>>(
    `${API_ENDPOINTS.leave.balances}summary/?user=${userPublicId}`,
    {
      method: "GET",
    }
  );

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to fetch user leave balance summary");
  }

  return response;
}

/**
 * Fetch another user's leave requests (for managers/admins)
 */
export async function fetchUserLeaveRequests(
  userPublicId: string,
  params?: {
    page?: number;
    page_size?: number;
    status?: string;
    start_date__gte?: string;
    end_date__lte?: string;
    leave_type__name?: string;
  }
): Promise<LeaveRequestsResponse> {
  const queryParams = new URLSearchParams();

  queryParams.append("user", userPublicId);

  if (params?.page) {
    queryParams.append("page", params.page.toString());
  }
  if (params?.page_size) {
    queryParams.append("page_size", params.page_size.toString());
  }
  if (params?.status) {
    queryParams.append("status", params.status);
  }
  if (params?.start_date__gte) {
    queryParams.append("start_date__gte", params.start_date__gte);
  }
  if (params?.end_date__lte) {
    queryParams.append("end_date__lte", params.end_date__lte);
  }
  if (params?.leave_type__name) {
    queryParams.append("leave_type__name", params.leave_type__name);
  }

  const url = `${API_ENDPOINTS.leave.requests}?${queryParams.toString()}`;

  const response = await apiRequest<LeaveRequestsResponse>(url, {
    method: "GET",
  });

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to fetch user leave requests");
  }

  return response;
}

/**
 * Fetch a single leave request by ID
 */
export async function fetchLeaveRequestById(publicId: string): Promise<LeaveRequestResponse> {
  const response = await apiRequest<LeaveRequestResponse>(
    `${API_ENDPOINTS.leave.requests}${publicId}/`,
    {
      method: "GET",
    }
  );

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to fetch leave request");
  }

  return response;
}

/**
 * Create a new leave request
 */
export async function createLeaveRequest(
  payload: LeaveRequestPayload
): Promise<LeaveRequestResponse> {
  const response = await apiRequest<LeaveRequestResponse>(`${API_ENDPOINTS.leave.requests}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.success || response.code < 200 || response.code >= 300) {
    let errorMessage = response.message || "Failed to create leave request";

    if (response.errors) {
      const errors = response.errors as Record<string, unknown>;
      const allErrors: string[] = [];

      // Prioritize non_field_errors
      if (errors.non_field_errors && Array.isArray(errors.non_field_errors)) {
        allErrors.push(...errors.non_field_errors);
      }

      // Add field-specific errors
      Object.entries(errors).forEach(([field, messages]) => {
        if (field !== "non_field_errors" && Array.isArray(messages)) {
          messages.forEach((msg) => {
            allErrors.push(`${field}: ${msg}`);
          });
        } else if (field !== "non_field_errors" && typeof messages === "string") {
          allErrors.push(`${field}: ${messages}`);
        }
      });

      if (allErrors.length > 0) {
        errorMessage = allErrors.join("\n");
      }
    }

    throw new Error(errorMessage);
  }

  return response;
}

/**
 * Update a leave request (only PENDING requests)
 */
export async function updateLeaveRequest(
  publicId: string,
  payload: Partial<LeaveRequestPayload>
): Promise<LeaveRequestResponse> {
  const response = await apiRequest<LeaveRequestResponse>(
    `${API_ENDPOINTS.leave.requests}${publicId}/`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );

  if (!response.success || response.code < 200 || response.code >= 300) {
    let errorMessage = response.message || "Failed to update leave request";

    if (response.errors) {
      const errors = response.errors as Record<string, unknown>;
      const allErrors: string[] = [];

      // Prioritize non_field_errors
      if (errors.non_field_errors && Array.isArray(errors.non_field_errors)) {
        allErrors.push(...errors.non_field_errors);
      }

      // Add field-specific errors
      Object.entries(errors).forEach(([field, messages]) => {
        if (field !== "non_field_errors" && Array.isArray(messages)) {
          messages.forEach((msg) => {
            allErrors.push(`${field}: ${msg}`);
          });
        } else if (field !== "non_field_errors" && typeof messages === "string") {
          allErrors.push(`${field}: ${messages}`);
        }
      });

      if (allErrors.length > 0) {
        errorMessage = allErrors.join("\n");
      }
    }

    throw new Error(errorMessage);
  }

  return response;
}

/**
 * Cancel a leave request (only PENDING requests)
 */
export async function cancelLeaveRequest(publicId: string): Promise<LeaveRequestResponse> {
  const response = await apiRequest<LeaveRequestResponse>(
    `${API_ENDPOINTS.leave.requests}${publicId}/cancel/`,
    {
      method: "POST",
    }
  );

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to cancel leave request");
  }

  return response;
}

/**
 * Fetch a specific leave request by public ID
 */
export async function fetchLeaveRequest(publicId: string): Promise<LeaveRequestResponse> {
  const response = await apiRequest<LeaveRequestResponse>(
    `${API_ENDPOINTS.leave.requests}${publicId}/`,
    {
      method: "GET",
    }
  );

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to fetch leave request");
  }

  return response;
}

// ============================================================================
// Leave Balance Management Functions (for Admin/Teacher)
// ============================================================================

/**
 * Create a new leave balance for a user
 */
export async function createLeaveBalance(
  payload: LeaveBalancePayload
): Promise<LeaveBalanceResponse> {
  const response = await apiRequest<LeaveBalanceResponse>(API_ENDPOINTS.leave.balances, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.success || response.code < 200 || response.code >= 300) {
    let errorMessage = response.message || "Failed to create leave balance";

    if (response.errors && typeof response.errors === "object") {
      const errors = response.errors as Record<string, unknown>;
      const errorFields = Object.keys(errors);
      if (errorFields.length > 0) {
        const firstError = errors[errorFields[0]];
        if (Array.isArray(firstError) && firstError.length > 0) {
          errorMessage = `${errorFields[0]}: ${firstError[0]}`;
        } else if (typeof firstError === "string") {
          errorMessage = `${errorFields[0]}: ${firstError}`;
        }
      }
    }

    throw new Error(errorMessage);
  }

  return response;
}

/**
 * Update a leave balance
 */
export async function updateLeaveBalance(
  publicId: string,
  payload: LeaveBalanceUpdatePayload
): Promise<LeaveBalanceResponse> {
  const response = await apiRequest<LeaveBalanceResponse>(
    `${API_ENDPOINTS.leave.balances}${publicId}/`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );

  if (!response.success || response.code < 200 || response.code >= 300) {
    let errorMessage = response.message || "Failed to update leave balance";

    if (response.errors && typeof response.errors === "object") {
      const errors = response.errors as Record<string, unknown>;
      const errorFields = Object.keys(errors);
      if (errorFields.length > 0) {
        const firstError = errors[errorFields[0]];
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
 * Delete a leave balance (soft delete)
 */
export async function deleteLeaveBalance(publicId: string): Promise<ApiResponse<null>> {
  const response = await apiRequest<ApiResponse<null>>(
    `${API_ENDPOINTS.leave.balances}${publicId}/`,
    {
      method: "DELETE",
    }
  );

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to delete leave balance");
  }

  return response;
}

/**
 * Fetch users for leave balance assignment
 * (For Admin: all org users, For Teacher: their students)
 */
export async function fetchManageableUsers(params?: {
  role?: string;
  search?: string;
}): Promise<UsersResponse> {
  const queryParams = new URLSearchParams();

  if (params?.role) {
    queryParams.append("role", params.role);
  }
  if (params?.search) {
    queryParams.append("search", params.search);
  }

  const url = `${API_ENDPOINTS.users.list}${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const response = await apiRequest<UsersResponse>(url, {
    method: "GET",
  });

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to fetch users");
  }

  return response;
}

// ...existing code...

/**
 * Calculate working days between dates based on organization policies
 */
export interface CalculateWorkingDaysPayload {
  start_date: string; // YYYY-MM-DD format
  end_date: string; // YYYY-MM-DD format
  exclude_leave_public_id?: string; // Optional: exclude this leave request when checking conflicts (used in edit mode)
}

export interface HolidayInfo {
  date: string;
  description: string;
  type: string;
}

export interface CalculateWorkingDaysResponse {
  working_days: number;
  total_days: number;
  start_date: string;
  end_date: string;
  holidays: HolidayInfo[];
}

export async function calculateWorkingDays(
  payload: CalculateWorkingDaysPayload
): Promise<ApiResponse<CalculateWorkingDaysResponse>> {
  const response = await apiRequest<ApiResponse<CalculateWorkingDaysResponse>>(
    `${API_ENDPOINTS.leave.requests}calculate-working-days/`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to calculate working days");
  }

  return response;
}

// ============================================================================
// Leave Request Reviews
// ============================================================================

/**
 * Fetch pending leave requests for review
 */
export async function fetchLeaveRequestReviews(params?: {
  role?: "staff" | "student";
  status?: string;
  leave_type__name?: string;
  start_date__gte?: string;
  end_date__lte?: string;
  page?: number;
  page_size?: number;
  [key: string]: string | number | undefined;
}): Promise<LeaveRequestsResponse> {
  const queryParams = new URLSearchParams();

  // Add all filter parameters dynamically
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value.toString());
      }
    });
  }

  const url = `${API_ENDPOINTS.leave.reviews}${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;

  const response = await apiRequest<LeaveRequestsResponse>(url, {
    method: "GET",
  });

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to fetch leave request reviews");
  }

  return response;
}

/**
 * Get leave request details for review
 */
export async function fetchLeaveRequestReviewDetails(
  publicId: string
): Promise<LeaveRequestResponse> {
  const response = await apiRequest<LeaveRequestResponse>(
    `${API_ENDPOINTS.leave.reviews}/${publicId}/`,
    {
      method: "GET",
    }
  );

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to fetch leave request details");
  }

  return response;
}

/**
 * Approve leave request
 */
export async function approveLeaveRequest(
  publicId: string,
  payload: LeaveRequestReviewPayload
): Promise<LeaveRequestResponse> {
  const response = await apiRequest<LeaveRequestResponse>(
    `${API_ENDPOINTS.leave.reviews}/${publicId}/approve/`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to approve leave request");
  }

  return response;
}

/**
 * Reject leave request
 */
export async function rejectLeaveRequest(
  publicId: string,
  payload: LeaveRequestReviewPayload
): Promise<LeaveRequestResponse> {
  const response = await apiRequest<LeaveRequestResponse>(
    `${API_ENDPOINTS.leave.reviews}/${publicId}/reject/`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to reject leave request");
  }

  return response;
}

/**
 * Fetch leave balances for a specific user
 */
export async function fetchUserLeaveBalances(userPublicId: string): Promise<
  ApiResponse<{
    user: {
      public_id: string;
      name: string;
      email: string;
      role: string;
      gender?: string;
    };
    balances: Array<LeaveBalance>;
    total_count: number;
  }>
> {
  const url = `${API_ENDPOINTS.leave.balances}user/${userPublicId}/`;

  const response = await apiRequest<
    ApiResponse<{
      user: {
        public_id: string;
        name: string;
        email: string;
        role: string;
      };
      balances: Array<LeaveBalance>;
      total_count: number;
    }>
  >(url, {
    method: "GET",
  });

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to fetch user leave balances");
  }

  return response;
}

/**
 * Fetch all manageable users with balances
 */
export async function fetchManageableUsersWithBalances(filters?: {
  role?: string;
  class_id?: string;
}): Promise<
  ApiResponse<{
    users: Array<{
      public_id: string;
      full_name: string;
      email: string;
      role: string;
      role_display: string;
      organization_role?: string;
      gender?: string;
      employee_id?: string;
      subjects?: string[];
      roll_number?: string;
    }>;
    total_users: number;
  }>
> {
  const params = new URLSearchParams();

  if (filters?.role) {
    params.append("role", filters.role);
  }

  if (filters?.class_id) {
    params.append("class_id", filters.class_id);
  }

  const url = `${API_ENDPOINTS.users.manageableUsers}${params.toString() ? `?${params.toString()}` : ""}`;

  const response = await apiRequest<
    ApiResponse<{
      users: Array<{
        public_id: string;
        full_name: string;
        email: string;
        role: string;
        role_display: string;
        organization_role?: string;
        gender?: string;
        employee_id?: string;
        subjects?: string[];
        roll_number?: string;
      }>;
      total_users: number;
    }>
  >(url, {
    method: "GET",
  });

  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to fetch manageable users");
  }

  return response;
}

/**
 * Create leave balance payload
 */
export interface CreateLeaveBalancePayload {
  user: string; // user public_id
  leave_allocation: string; // allocation public_id
  total_allocated: number;
  carried_forward?: number;
}

/**
 * Update leave balance payload
 */
export interface UpdateLeaveBalancePayload {
  total_allocated?: number;
  carried_forward?: number;
}
