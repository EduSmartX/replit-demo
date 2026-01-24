import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UseReactivateMutationOptions {
  /**
   * Name of the resource being reactivated (e.g., "Teacher", "Student", "Class")
   * Used in error messages
   */
  resourceName: string;
  
  /**
   * The API function that performs the reactivate operation
   * Should accept a publicId (string) and return a Promise
   */
  reactivateFn: (publicId: string) => Promise<unknown>;
  
  /**
   * Array of query keys to invalidate and refetch after successful reactivation
   * Example: ["teachers", "teacher-detail"]
   */
  queryKeys: string[];
  
  /**
   * Optional callback to run after successful reactivation
   * Useful for showing success dialog
   */
  onSuccessCallback?: () => void;

  /**
   * Whether to refetch queries after invalidation (default: true)
   * Set to false if you want to invalidate without immediate refetch
   */
  refetchQueries?: boolean;
}

/**
 * Reusable hook for reactivate operations with React Query
 * 
 * @example
 * const reactivateTeacherMutation = useReactivateMutation({
 *   resourceName: "Teacher",
 *   reactivateFn: reactivateTeacher,
 *   queryKeys: ["teachers", "teacher-detail"],
 *   onSuccessCallback: () => {
 *     setSuccessMessage({ title: "Teacher Reactivated!", description: "..." });
 *     setShowSuccessDialog(true);
 *   }
 * });
 * 
 * // Usage
 * reactivateTeacherMutation.mutate(publicId);
 */
export function useReactivateMutation({
  resourceName,
  reactivateFn,
  queryKeys,
  onSuccessCallback,
  refetchQueries = true,
}: UseReactivateMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (publicId: string) => reactivateFn(publicId),
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
      console.error(`Reactivate ${resourceName} error:`, error.message || `Failed to reactivate ${resourceName.toLowerCase()}`);
    },
  });
}
