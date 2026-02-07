/**
 * Leave Request Detail Dialog Component
 * Shows full details of a leave request
 * Reusable across Admin, Teacher, and Student dashboards
 */

import { Calendar, Clock, User, FileText, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { LeaveRequest } from "@/lib/api/leave-api";
import { formatDate } from "@/lib/utils";

interface LeaveRequestDetailDialogProps {
  request: LeaveRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeaveRequestDetailDialog({
  request,
  open,
  onOpenChange,
}: LeaveRequestDetailDialogProps) {
  if (!request) {
    return null;
  }

  const getStatusBadge = (status: LeaveRequest["status"]) => {
    const statusConfig = {
      pending: { variant: "default" as const, className: "bg-yellow-500" },
      approved: { variant: "default" as const, className: "bg-green-500" },
      rejected: { variant: "destructive" as const, className: "" },
      cancelled: { variant: "secondary" as const, className: "" },
    };

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Leave Request Details</DialogTitle>
          <DialogDescription>View complete information about this leave request</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Leave Type */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Leave Type</p>
              <p className="text-lg font-semibold">{request.leave_name}</p>
            </div>
            <div>{getStatusBadge(request.status)}</div>
          </div>

          <Separator />

          {/* Date Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-muted-foreground flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Start Date</span>
              </div>
              <p className="font-medium">{formatDate(request.start_date)}</p>
            </div>
            <div className="space-y-2">
              <div className="text-muted-foreground flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">End Date</span>
              </div>
              <p className="font-medium">{formatDate(request.end_date)}</p>
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <div className="text-muted-foreground flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Duration</span>
            </div>
            <p className="font-medium">
              {request.total_days} {request.total_days === 1 ? "day" : "days"}
              {request.is_half_day && (
                <Badge variant="outline" className="ml-2">
                  Half Day
                </Badge>
              )}
            </p>
          </div>

          <Separator />

          {/* Reason */}
          <div className="space-y-2">
            <div className="text-muted-foreground flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span className="text-sm">Reason</span>
            </div>
            <p className="text-sm">{request.reason}</p>
          </div>

          {/* Remarks */}
          {request.remarks && (
            <div className="space-y-2">
              <div className="text-muted-foreground flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm">Additional Remarks</span>
              </div>
              <p className="text-sm">{request.remarks}</p>
            </div>
          )}

          <Separator />

          {/* Applied Information */}
          <div className="space-y-2">
            <div className="text-muted-foreground flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Applied On</span>
            </div>
            <p className="text-sm font-medium">{formatDate(request.applied_at)}</p>
          </div>

          {/* Review Information */}
          {request.reviewed_at && request.reviewed_by && (
            <>
              <Separator />
              <div className="bg-muted space-y-3 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <User className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm font-medium">Review Information</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Reviewed By: </span>
                    <span className="font-medium">{request.reviewed_by_name || "Unknown"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Reviewed On: </span>
                    <span className="font-medium">{formatDate(request.reviewed_at)}</span>
                  </div>
                  {request.review_comments && (
                    <div>
                      <span className="text-muted-foreground">Comments: </span>
                      <p className="mt-1">{request.review_comments}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
