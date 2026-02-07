/**
 * Leave Request Review Dialog Component
 * Dialog for approving/rejecting leave requests with comments
 */

import { format } from "date-fns";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { LeaveRequest } from "@/lib/api/leave-api";

interface LeaveRequestReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: LeaveRequest | null;
  action: "approve" | "reject" | null;
  onSubmit: (comments: string) => void;
  isSubmitting: boolean;
}

export function LeaveRequestReviewDialog({
  open,
  onOpenChange,
  request,
  action,
  onSubmit,
  isSubmitting,
}: LeaveRequestReviewDialogProps) {
  const [comments, setComments] = useState("");

  // Reset comments when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setComments("");
    }
  }, [open]);

  const handleSubmit = () => {
    onSubmit(comments);
  };

  if (!request || !action) {
    return null;
  }

  const isApprove = action === "approve";
  const actionColor = isApprove ? "green" : "red";
  const ActionIcon = isApprove ? CheckCircle : XCircle;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ActionIcon className={`h-5 w-5 text-${actionColor}-600`} />
            {isApprove ? "Approve" : "Reject"} Leave Request
          </DialogTitle>
          <DialogDescription>
            {isApprove
              ? "Approve this leave request and provide optional comments"
              : "Reject this leave request and provide a reason"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Request Details */}
          <div className="bg-muted space-y-3 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground text-sm">Employee</p>
                <p className="font-medium">{request.user_name}</p>
                <p className="text-muted-foreground text-xs">{request.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Leave Type</p>
                <p className="font-medium">{request.leave_name}</p>
                <Badge variant="outline" className="mt-1">
                  {request.leave_type_code}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground text-sm">Duration</p>
                <p className="font-medium">
                  {format(new Date(request.start_date), "MMM dd, yyyy")} -{" "}
                  {format(new Date(request.end_date), "MMM dd, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Number of Days</p>
                <p className="font-medium">{request.number_of_days} day(s)</p>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground text-sm">Reason</p>
              <p className="mt-1 text-sm whitespace-pre-wrap">{request.reason}</p>
            </div>

            <div>
              <p className="text-muted-foreground text-sm">Applied At</p>
              <p className="text-sm">
                {format(new Date(request.applied_at), "MMM dd, yyyy hh:mm a")}
              </p>
            </div>
          </div>

          {/* Comments Input */}
          <div className="space-y-2">
            <Label htmlFor="comments">
              {isApprove ? "Comments (Optional)" : "Rejection Reason *"}
            </Label>
            <Textarea
              id="comments"
              placeholder={
                isApprove
                  ? "Add any additional comments..."
                  : "Please provide a reason for rejection..."
              }
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              className="resize-none"
            />
            {!isApprove && (
              <p className="text-muted-foreground text-xs">
                A rejection reason is required to help the employee understand the decision.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || (!isApprove && !comments.trim())}
            className={
              isApprove ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isApprove ? "Approving..." : "Rejecting..."}
              </>
            ) : (
              <>
                <ActionIcon className="mr-2 h-4 w-4" />
                {isApprove ? "Approve Request" : "Reject Request"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
