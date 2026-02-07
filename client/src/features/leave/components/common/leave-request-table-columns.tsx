/**
 * Leave Request Table Columns
 * Column definitions for leave request data table
 */

import { Edit, Eye, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Column } from "@/components/ui/data-table";
import { LeaveRequestStatus, LEAVE_STATUS_CONFIG } from "@/features/leave/constants";
import type { LeaveRequest } from "@/lib/api/leave-api";
import { formatDate } from "@/lib/utils";

interface GetLeaveRequestColumnsOptions {
  onView?: (request: LeaveRequest) => void;
  onEdit?: (request: LeaveRequest) => void;
  onDelete?: (request: LeaveRequest) => void;
}

export function getLeaveRequestColumns({
  onView,
  onEdit,
  onDelete,
}: GetLeaveRequestColumnsOptions): Column<LeaveRequest>[] {
  const getStatusBadge = (status: LeaveRequest["status"]) => {
    const config = LEAVE_STATUS_CONFIG[status] || LEAVE_STATUS_CONFIG[LeaveRequestStatus.PENDING];
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label.toUpperCase()}
      </Badge>
    );
  };

  return [
    {
      header: "Leave Type",
      accessor: (request) => <span className="font-medium">{request.leave_name}</span>,
      sortable: true,
      sortKey: "leave_name",
    },
    {
      header: "Start Date",
      accessor: (request) => formatDate(request.start_date),
      sortable: true,
      sortKey: "start_date",
    },
    {
      header: "End Date",
      accessor: (request) => formatDate(request.end_date),
      sortable: true,
      sortKey: "end_date",
    },
    {
      header: "Days",
      accessor: (request) => <span className="block text-center">{request.number_of_days}</span>,
      sortable: true,
      sortKey: "number_of_days",
      className: "text-center",
    },
    {
      header: "Status",
      accessor: (request) => getStatusBadge(request.status),
      sortable: true,
      sortKey: "status",
    },
    {
      header: "Reviewed By",
      accessor: (request) => (
        <div className="text-sm">
          <div className="text-gray-700">{request.reviewed_by_name || "-"}</div>
          {request.reviewed_at && (
            <div className="text-xs text-gray-500">{formatDate(request.reviewed_at)}</div>
          )}
        </div>
      ),
      sortable: true,
      sortKey: "reviewed_by_name",
    },
    {
      header: "Review Comments",
      accessor: (request) => (
        <span
          className="block max-w-[200px] truncate text-sm"
          title={request.review_comments || "-"}
        >
          {request.review_comments || "-"}
        </span>
      ),
      sortable: false,
      width: 200,
    },
    {
      header: "Actions",
      accessor: (request) => (
        <div className="flex items-center justify-end gap-2">
          {onView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onView(request);
              }}
              className="h-8 w-8 p-0 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {onEdit && request.status === LeaveRequestStatus.PENDING && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(request);
              }}
              className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && request.status === LeaveRequestStatus.PENDING && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(request);
              }}
              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
      sortable: false,
      className: "text-right",
      width: 150,
    },
  ];
}
