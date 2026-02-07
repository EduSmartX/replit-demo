/**
 * Leave Request Table Component
 * Displays a list of leave requests with status, dates, and actions
 * Reusable across Admin, Teacher, and Student dashboards
 */

import { Eye, Trash2, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LeaveRequestStatus, LEAVE_STATUS_CONFIG } from "@/features/leave/constants";
import type { LeaveRequest } from "@/lib/api/leave-api";
import { formatDate } from "@/lib/utils";

interface LeaveRequestTableProps {
  requests: LeaveRequest[];
  onView?: (request: LeaveRequest) => void;
  onEdit?: (request: LeaveRequest) => void;
  onDelete?: (request: LeaveRequest) => void;
  isLoading?: boolean;
}

export function LeaveRequestTable({
  requests,
  onView,
  onEdit,
  onDelete,
  isLoading = false,
}: LeaveRequestTableProps) {
  const getStatusBadge = (status: LeaveRequest["status"]) => {
    const config = LEAVE_STATUS_CONFIG[status] || LEAVE_STATUS_CONFIG[LeaveRequestStatus.PENDING];
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label.toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return <div className="text-muted-foreground py-8 text-center">Loading leave requests...</div>;
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        No leave requests found. Click &quot;Apply for Leave&quot; to create one.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Leave Type</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead className="text-center">Days</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.public_id}>
              <TableCell className="font-medium">{request.leave_name}</TableCell>
              <TableCell>{formatDate(request.start_date)}</TableCell>
              <TableCell>{formatDate(request.end_date)}</TableCell>
              <TableCell className="text-center">{request.number_of_days}</TableCell>
              <TableCell>{getStatusBadge(request.status)}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {onView && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(request)}
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
                      onClick={() => onEdit(request)}
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
                      onClick={() => onDelete(request)}
                      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
