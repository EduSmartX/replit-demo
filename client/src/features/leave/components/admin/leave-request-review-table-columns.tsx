/**
 * Leave Request Review Table Columns
 * Column definitions for the leave request review data table
 */

import { format } from "date-fns";
import { CheckCircle, XCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Column } from "@/components/ui/data-table";
import type { LeaveRequest } from "@/lib/api/leave-api";

interface GetLeaveRequestReviewColumnsProps {
  onApprove: (request: LeaveRequest) => void;
  onReject: (request: LeaveRequest) => void;
  onViewUserBalance: (userPublicId: string, userName: string) => void;
}

export function getLeaveRequestReviewColumns({
  onApprove,
  onReject,
  onViewUserBalance,
}: GetLeaveRequestReviewColumnsProps): Column<LeaveRequest>[] {
  return [
    {
      header: "Employee",
      accessor: (request) => (
        <div className="min-w-[200px]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewUserBalance(request.user_public_id, request.user_name);
            }}
            className="w-full text-left transition-colors hover:text-indigo-600"
          >
            <div className="truncate font-medium hover:underline">{request.user_name}</div>
            <div className="text-muted-foreground truncate text-xs">{request.user_role}</div>
            <div className="text-muted-foreground truncate text-xs" title={request.email}>
              {request.email}
            </div>
          </button>
        </div>
      ),
      sortable: true,
      sortKey: "user_name",
      width: 220,
      minWidth: 200,
    },
    {
      header: "Leave Type",
      accessor: (request) => (
        <div>
          <div className="font-medium">{request.leave_name}</div>
          <Badge variant="outline" className="mt-1">
            {request.leave_type_code}
          </Badge>
        </div>
      ),
      sortable: true,
      sortKey: "leave_name",
    },
    {
      header: "Leave Duration",
      accessor: (request) => (
        <div>
          <div className="text-sm">
            {format(new Date(request.start_date), "MMM dd, yyyy")} -{" "}
            {format(new Date(request.end_date), "MMM dd, yyyy")}
          </div>
          <div className="text-muted-foreground mt-1 text-xs">
            ({request.number_of_days} {parseFloat(request.number_of_days) === 1 ? "day" : "days"})
          </div>
        </div>
      ),
      sortable: true,
      sortKey: "start_date",
      width: 280,
      minWidth: 250,
    },
    {
      header: "Status",
      accessor: (request) => {
        const statusConfig: Record<
          string,
          { variant: "default" | "destructive" | "secondary"; className: string }
        > = {
          pending: { variant: "default", className: "bg-yellow-500 hover:bg-yellow-600" },
          approved: { variant: "default", className: "bg-green-500 hover:bg-green-600" },
          rejected: { variant: "destructive", className: "" },
          cancelled: { variant: "secondary", className: "" },
        };

        const config = statusConfig[request.status] || statusConfig.pending;

        return (
          <Badge variant={config.variant} className={config.className}>
            {request.status.toUpperCase()}
          </Badge>
        );
      },
      sortable: true,
      sortKey: "status",
    },
    {
      header: "Reason",
      accessor: (request) => {
        const reason = request.reason;
        return (
          <div className="max-w-xs truncate" title={reason}>
            {reason}
          </div>
        );
      },
    },
    {
      header: "Applied At",
      accessor: (request) => (
        <div className="text-sm">
          {format(new Date(request.applied_at), "MMM dd, yyyy")}
          <div className="text-muted-foreground text-xs">
            {format(new Date(request.applied_at), "hh:mm a")}
          </div>
        </div>
      ),
      sortable: true,
      sortKey: "applied_at",
    },
    {
      header: "Supervisor",
      accessor: (request) => request.supervisor_name || "N/A",
      sortable: true,
      sortKey: "supervisor_name",
    },
    {
      header: "Actions",
      accessor: (request) => {
        const isPending = request.status === "pending";

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewUserBalance(request.user_public_id, request.user_name);
              }}
              className="text-indigo-600 hover:text-indigo-700"
            >
              <Info className="mr-1 h-4 w-4" />
              Balance
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onApprove(request);
              }}
              disabled={!isPending}
              className="bg-green-600 hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCircle className="mr-1 h-4 w-4" />
              Approve
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onReject(request);
              }}
              disabled={!isPending}
              className="disabled:cursor-not-allowed disabled:opacity-50"
            >
              <XCircle className="mr-1 h-4 w-4" />
              Reject
            </Button>
          </div>
        );
      },
    },
  ];
}
