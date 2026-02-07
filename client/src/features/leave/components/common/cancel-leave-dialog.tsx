/**
 * Cancel Leave Dialog Component
 * Confirmation dialog for cancelling a leave request
 * Reusable across Admin, Teacher, and Student dashboards
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { cancelLeaveRequest } from "@/lib/api/leave-api";
import type { LeaveRequest } from "@/lib/api/leave-api";
import { formatDate } from "@/lib/utils";

interface CancelLeaveDialogProps {
  request: LeaveRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CancelLeaveDialog({ request, open, onOpenChange }: CancelLeaveDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCancelling, setIsCancelling] = useState(false);

  const cancelMutation = useMutation({
    mutationFn: (publicId: string) => cancelLeaveRequest(publicId),
    onSuccess: () => {
      // Invalidate all related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
      queryClient.invalidateQueries({ queryKey: ["leave-balances-summary"] });
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });

      toast({
        title: "Leave Request Deleted",
        description: "Your leave request has been deleted successfully.",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel leave request",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsCancelling(false);
    },
  });

  const handleCancel = () => {
    if (!request) {
      return;
    }

    setIsCancelling(true);
    cancelMutation.mutate(request.public_id);
  };

  if (!request) {
    return null;
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Leave Request</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this leave request? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-4">
          <div className="text-sm">
            <span className="font-medium">Leave Type: </span>
            <span>{request.leave_name}</span>
          </div>
          <div className="text-sm">
            <span className="font-medium">Duration: </span>
            <span>
              {formatDate(request.start_date)} to {formatDate(request.end_date)}
            </span>
          </div>
          <div className="text-sm">
            <span className="font-medium">Total Days: </span>
            <span>{request.number_of_days} days</span>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isCancelling}>No, Keep It</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={isCancelling}
            className="bg-red-600 hover:bg-red-700"
          >
            {isCancelling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Yes, Delete Request"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
