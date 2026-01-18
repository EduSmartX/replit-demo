import { useMutation, useQuery, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
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
import type { ClassSectionRow } from "../schemas/class-section-schema";

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
  onSuccess?: () => void
): UseMutationResult<unknown, unknown, ClassCreatePayload> {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ClassCreatePayload) => createClass(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });

      toast({
        title: "Success",
        description: ClassMessages.Success.CREATED,
      });

      onSuccess?.();
    },
    onError: (error: unknown) => {
      const errorMessage = parseApiError(error, ClassMessages.Error.CREATE_FAILED);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateClass(
  onSuccess?: () => void
): UseMutationResult<unknown, unknown, { publicId: string; data: ClassUpdatePayload }> {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicId, data }: { publicId: string; data: ClassUpdatePayload }) =>
      updateClass(publicId, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["classes"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["class-detail", variables.publicId] });

      toast({
        title: "Success",
        description: ClassMessages.Success.UPDATED,
      });

      onSuccess?.();
    },
    onError: (error: unknown) => {
      const errorMessage = parseApiError(error, ClassMessages.Error.UPDATE_FAILED);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
}

// Batch creation hook: Create multiple class sections in sequence,
// tracking success/failure counts and collecting detailed error messages for each failed class
export function useCreateMultipleClasses(onSuccess?: () => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      classes,
      coreClasses,
    }: {
      classes: ClassSectionRow[];
      coreClasses: CoreClass[];
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

      // Send all classes in a single request
      const response = await createClass(payloads);
      
      // Handle the response
      if ('data' in response && Array.isArray(response.data)) {
        return {
          success: response.data.length,
          failed: 0,
          errors: [],
        };
      }
      
      throw new Error("Unexpected response format");
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });

      toast({
        title: "Success",
        description: `Successfully created ${results.success} class(es)`,
      });

      onSuccess?.();
    },
    onError: (error: unknown) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : ClassMessages.Error.CREATE_FAILED,
        variant: "destructive",
      });
    },
  });
}
