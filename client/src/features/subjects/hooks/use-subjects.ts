/**
 * Subject Hooks
 * React Query hooks for subject-related operations
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  createSubject,
  deleteSubject,
  getSubject,
  getSubjects,
  updateSubject,
  type SubjectCreatePayload,
  type SubjectFilters,
  type SubjectUpdatePayload,
} from "@/lib/api/subject-api";
import { parseBackendValidationError } from "@/lib/utils/form-error-handler";

// Query keys
export const subjectKeys = {
  all: ["subjects"] as const,
  lists: () => [...subjectKeys.all, "list"] as const,
  list: (filters?: SubjectFilters) => [...subjectKeys.lists(), filters] as const,
  details: () => [...subjectKeys.all, "detail"] as const,
  detail: (id: string) => [...subjectKeys.details(), id] as const,
};

/**
 * Hook to fetch subjects with filters
 */
export function useSubjects(filters?: SubjectFilters) {
  return useQuery({
    queryKey: subjectKeys.list(filters),
    queryFn: () => getSubjects(filters),
  });
}

/**
 * Hook to fetch a single subject
 */
export function useSubject(publicId: string) {
  return useQuery({
    queryKey: subjectKeys.detail(publicId),
    queryFn: () => getSubject(publicId),
    enabled: !!publicId,
  });
}

/**
 * Hook to create a subject
 */
export function useCreateSubject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: SubjectCreatePayload) => createSubject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subjectKeys.lists() });
      toast({
        title: "Success",
        description: "Subject assigned successfully",
      });
    },
    onError: (error: unknown) => {
      const errorData = parseBackendValidationError(error);

      if (errorData?.errors) {
        // Extract all error messages
        const errorMessages = Object.entries(errorData.errors).flatMap(
          ([_field, messages]) => messages
        );

        toast({
          title: "Validation Error",
          description: errorMessages.join("\n• "),
          variant: "destructive",
        });
      } else {
        const err = error as Record<string, unknown>;
        toast({
          title: "Error",
          description:
            (typeof err?.message === "string" ? err.message : undefined) ||
            "Failed to assign subject",
          variant: "destructive",
        });
      }
    },
  });
}

/**
 * Hook to update a subject
 */
export function useUpdateSubject(publicId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: SubjectUpdatePayload) => updateSubject(publicId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subjectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: subjectKeys.detail(publicId) });
      toast({
        title: "Success",
        description: "Subject updated successfully",
      });
    },
    onError: (error: unknown) => {
      const errorData = parseBackendValidationError(error);

      if (errorData?.errors) {
        // Extract all error messages
        const errorMessages = Object.entries(errorData.errors).flatMap(
          ([_field, messages]) => messages
        );

        toast({
          title: "Validation Error",
          description: errorMessages.join("\n• "),
          variant: "destructive",
        });
      } else {
        const err = error as Record<string, unknown>;
        toast({
          title: "Error",
          description:
            (typeof err?.message === "string" ? err.message : undefined) ||
            "Failed to update subject",
          variant: "destructive",
        });
      }
    },
  });
}

/**
 * Hook to delete a subject
 */
export function useDeleteSubject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (publicId: string) => deleteSubject(publicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subjectKeys.lists() });
      toast({
        title: "Success",
        description: "Subject assignment deleted successfully",
      });
    },
    onError: (error: unknown) => {
      const errorData = parseBackendValidationError(error);

      if (errorData?.errors) {
        // Extract all error messages
        const errorMessages = Object.entries(errorData.errors).flatMap(
          ([_field, messages]) => messages
        );

        toast({
          title: "Validation Error",
          description: errorMessages.join("\n• "),
          variant: "destructive",
        });
      } else {
        const err = error as Record<string, unknown>;
        toast({
          title: "Error",
          description:
            (typeof err?.message === "string" ? err.message : undefined) ||
            "Failed to delete subject",
          variant: "destructive",
        });
      }
    },
  });
}
