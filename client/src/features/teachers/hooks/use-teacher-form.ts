import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from "@tanstack/react-query";
import type { UseFormSetError } from "react-hook-form";
import {
  createTeacher,
  updateTeacher,
  fetchSubjects,
  fetchOrganizationRoles,
  fetchOrganizationUsers,
  type TeacherCreatePayload,
  type TeacherUpdatePayload,
  type Teacher,
  type Subject,
  type OrganizationRole,
} from "@/lib/api/teacher-api";
import { setFormFieldErrors } from "@/lib/utils/form-error-handler";
import { TEACHER_FIELD_MAP } from "@/lib/constants/form-field-maps";
import { useToast } from "@/hooks/use-toast";
import { TeacherMessages, type TeacherFormValues } from "@/features/teachers";

type OrganizationUser = {
  email: string;
  full_name: string;
  public_id: string;
};

export function useSubjects(): UseQueryResult<Subject[]> {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: fetchSubjects,
    select: (data) => (Array.isArray(data) ? data : []),
  });
}

export function useOrganizationRoles(): UseQueryResult<OrganizationRole[]> {
  return useQuery({
    queryKey: ["organization-roles"],
    queryFn: fetchOrganizationRoles,
    select: (data) => (Array.isArray(data) ? data : []),
  });
}

export function useOrganizationUsers(): UseQueryResult<OrganizationUser[]> {
  return useQuery({
    queryKey: ["organization-users"],
    queryFn: fetchOrganizationUsers,
    select: (data) => (Array.isArray(data) ? data : []),
  });
}

export function useCreateTeacher(
  setError: UseFormSetError<TeacherFormValues>,
  onSuccessCallback?: () => void
): UseMutationResult<Teacher, unknown, TeacherCreatePayload> {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TeacherCreatePayload) => createTeacher(data),
    onSuccess: async () => {
      // Invalidate all teacher queries (list, filtered, paginated) using exact=false to catch variants
      await queryClient.invalidateQueries({
        queryKey: ["teachers"],
        exact: false,
      });
      
      toast({
        title: TeacherMessages.success.create.title,
        description: TeacherMessages.success.create.description,
      });
      
      onSuccessCallback?.();
    },
    onError: (error: unknown) => {
      // Try to set field-specific errors first
      const hasFieldErrors = setFormFieldErrors(error, setError, TEACHER_FIELD_MAP);
      
      // If no field errors, show generic toast
      if (!hasFieldErrors) {
        toast({
          title: TeacherMessages.error.create.title,
          description: TeacherMessages.error.create.description,
          variant: "destructive",
        });
      }
    },
  });
}

export function useUpdateTeacher(
  teacherId: string | undefined,
  setError: UseFormSetError<TeacherFormValues>,
  onSuccessCallback?: () => void
): UseMutationResult<Teacher, unknown, Partial<TeacherUpdatePayload>> {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<TeacherUpdatePayload>) => {
      if (!teacherId) {
        throw new Error("Teacher ID is required for update");
      }
      return updateTeacher(teacherId, data);
    },
    onSuccess: async () => {
      // Dual invalidation: Refresh all teacher lists + conditionally refresh detail view if ID exists
      await queryClient.invalidateQueries({
        queryKey: ["teachers"],
        exact: false,
      });
      
      if (teacherId) {
        await queryClient.invalidateQueries({
          queryKey: ["teacher-detail", teacherId],
        });
      }
      
      toast({
        title: TeacherMessages.success.update.title,
        description: TeacherMessages.success.update.description,
      });
      
      onSuccessCallback?.();
    },
    onError: (error: unknown) => {
      // Field-first error handling: Attempt field-level mapping via TEACHER_FIELD_MAP,
      // fallback to generic toast only if no specific fields errored
      const hasFieldErrors = setFormFieldErrors(error, setError, TEACHER_FIELD_MAP);
      
      if (!hasFieldErrors) {
        toast({
          title: TeacherMessages.error.update.title,
          description: TeacherMessages.error.update.description,
          variant: "destructive",
        });
      }
    },
  });
}
