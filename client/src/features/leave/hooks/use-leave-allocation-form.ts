import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createLeaveAllocation,
  updateLeaveAllocation,
  fetchLeaveTypes,
  fetchOrganizationRoles,
  type LeaveAllocationPayload,
} from "@/lib/api/leave-api";
import { LEAVE_FIELD_MAP, LeaveMessages } from "@/lib/constants";
import { parseApiError } from "@/lib/error-parser";
import { setFormFieldErrors } from "@/lib/utils/form-error-handler";
import type { LeaveAllocationFormValues } from "../schemas/leave-allocation-schema";
import type { UseFormSetError } from "react-hook-form";

export function useLeaveTypes() {
  const { data, isLoading } = useQuery({
    queryKey: ["leave-types"],
    queryFn: fetchLeaveTypes,
  });

  return {
    leaveTypes: data?.data || [],
    isLoading,
  };
}

export function useOrganizationRoles() {
  const { data, isLoading } = useQuery({
    queryKey: ["organization-roles"],
    queryFn: fetchOrganizationRoles,
  });

  const roles = Array.isArray(data) ? data : data?.data || [];

  return {
    roles,
    isLoading,
  };
}

export function useCreateLeaveAllocation(
  formSetError: UseFormSetError<LeaveAllocationFormValues>,
  onSuccess?: () => void
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LeaveAllocationPayload) => createLeaveAllocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-allocations"] });
      onSuccess?.();
    },
    onError: (error: unknown) => {
      // Early return pattern: If backend errors map to specific form fields via LEAVE_FIELD_MAP,
      // skip generic toast since field errors already displayed inline
      const hasFieldErrors = setFormFieldErrors(
        error,
        formSetError,
        LEAVE_FIELD_MAP
      );

      if (hasFieldErrors) {
        return;
      }

      const errorMessage = parseApiError(error, LeaveMessages.Error.CREATE_FAILED);
      // Error handling without toast - errors shown inline or via dialog
      console.error("Create leave allocation error:", errorMessage);
    },
  });
}

export function useUpdateLeaveAllocation(
  formSetError: UseFormSetError<LeaveAllocationFormValues>,
  onSuccess?: () => void
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId, data }: { publicId: string; data: Partial<LeaveAllocationPayload> }) =>
      updateLeaveAllocation(publicId, data),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["leave-allocations"], 
        exact: false,
        refetchType: "none"
      });
      // Invalidate and refetch only the detail that was updated
      queryClient.invalidateQueries({ 
        queryKey: ["leave-allocation-detail", variables.publicId],
        refetchType: "active"
      });
      onSuccess?.();
    },
    onError: (error: unknown) => {
      const hasFieldErrors = setFormFieldErrors(
        error,
        formSetError,
        LEAVE_FIELD_MAP
      );

      if (hasFieldErrors) {
        return;
      }

      const errorMessage = parseApiError(error, LeaveMessages.Error.UPDATE_FAILED);
      // Error handling without toast - errors shown inline or via dialog
      console.error("Update leave allocation error:", errorMessage);
    },
  });
}
