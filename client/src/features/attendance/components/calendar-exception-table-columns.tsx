/**
 * Calendar Exception Table Columns
 * Column definitions for calendar exception data table
 */

import { format, parseISO } from "date-fns";
import { CheckCircle, Edit, Eye, Trash2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Column } from "@/components/ui/data-table";
import type { CalendarException } from "@/lib/api/calendar-exception-types";

interface GetCalendarExceptionColumnsOptions {
  onView: (exception: CalendarException) => void;
  onEdit: (exception: CalendarException) => void;
  onDelete: (exception: CalendarException) => void;
}

export function getCalendarExceptionColumns({
  onView,
  onEdit,
  onDelete,
}: GetCalendarExceptionColumnsOptions): Column<CalendarException>[] {
  return [
    {
      header: "Date",
      accessor: (exception) => (
        <span className="font-medium text-gray-900">
          {format(parseISO(exception.date), "MMM dd, yyyy")}
        </span>
      ),
      sortable: true,
      sortKey: "date",
      width: 150,
    },
    {
      header: "Type",
      accessor: (exception) => {
        if (exception.override_type === "FORCE_WORKING") {
          return (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
              <CheckCircle className="mr-1 h-3 w-3" />
              Force Working
            </Badge>
          );
        }
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
            <XCircle className="mr-1 h-3 w-3" />
            Force Holiday
          </Badge>
        );
      },
      sortable: true,
      sortKey: "override_type",
      width: 180,
    },
    {
      header: "Applicable To",
      accessor: (exception) => {
        if (exception.is_applicable_to_all_classes) {
          return (
            <Badge variant="outline" className="bg-purple-50">
              All Classes
            </Badge>
          );
        }
        return (
          <Badge variant="outline">
            {exception.classes.length} Class{exception.classes.length > 1 ? "es" : ""}
          </Badge>
        );
      },
      sortable: false,
      width: 150,
    },
    {
      header: "Reason",
      accessor: (exception) => (
        <span className="line-clamp-2 max-w-[300px] text-sm text-gray-700" title={exception.reason}>
          {exception.reason}
        </span>
      ),
      sortable: false,
      width: 300,
      minWidth: 250,
    },
    {
      header: "Actions",
      accessor: (exception) => (
        <div className="flex justify-start gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(exception)}
            className="text-gray-600 hover:bg-gray-50 hover:text-gray-800"
            title="View exception"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(exception)}
            className="text-blue-600 hover:bg-blue-50 hover:text-blue-800"
            title="Edit exception"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(exception)}
            className="text-red-600 hover:bg-red-50 hover:text-red-800"
            title="Delete exception"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      sortable: false,
      width: 150,
      className: "text-left",
    },
  ];
}
