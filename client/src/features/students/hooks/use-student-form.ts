import { useQuery, useMutation, useQueryClient, type UseQueryResult, type UseMutationResult } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchClasses, type MasterClass as Class } from "@/lib/api/class-api";
import {
  createStudent,
  updateStudent,
  reactivateStudent,
  type StudentCreatePayload,
  type StudentUpdatePayload,
  type StudentDetail,
} from "@/lib/api/student-api";
import { fetchOrganizationRoles, fetchOrganizationUsers, type OrganizationRole } from "@/lib/api/teacher-api";
import { STUDENT_FIELD_MAP } from "@/lib/constants/form-field-maps";
import {
  isDeletedDuplicateError,
  getDeletedDuplicateMessage,
  getDeletedRecordId,
  getApiErrorMessage,
} from "@/lib/error-utils";
import { setFormFieldErrors } from "@/lib/utils/form-error-handler";
import type { StudentFormValues } from "../schemas/student-form-schema";
import type { UseFormSetError } from "react-hook-form";

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
  onSuccess?: () => void,
  onDeletedDuplicate?: (message: string, payload: StudentCreatePayload, deletedRecordId: string | null) => void
): UseMutationResult<StudentDetail, Error, { payload: StudentCreatePayload; forceCreate?: boolean }> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, forceCreate }: { payload: StudentCreatePayload; forceCreate?: boolean }) =>
      createStudent(classId, payload, forceCreate),
    onSuccess: () => {
      await queryClient.invalidateQueries({ queryKey: ["students"] });
      await queryClient.invalidateQueries({ queryKey: ["classes"] });
      onSuccess?.();
    },
    onError: (error: unknown) => {
      if (isDeletedDuplicateError(error) && onDeletedDuplicate) {
        const message = getDeletedDuplicateMessage(error);
        const deletedRecordId = getDeletedRecordId(error);
        const errorObj = error as any;
        const payload = errorObj.payload as StudentCreatePayload;
        onDeletedDuplicate(message, payload, deletedRecordId);
      } else {
        const hasFieldErrors = setFormFieldErrors(error, setError, STUDENT_FIELD_MAP);
        
        if (!hasFieldErrors) {
          const errorMessage = getApiErrorMessage(error);
          toast.error(errorMessage);
        }
      }
    },
  });
}

export function useReactivateStudent(
  classId: string,
  onSuccess?: () => void
): UseMutationResult<StudentDetail, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (publicId: string) => reactivateStudent(classId, publicId),
    onSuccess: () => {
      await queryClient.invalidateQueries({ queryKey: ["students"] });
      await queryClient.invalidateQueries({ queryKey: ["classes"] });
      onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getApiErrorMessage(error);
      toast.error(errorMessage);
    },
  });
}

export function useUpdateStudent(
  classId: string,
  publicId: string | undefined,
  setError: UseFormSetError<StudentFormValues>,
  onSuccess?: () => void
): UseMutationResult<StudentDetail, Error, StudentUpdatePayload> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: StudentUpdatePayload) => {
      if (!publicId) {
        throw new Error("Student ID is required for update");
      }
      return updateStudent(classId, publicId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["student", publicId] });
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      onSuccess?.();
    },
    onError: (error: unknown) => {
      const hasFieldErrors = setFormFieldErrors(error, setError, STUDENT_FIELD_MAP);
      
      if (!hasFieldErrors) {
        const errorMessage = getApiErrorMessage(error);
        toast.error(errorMessage);
      }
    },
  });
}
