import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  createClass,
  fetchCoreClasses,
  updateClass,
  type ClassCreatePayload,
  type ClassUpdatePayload,
  type CoreClass,
} from "@/lib/api/class-api";
import { fetchTeachers } from "@/lib/api/teacher-api";
import { ClassMessages } from "@/lib/constants/class-messages";
import { parseApiError } from "@/lib/error-parser";
import { setFormFieldErrors } from "@/lib/error-utils";
import type { ClassSectionRow } from "../schemas/class-section-schema";
import type { FieldValues, UseFormSetError } from "react-hook-form";

export function useCoreClasses() {
  return useQuery({
    queryKey: ["core-classes"],
    queryFn: () => fetchCoreClasses({ page_size: 100 }),
    select: (response) => response.data || [],
  });
}

export function useTeachers() {
  return useQuery({
    queryKey: ["teachers"],
    queryFn: () => fetchTeachers({ page_size: 100 }),
    select: (response) => response.data || [],
  });
}

export function useCreateClass(
  onSuccess?: () => void,
  setError?: UseFormSetError<FieldValues>
): UseMutationResult<unknown, unknown, ClassCreatePayload> {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ClassCreatePayload) => createClass(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      onSuccess?.();
    },
    onError: (error: unknown) => {
      // Try to set field errors if setError is provided
      if (setError) {
        const hasFieldErrors = setFormFieldErrors(error, setError);
        if (hasFieldErrors) {
          return;
        } // Don't show toast if field errors are displayed
      }

      // Fallback to toast notification
      const errorMessage = parseApiError(error, ClassMessages.Error.CREATE_FAILED);
      console.error("Create class error:", errorMessage);
      toast({
        title: "Error Creating Section",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateClass(
  onSuccess?: () => void,
  setError?: UseFormSetError<FieldValues>
): UseMutationResult<unknown, unknown, { publicId: string; data: ClassUpdatePayload }> {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId, data }: { publicId: string; data: ClassUpdatePayload }) =>
      updateClass(publicId, data),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["classes"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["class-detail", variables.publicId] });
      onSuccess?.();
    },
    onError: (error: unknown) => {
      // Try to set field errors if setError is provided
      if (setError) {
        const hasFieldErrors = setFormFieldErrors(error, setError);
        if (hasFieldErrors) {
          return;
        } // Don't show toast if field errors are displayed
      }

      // Fallback to toast notification
      const errorMessage = parseApiError(error, ClassMessages.Error.UPDATE_FAILED);
      console.error("Update class error:", errorMessage);
      toast({
        title: "Error Updating Section",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
}

// Batch creation hook: Create multiple class sections in sequence,
// tracking success/failure counts and collecting detailed error messages for each failed class
export function useCreateMultipleClasses(
  onSuccess?: () => void,
  onDeletedDuplicateError?: (error: unknown, data: ClassCreatePayload[]) => boolean
) {
  const { toast: _toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      classes,
      coreClasses,
      forceCreate = false,
    }: {
      classes: ClassSectionRow[];
      coreClasses: CoreClass[];
      forceCreate?: boolean;
    }) => {
      // Build all payloads
      const payloads: ClassCreatePayload[] = [];

      for (const classRow of classes) {
        const coreClass = coreClasses.find((c) => c.id.toString() === classRow.core_class_id);

        if (!coreClass) {
          throw new Error(`Invalid class selected for ${classRow.section_name}`);
        }

        payloads.push({
          class_master: coreClass.id,
          name: classRow.section_name.trim(),
          class_teacher: classRow.class_teacher_id || undefined,
          info: classRow.description || undefined,
          capacity: classRow.capacity || undefined,
        });
      }

      // Send all classes in a single request with optional force_create flag
      const response = await createClass(payloads, forceCreate);

      // Handle the response
      if ("data" in response && Array.isArray(response.data)) {
        return {
          success: response.data.length,
          failed: 0,
          errors: [],
          data: response.data,
        };
      }

      throw new Error("Unexpected response format");
    },
    onSuccess: (_results) => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      onSuccess?.();
    },
    onError: (error: unknown, variables) => {
      // Try to handle deleted duplicate error if handler provided
      if (onDeletedDuplicateError) {
        const payloads = variables.classes.map((classRow) => {
          const coreClass = variables.coreClasses.find(
            (c) => c.id.toString() === classRow.core_class_id
          );
          return {
            class_master: coreClass?.id || 0,
            name: classRow.section_name.trim(),
            class_teacher: classRow.class_teacher_id || undefined,
            info: classRow.description || undefined,
            capacity: classRow.capacity || undefined,
          };
        });

        const handled = onDeletedDuplicateError(error, payloads);

        if (handled) {
          return; // Error was handled by the duplicate handler
        }
      }

      console.error(
        "Create multiple classes error:",
        error instanceof Error ? error.message : ClassMessages.Error.CREATE_FAILED
      );
    },
  });
}
