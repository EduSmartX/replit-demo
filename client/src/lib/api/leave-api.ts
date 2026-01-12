/**
 * Leave Management API Functions
 * Handles all API calls related to leave allocations, types, and roles
 */

import { apiRequest, getAccessToken, API_ENDPOINTS } from "@/lib/api";

// Re-export for convenience
export { apiRequest, API_ENDPOINTS };

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

export interface LeaveTypesResponse {
  success: boolean;
  data: LeaveType[];
  pagination: {
    current_page: number;
    total_pages: number;
    count: number;
    page_size: number;
    has_next: boolean;
    has_previous: boolean;
    next_page: number | null;
    previous_page: number | null;
  };
}

export interface OrganizationRole {
  id: number;
  name: string;
  code: string;
  description: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface OrganizationRolesResponse {
  success: boolean;
  data: OrganizationRole[];
  pagination: {
    current_page: number;
    total_pages: number;
    count: number;
    page_size: number;
    has_next: boolean;
    has_previous: boolean;
    next_page: number | null;
    previous_page: number | null;
  };
}

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
  effective_from: string | null;
  effective_to: string | null;
  created_at: string;
  updated_at: string;
  created_by_public_id: string | null;
  created_by_name: string | null;
  updated_by_public_id: string | null;
  updated_by_name: string | null;
}

export interface LeaveAllocationsResponse {
  success: boolean;
  data: LeaveAllocation[];
  pagination: {
    current_page: number;
    total_pages: number;
    count: number;
    page_size: number;
    has_next: boolean;
    has_previous: boolean;
    next_page: number | null;
    previous_page: number | null;
  };
}

export interface LeaveAllocationResponse {
  status: string;
  message: string;
  data: {
    public_id: string;
    leave_type_name: string;
    total_days: string;
    max_carry_forward_days: string;
    roles: string;
    created_at: string;
    updated_at: string;
    created_by_public_id: string;
    created_by_name: string;
    updated_by_public_id: string;
    updated_by_name: string;
  };
  errors: null | Record<string, string[]>;
  code: number;
}

export interface LeaveAllocationErrorResponse {
  status: string;
  message: string;
  data: null;
  errors: Record<string, string[]>;
  code: number;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch all leave types from the system
 */
export async function fetchLeaveTypes(): Promise<LeaveTypesResponse> {
  return apiRequest<LeaveTypesResponse>(API_ENDPOINTS.core.leaveTypes, {
    method: "GET",
  });
}

/**
 * Fetch all organization role types
 */
export async function fetchOrganizationRoles(): Promise<OrganizationRolesResponse> {
  return apiRequest<OrganizationRolesResponse>(API_ENDPOINTS.core.organizationRoles, {
    method: "GET",
  });
}

/**
 * Create a new leave allocation
 */
export async function createLeaveAllocation(
  payload: LeaveAllocationPayload
): Promise<LeaveAllocationResponse> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Authentication required");
  }

  const response = await fetch(API_ENDPOINTS.leave.allocations, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    // Format error message for better display
    let errorMessage = data.message || "Failed to create leave allocation";
    
    if (data.errors) {
      const errorFields = Object.keys(data.errors);
      if (errorFields.length > 0) {
        const firstError = data.errors[errorFields[0]];
        if (Array.isArray(firstError) && firstError.length > 0) {
          errorMessage = `${errorFields[0]}: ${firstError[0]}`;
        }
      }
    }
    
    throw new Error(JSON.stringify(data));
  }

  return data;
}

/**
 * Fetch all leave allocations for the organization
 */
export async function fetchLeaveAllocations(params?: {
  page?: number;
  page_size?: number;
  leave_type?: number;
  role?: string;
  search?: string;
}): Promise<LeaveAllocationsResponse> {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.page_size) queryParams.append("page_size", params.page_size.toString());
  if (params?.leave_type) queryParams.append("leave_type", params.leave_type.toString());
  if (params?.role) queryParams.append("role", params.role);
  if (params?.search) queryParams.append("search", params.search);

  const url = `${API_ENDPOINTS.leave.allocations}${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  
  return apiRequest<LeaveAllocationsResponse>(url, {
    method: "GET",
  });
}

/**
 * Fetch a specific leave allocation by public ID
 */
export async function fetchLeaveAllocation(publicId: string): Promise<any> {
  return apiRequest(API_ENDPOINTS.leave.allocationDetail(publicId), {
    method: "GET",
  });
}

/**
 * Update a leave allocation
 */
export async function updateLeaveAllocation(
  publicId: string,
  payload: Partial<LeaveAllocationPayload>
): Promise<LeaveAllocationResponse> {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Authentication required");
  }

  const response = await fetch(API_ENDPOINTS.leave.allocationDetail(publicId), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
}

/**
 * Delete a leave allocation (soft delete)
 */
export async function deleteLeaveAllocation(publicId: string): Promise<any> {
  return apiRequest(API_ENDPOINTS.leave.allocationDetail(publicId), {
    method: "DELETE",
  });
}
