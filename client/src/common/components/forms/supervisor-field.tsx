/**
 * Supervisor Field Component (Reusable)
 * Dropdown to select a supervisor from organization users.
 * Auto-fetches users and formats them for display.
 * Used in Teacher and Student forms.
 */

import { useQuery } from "@tanstack/react-query";
import { apiRequest, type ApiResponse } from "@/lib/api";
import { SelectField } from "./form-fields";
import type { Control } from "react-hook-form";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface OrganizationUser {
  email: string;
  full_name: string;
  public_id: string;
}

interface SupervisorFieldProps {
  control: Control<any>;
  name: string;
  disabled?: boolean;
  description?: string;
}

/**
 * Fetch organization users for supervisor selection
 */
function useOrganizationUsers() {
  return useQuery<OrganizationUser[]>({
    queryKey: ["organization-users"],
    queryFn: async () => {
      const response = await apiRequest<ApiResponse<OrganizationUser[]>>(
        `${API_BASE_URL}/api/users/supervisors/`,
        {
          method: "GET",
        }
      );
      
      if (!response || typeof response !== "object") {
        return [];
      }

      if ("success" in response && "data" in response) {
        if (!response.success || response.code < 200 || response.code >= 300) {
          console.error("Supervisors API Error:", response.message);
          throw new Error(response.message || "Failed to fetch supervisors");
        }
        return response.data || [];
      }

      return Array.isArray(response) ? response : [];
    },
  });
}

/**
 * Reusable Supervisor Field Component
 * Displays a dropdown of organization users formatted as "Full Name (email)"
 */
export function SupervisorField({
  control,
  name,
  disabled = false,
  description = "Optional: Assign a supervisor for this user",
}: SupervisorFieldProps) {
  const { data: users = [], isLoading } = useOrganizationUsers();

  return (
    <SelectField
      control={control}
      name={name}
      label="Supervisor"
      placeholder="Select supervisor"
      options={users.map((user) => ({
        value: user.email,
        label: `${user.full_name} (${user.email})`,
      }))}
      disabled={disabled || isLoading}
      description={description}
    />
  );
}
