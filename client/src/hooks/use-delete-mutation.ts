import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseDeleteMutationOptions<TParams = string> {
  /**
   * Name of the resource being deleted (e.g., "Teacher", "Student", "Class")
   * Used in error messages
   */
  resourceName: string;

  /**
   * The API function that performs the delete operation
   * Can accept a publicId (string) or a custom params object
   */
  deleteFn: (params: TParams) => Promise<unknown>;

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
   * Optional callback to run when deletion fails
   * Receives the error object for custom error handling
   */
  onErrorCallback?: (error: Error) => void;

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
export function useDeleteMutation<TParams = string>({
  resourceName,
  deleteFn,
  queryKeys,
  onSuccessCallback,
  onErrorCallback,
  refetchQueries = true,
}: UseDeleteMutationOptions<TParams>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: TParams) => deleteFn(params),
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
            exact: false,
          });
        }
      }

      onSuccessCallback?.();
    },
    onError: (error: Error) => {
      console.error(
        `Delete ${resourceName} error:`,
        error.message || `Failed to delete ${resourceName.toLowerCase()}`
      );
      onErrorCallback?.(error);
    },
  });
}
