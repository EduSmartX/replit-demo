/**
 * Leave Management API Functions
 * Handles all API calls related to leave allocations, types, and roles
 */

import { apiRequest, getAccessToken, API_ENDPOINTS } from "@/lib/api";
import type { ApiResponse, ApiListResponse } from "./types";

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
  effective_from: string | null;
  effective_to: string | null;
  created_at: string;
  updated_at: string;
  created_by_public_id: string | null;
  created_by_name: string | null;
  updated_by_public_id: string | null;
  updated_by_name: string | null;
}

// Using standard API response types
export type LeaveAllocationsResponse = ApiListResponse<LeaveAllocation>;
export type LeaveAllocationResponse = ApiResponse<LeaveAllocation>;

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
  const response = await apiRequest<OrganizationRolesResponse>(API_ENDPOINTS.core.organizationRoles, {
    method: "GET",
  });
  
  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to fetch organization roles");
  }
  
  return response;
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
  
  const response = await apiRequest<LeaveAllocationsResponse>(url, {
    method: "GET",
  });
  
  if (!response.success || response.code < 200 || response.code >= 300) {
    throw new Error(response.message || "Failed to fetch leave allocations");
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
