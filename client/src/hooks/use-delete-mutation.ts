import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseDeleteMutationOptions {
  /**
   * Name of the resource being deleted (e.g., "Teacher", "Student", "Class")
   * Used in error messages
   */
  resourceName: string;
  
  /**
   * The API function that performs the delete operation
   * Should accept a publicId (string) and return a Promise
   */
  deleteFn: (publicId: string) => Promise<unknown>;
  
  /**
   * Array of query keys to invalidate and refetch after successful deletion
   * Example: ["teachers", "teacher-detail"]
   */
  queryKeys: string[];
  
  /**
   * Optional callback to run after successful deletion
   * Useful for navigation or showing success dialog
   */
  onSuccessCallback?: () => void;

  /**
   * Whether to refetch queries after invalidation (default: true)
   * Set to false if you want to invalidate without immediate refetch
   */
  refetchQueries?: boolean;
}

/**
 * Reusable hook for delete operations with React Query
 * 
 * @example
 * const deleteTeacherMutation = useDeleteMutation({
 *   resourceName: "Teacher",
 *   deleteFn: deleteTeacher,
 *   queryKeys: ["teachers", "teacher-detail"],
 * });
 * 
 * // Usage
 * deleteTeacherMutation.mutate(publicId);
 */
export function useDeleteMutation({
  resourceName,
  deleteFn,
  queryKeys,
  onSuccessCallback,
  refetchQueries = true,
}: UseDeleteMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (publicId: string) => deleteFn(publicId),
    onSuccess: async () => {
      for (const key of queryKeys) {
        await queryClient.invalidateQueries({
          queryKey: [key],
          exact: false,
          refetchType: "active",
        });
        
        if (refetchQueries) {
          await queryClient.refetchQueries({ 
            queryKey: [key], 
            exact: false 
          });
        }
      }

      onSuccessCallback?.();
    },
    onError: (error: Error) => {
      console.error(`Delete ${resourceName} error:`, error.message || `Failed to delete ${resourceName.toLowerCase()}`);
    },
  });
}
