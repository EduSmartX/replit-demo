/**
 * Calendar Exception Table Columns
 * Column definitions for calendar exception data table
 */

import { format, parseISO } from "date-fns";
import { CheckCircle, Edit, Trash2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Column } from "@/components/ui/data-table";
import type { CalendarException } from "@/lib/api/calendar-exception-types";

interface GetCalendarExceptionColumnsOptions {
  onEdit: (exception: CalendarException) => void;
  onDelete: (exception: CalendarException) => void;
}

export function getCalendarExceptionColumns({
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
        <span className="text-sm text-gray-700 line-clamp-2">{exception.reason}</span>
      ),
      sortable: false,
      width: 300,
    },
    {
      header: "Actions",
      accessor: (exception) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(exception)}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            title="Edit exception"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(exception)}
            className="text-red-600 hover:text-red-800 hover:bg-red-50"
            title="Delete exception"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      sortable: false,
      width: 120,
      className: "text-right",
    },
  ];
}
