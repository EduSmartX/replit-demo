import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from "@tanstack/react-query";
import type { UseFormSetError } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { setFormFieldErrors } from "@/lib/utils/form-error-handler";
import { STUDENT_FIELD_MAP } from "@/lib/constants/form-field-maps";
import {
  createStudent,
  updateStudent,
  fetchOrganizationRoles,
  fetchOrganizationUsers,
  type StudentCreatePayload,
  type StudentUpdatePayload,
  type Student,
  type OrganizationRole,
} from "@/lib/api/student-api";
import { fetchClasses, type MasterClass as Class } from "@/lib/api/class-api";
import { StudentMessages } from "../constants/student-messages";
import type { StudentFormValues } from "../schemas/student-form-schema";

type OrganizationUser = {
  email: string;
  full_name: string;
  public_id: string;
};

export function useClasses(): UseQueryResult<Class[]> {
  return useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const response = await fetchClasses({ page_size: 100 });
      return response.data || [];
    },
  });
}

export function useOrganizationRoles(): UseQueryResult<OrganizationRole[]> {
  return useQuery({
    queryKey: ["organizationRoles"],
    queryFn: fetchOrganizationRoles,
  });
}

export function useOrganizationUsers(): UseQueryResult<OrganizationUser[]> {
  return useQuery({
    queryKey: ["organizationUsers"],
    queryFn: fetchOrganizationUsers,
  });
}

export function useCreateStudent(
  classId: string,
  setError: UseFormSetError<StudentFormValues>,
  onSuccess: () => void
): UseMutationResult<Student, Error, StudentCreatePayload> {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: StudentCreatePayload) => createStudent(classId, payload),
    onSuccess: () => {
      // Invalidate both students and classes caches to reflect updated counts and relationships
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast({
        title: StudentMessages.success.create.title,
        description: StudentMessages.success.create.description,
      });
      onSuccess();
    },
    onError: (error: unknown) => {
      const errorObj = error as { response?: { data?: Record<string, unknown> }; message?: string };
      
      // Handle field-level errors from backend
      if (errorObj.response?.data) {
        const backendErrors = errorObj.response.data;
        const hasFieldErrors = setFormFieldErrors(backendErrors, setError, STUDENT_FIELD_MAP);
        
        if (hasFieldErrors) {
          toast({
            title: StudentMessages.error.validation.title,
            description: StudentMessages.error.validation.description,
            variant: "destructive",
          });
        } else {
          toast({
            title: StudentMessages.error.create.title,
            description: StudentMessages.error.create.description,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: StudentMessages.error.create.title,
          description: errorObj.message || StudentMessages.error.create.description,
          variant: "destructive",
        });
      }
    },
  });
}

export function useUpdateStudent(
  publicId: string | undefined,
  setError: UseFormSetError<StudentFormValues>,
  onSuccess: () => void
): UseMutationResult<Student, Error, StudentUpdatePayload> {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: StudentUpdatePayload) => {
      if (!publicId) {
        throw new Error("Student ID is required for update");
      }
      return updateStudent(publicId, payload);
    },
    onSuccess: () => {
      // Triple invalidation: list + detail + related classes to maintain consistency across all views
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["student", publicId] });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast({
        title: StudentMessages.success.update.title,
        description: StudentMessages.success.update.description,
      });
      onSuccess();
    },
    onError: (error: unknown) => {
      const errorObj = error as { response?: { data?: Record<string, unknown> }; message?: string };
      
      // Handle field-level errors from backend
      if (errorObj.response?.data) {
        const backendErrors = errorObj.response.data;
        const hasFieldErrors = setFormFieldErrors(backendErrors, setError, STUDENT_FIELD_MAP);
        
        if (hasFieldErrors) {
          toast({
            title: StudentMessages.error.validation.title,
            description: StudentMessages.error.validation.description,
            variant: "destructive",
          });
        } else {
          toast({
            title: StudentMessages.error.update.title,
            description: StudentMessages.error.update.description,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: StudentMessages.error.update.title,
          description: errorObj.message || StudentMessages.error.update.description,
          variant: "destructive",
        });
      }
    },
  });
}
