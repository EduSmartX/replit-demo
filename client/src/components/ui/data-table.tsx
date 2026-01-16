import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  className?: string;
  headerClassName?: string;
  sortable?: boolean;
  sortKey?: string; // Optional: custom key for sorting if different from display
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyAction?: {
    label: string;
    onClick: () => void;
  };
  getRowKey: (row: T, index: number) => string | number;
  onRowClick?: (row: T) => void;
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "No data found",
  emptyAction,
  getRowKey,
  onRowClick,
}: DataTableProps<T>) {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const sortedData = [...data].sort((rowA, rowB) => {
    if (!sortField) return 0;

    // Find the column configuration
    const column = columns.find(
      (col) => (col.sortKey || col.header.toLowerCase().replace(/\s+/g, "_")) === sortField
    );

    if (!column || !column.sortable) return 0;

    let aValue: unknown;
    let bValue: unknown;

    // Get values based on accessor
    if (typeof column.accessor === "function") {
      // For function accessors, we can't easily sort
      // User should provide sortKey that maps to an actual property
      const sortKey = column.sortKey as keyof T;
      aValue = sortKey ? rowA[sortKey] : "";
      bValue = sortKey ? rowB[sortKey] : "";
    } else {
      aValue = rowA[column.accessor];
      bValue = rowB[column.accessor];
    }

    // Handle null/undefined
    if (aValue == null) aValue = "";
    if (bValue == null) bValue = "";

    // Convert to lowercase for string comparison
    if (typeof aValue === "string") aValue = aValue.toLowerCase();
    if (typeof bValue === "string") bValue = bValue.toLowerCase();

    // Type assertion for comparison after normalization
    const normalizedA = aValue as string | number;
    const normalizedB = bValue as string | number;

    if (normalizedA < normalizedB) return sortDirection === "asc" ? -1 : 1;
    if (normalizedA > normalizedB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return;

    const field = column.sortKey || column.header.toLowerCase().replace(/\s+/g, "_");

    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null;

    const field = column.sortKey || column.header.toLowerCase().replace(/\s+/g, "_");

    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 h-4 w-4 text-blue-600" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4 text-blue-600" />
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-gray-500">{emptyMessage}</p>
        {emptyAction && (
          <Button onClick={emptyAction.onClick} variant="outline">
            {emptyAction.label}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        className="custom-scrollbar max-h-[500px] w-full overflow-auto"
        style={{
          paddingBottom: "4px",
        }}
      >
        <Table className="min-w-[1200px]">
          <TableHeader className="sticky top-0 z-10">
            <TableRow className="bg-gray-50">
              {columns.map((column, index) => (
                <TableHead
                  key={index}
                  className={`bg-gray-50 font-semibold whitespace-nowrap ${column.headerClassName || ""}`}
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column)}
                      className="flex items-center transition-colors hover:text-blue-600"
                    >
                      {column.header}
                      {getSortIcon(column)}
                    </button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((row, rowIndex) => (
              <TableRow
                key={getRowKey(row, rowIndex)}
                className={`hover:bg-gray-50 ${onRowClick ? "cursor-pointer" : ""}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column, colIndex) => (
                  <TableCell
                    key={colIndex}
                    className={`whitespace-nowrap ${column.className || ""}`}
                  >
                    {typeof column.accessor === "function"
                      ? column.accessor(row)
                      : (row[column.accessor] as ReactNode)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <style>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #9ca3af #f3f4f6;
        }
        .custom-scrollbar::-webkit-scrollbar {
          height: 12px;
          width: 12px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f3f4f6;
          border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #9ca3af;
          border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </div>
  );
}
