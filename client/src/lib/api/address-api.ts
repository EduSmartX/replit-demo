/**
 * Generic Address Management API
 * Can be used for Teachers, Students, Staff, and other user types
 */

import { apiRequest } from "../api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export interface Address {
  public_id?: string;
  id?: number;
  address_type?: string;
  street_address: string;
  address_line_2?: string;
  city: string;
  state: string;
  zip_code?: string;
  postal_code?: string;
  country: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  full_address?: string;
  location?: unknown | null;
  is_primary?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface UserWithAddress {
  public_id: string;
  username: string;
  first_name: string;
  last_name: string;
  address: Address;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: UserWithAddress;
  code: number;
}

/**
 * Update/Add user address
 * @param userPublicId - User's public_id (from user object, not teacher id)
 * @param addressData - Address data to update/add
 */
export async function updateUserAddress(
  userPublicId: string,
  addressData: Partial<Address>
): Promise<Address> {
  try {
    // Backend expects address data wrapped under "address" key
    const response = await apiRequest<ApiResponse>(
      `${API_BASE_URL}/api/users/profile/${userPublicId}/update-address/`,
      {
        method: "PATCH",
        body: JSON.stringify({ address: addressData }),
      }
    );

    // Backend returns { success, message, data: { address: {...} } }
    if (response.data && response.data.address) {
      return response.data.address;
    }

    // Fallback: check if response has success/code fields
    if (
      response.success === false ||
      (response.code && (response.code < 200 || response.code >= 300))
    ) {
      throw new Error(response.message || "Failed to update address");
    }

    // Last resort: try to extract address from response
    const fallbackResponse = response as unknown as { address?: Address };
    if (fallbackResponse.address) {
      return fallbackResponse.address;
    }

    throw new Error("Invalid response structure");
  } catch (error) {
    console.error("Update address error:", error);
    throw error;
  }
}
