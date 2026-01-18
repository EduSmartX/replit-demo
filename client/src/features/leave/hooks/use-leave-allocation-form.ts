import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  createLeaveAllocation,
  updateLeaveAllocation,
  fetchLeaveTypes,
  fetchOrganizationRoles,
  type LeaveAllocationPayload,
} from "@/lib/api/leave-api";
import { parseApiError } from "@/lib/error-parser";
import { setFormFieldErrors } from "@/lib/utils/form-error-handler";
import { LEAVE_FIELD_MAP, LeaveMessages } from "@/lib/constants";
import type { UseFormSetError } from "react-hook-form";
import type { LeaveAllocationFormValues } from "../schemas/leave-allocation-schema";

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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LeaveAllocationPayload) => createLeaveAllocation(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["leave-allocations"] });

      toast({
        title: "Success",
        description: response.message || LeaveMessages.Success.CREATED,
      });

      onSuccess?.();
    },
    onError: (error: unknown) => {
      // Early return pattern: If backend errors map to specific form fields via LEAVE_FIELD_MAP,
      // skip generic toast since field errors already displayed inline
      const hasFieldErrors = setFormFieldErrors(
        error,
        formSetError,
        LEAVE_FIELD_MAP as any
      );

      if (hasFieldErrors) {
        return;
      }

      const errorMessage = parseApiError(error, LeaveMessages.Error.CREATE_FAILED);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateLeaveAllocation(
  formSetError: UseFormSetError<LeaveAllocationFormValues>,
  onSuccess?: () => void
) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId, data }: { publicId: string; data: Partial<LeaveAllocationPayload> }) =>
      updateLeaveAllocation(publicId, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["leave-allocations"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["leave-allocation-detail", variables.publicId] });

      toast({
        title: "Success",
        description: response.message || LeaveMessages.Success.UPDATED,
      });

      onSuccess?.();
    },
    onError: (error: unknown) => {
      const hasFieldErrors = setFormFieldErrors(
        error,
        formSetError,
        LEAVE_FIELD_MAP as any
      );

      if (hasFieldErrors) {
        return;
      }

      const errorMessage = parseApiError(error, LeaveMessages.Error.UPDATE_FAILED);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
}
