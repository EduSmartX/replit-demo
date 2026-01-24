/**
 * Common Table Columns
 * Reusable column definitions for data tables
 * Provides standard columns for Created By, Last Updated, and Actions
 */

import { Edit, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Column } from "@/components/ui/data-table";
import { formatDateForDisplay } from "@/lib/utils/date-utils";

/**
 * Base interface for rows that support common columns
 */
export interface CommonRowData {
  created_by_name?: string | null;
  created_at: string;
  updated_by_name?: string | null;
  updated_at: string;
}

/**
 * Callbacks for action buttons
 */
export interface ActionCallbacks<T> {
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
}

/**
 * Creates the "Created By" column
 */
export function createCreatedByColumn<T extends CommonRowData>(): Column<T> {
  return {
    header: "Created By",
    accessor: (row) => (
      <div className="text-sm">
        <div className="text-gray-700">{row.created_by_name || "System"}</div>
        <div className="text-xs text-gray-500">{formatDateForDisplay(row.created_at)}</div>
      </div>
    ),
    sortable: true,
    sortKey: "created_by_name",
  };
}

/**
 * Creates the "Last Updated" column
 */
export function createLastUpdatedColumn<T extends CommonRowData>(): Column<T> {
  return {
    header: "Last Updated",
    accessor: (row) => (
      <div className="text-sm">
        <div className="text-gray-700">{row.updated_by_name || "System"}</div>
        <div className="text-xs text-gray-500">{formatDateForDisplay(row.updated_at)}</div>
      </div>
    ),
    sortable: true,
    sortKey: "updated_at",
  };
}

/**
 * Creates the "Actions" column with View, Edit, and Delete buttons
 */
export function createActionsColumn<T>(callbacks: ActionCallbacks<T>): Column<T> {
  const { onView, onEdit, onDelete } = callbacks;

  return {
    header: "Actions",
    accessor: (row) => (
      <div className="flex items-center gap-2">
        {onView && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onView(row);
            }}
            className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(row);
            }}
            className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(row);
            }}
            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    ),
  };
}

/**
 * Creates all three common columns at once
 */
export function createCommonColumns<T extends CommonRowData>(
  callbacks: ActionCallbacks<T>
): Column<T>[] {
  return [
    createCreatedByColumn<T>(),
    createLastUpdatedColumn<T>(),
    createActionsColumn<T>(callbacks),
  ];
}
