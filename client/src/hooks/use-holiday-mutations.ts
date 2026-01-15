/**
 * Holiday Mutation Hooks
 * Reusable mutation hooks for holiday CRUD operations with consistent error handling
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  createHoliday,
  createHolidaysBulk,
  updateHoliday,
  deleteHoliday,
} from "@/lib/api/holiday-api";
import type { CreateHolidayPayload } from "@/lib/api/holiday-api";

interface UseMutationOptions {
  onSuccess?: () => void;
  successMessage?: string;
}

/**
 * Hook for creating a single holiday
 */
export function useCreateHoliday(options?: UseMutationOptions) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holiday-calendar"] });
      toast({
        title: "Success",
        description: options?.successMessage || "Holiday created successfully",
      });
      options?.onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create holiday",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook for creating multiple holidays in bulk
 */
export function useCreateHolidaysBulk(options?: UseMutationOptions) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createHolidaysBulk,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["holiday-calendar"] });
      const count = Array.isArray(response.data) ? response.data.length : 1;
      toast({
        title: "Success",
        description:
          options?.successMessage ||
          `${count} holiday${count > 1 ? "s" : ""} created successfully`,
      });
      options?.onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create holidays",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook for updating a holiday
 */
export function useUpdateHoliday(options?: UseMutationOptions) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId, payload }: { publicId: string; payload: CreateHolidayPayload }) =>
      updateHoliday(publicId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holiday-calendar"] });
      toast({
        title: "Success",
        description: options?.successMessage || "Holiday updated successfully",
      });
      options?.onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to update holiday",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook for deleting a holiday
 */
export function useDeleteHoliday(options?: UseMutationOptions) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holiday-calendar"] });
      toast({
        title: "Success",
        description: options?.successMessage || "Holiday deleted successfully",
      });
      options?.onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete holiday",
        variant: "destructive",
      });
    },
  });
}
