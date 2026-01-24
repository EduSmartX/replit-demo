import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseDeletedViewOptions {
  resourceName: string;
  queryKey: string[];
  reactivateFn: (publicId: string) => Promise<unknown>;
  onPageChange?: (page: number) => void;
}

export function useDeletedView({
  resourceName,
  queryKey,
  reactivateFn,
  onPageChange,
}: UseDeletedViewOptions) {
  const [showDeleted, setShowDeleted] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const reactivateMutation = useMutation({
    mutationFn: (publicId: string) => reactivateFn(publicId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Success",
        description: `${resourceName} has been reactivated successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || `Failed to reactivate ${resourceName.toLowerCase()}`,
        variant: "destructive",
      });
    },
  });

  const handleReactivate = (publicId: string) => {
    if (confirm(`Are you sure you want to reactivate this ${resourceName.toLowerCase()}?`)) {
      reactivateMutation.mutate(publicId);
    }
  };

  const toggleDeletedView = () => {
    setShowDeleted(!showDeleted);
    onPageChange?.(1);
  };

  return {
    showDeleted,
    setShowDeleted,
    toggleDeletedView,
    handleReactivate,
    reactivateMutation,
  };
}
