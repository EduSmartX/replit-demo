/**
 * Standard API Response Types
 * These types are used across all API endpoints for consistency
 */

// ============================================================================
// Pagination Types
// ============================================================================

export interface Pagination {
  current_page: number;
  total_pages: number;
  count: number;
  page_size: number;
  has_next: boolean;
  has_previous: boolean;
  next_page: number | null;
  previous_page: number | null;
}

// ============================================================================
// Standard API Response Types
// ============================================================================

/**
 * Standard response for single item endpoints (GET, POST, PATCH, DELETE)
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  code: number;
  errors?: unknown;
}

/**
 * Standard response for list/paginated endpoints
 */
export interface ApiListResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: Pagination;
  code: number;
  errors?: unknown;
}

/**
 * Standard error response
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors: unknown;
  code: number;
  data?: null;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if API response is successful
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T> | ApiListResponse<T> | ApiErrorResponse
): response is ApiResponse<T> | ApiListResponse<T> {
  return response.success === true && response.code >= 200 && response.code < 300;
}

/**
 * Check if response is paginated
 */
export function isPaginatedResponse<T>(
  response: ApiResponse<T> | ApiListResponse<T>
): response is ApiListResponse<T> {
  return "pagination" in response;
}
