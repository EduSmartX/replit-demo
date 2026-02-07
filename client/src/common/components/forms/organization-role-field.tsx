/**
 * Organization Role Select Field Component
 * Reusable dropdown for selecting organization roles
 * Fetches roles from API and provides default value option
 */

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest, type ApiResponse } from "@/lib/api";
import type { Control, FieldValues, Path } from "react-hook-form";

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export interface OrganizationRole {
  id: number;
  name: string;
  code: string;
  description: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch organization roles from API
 */
async function fetchOrganizationRoles(): Promise<OrganizationRole[]> {
  try {
    const response = await apiRequest<ApiResponse<OrganizationRole[]>>(
      `${API_BASE_URL}/api/core/organization-role-types/`,
      {
        method: "GET",
      }
    );

    if (!response || typeof response !== "object") {
      return [];
    }

    if ("success" in response && "data" in response) {
      if (!response.success || response.code < 200 || response.code >= 300) {
        console.error("Organization Roles API Error:", response.message);
        throw new Error(response.message || "Failed to fetch organization roles");
      }
      return response.data || [];
    }

    return [];
  } catch (error) {
    console.error("Error fetching organization roles:", error);
    return [];
  }
}

/**
 * Custom hook to fetch organization roles
 */
export function useOrganizationRoles() {
  return useQuery({
    queryKey: ["organization-roles"],
    queryFn: fetchOrganizationRoles,
    select: (data) => (Array.isArray(data) ? data : []),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

interface OrganizationRoleFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  defaultRoleCode?: string; // e.g., "TEACHER", "STUDENT"
}

/**
 * Organization Role Select Field
 * @param defaultRoleCode - The default role code to pre-fill (e.g., "TEACHER" for teachers, "STUDENT" for students)
 */
export function OrganizationRoleField<T extends FieldValues>({
  control,
  name,
  label = "Organization Role",
  placeholder = "Select organization role",
  required = false,
  disabled = false,
  defaultRoleCode,
}: OrganizationRoleFieldProps<T>) {
  const { data: orgRoles = [], isLoading } = useOrganizationRoles();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Auto-fill with default role code in useEffect to avoid setState during render
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (!field.value && defaultRoleCode && orgRoles.length > 0) {
            const defaultRole = orgRoles.find((role) => role.code === defaultRoleCode);
            if (defaultRole) {
              field.onChange(defaultRoleCode);
            }
          }
          // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [field.value, field]);

        return (
          <FormItem>
            <FormLabel>
              {label} {required && <span className="text-red-500">*</span>}
            </FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value as string}
              disabled={disabled || isLoading}
            >
              <FormControl>
                <SelectTrigger className="disabled:cursor-default disabled:opacity-100">
                  <SelectValue placeholder={isLoading ? "Loading roles..." : placeholder} />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="max-h-[300px] overflow-y-auto">
                {orgRoles.map((role) => (
                  <SelectItem key={role.id} value={role.code}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {defaultRoleCode && <FormDescription>Organization role for this user</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
