import { Eye, RotateCcw } from "lucide-react";
import { createCommonColumns } from "@/common/components/tables";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Column } from "@/components/ui/data-table";
import type { MasterClass } from "@/lib/api/class-api";

interface GetClassColumnsOptions {
  onView: (classData: MasterClass) => void;
  onEdit: (classData: MasterClass) => void;
  onDelete: (classData: MasterClass) => void;
  isDeletedView?: boolean;
}

export function getClassColumns({
  onView,
  onEdit,
  onDelete,
  isDeletedView = false,
}: GetClassColumnsOptions): Column<MasterClass>[] {
  return [
    {
      header: "Class",
      accessor: (row: MasterClass) => (
        <div className="font-medium text-gray-900">
          {row.class_master.name} ({row.name})
        </div>
      ),
      sortable: true,
      sortKey: "name",
    },
    {
      header: "Class Teacher",
      accessor: (row: MasterClass) => (
        <div className="text-sm text-gray-900">
          {row.class_teacher 
            ? `${row.class_teacher.full_name} (${row.class_teacher.email})` 
            : "-"}
        </div>
      ),
    },
    {
      header: "Description",
      accessor: (row: MasterClass) => (
        <div className="text-sm text-gray-600">
          {row.info || "-"}
        </div>
      ),
    },
    {
      header: "Capacity",
      accessor: (row: MasterClass) => (
        <div className="text-sm text-gray-900">
          {row.capacity ? (
            <Badge variant="secondary">
              {row.capacity} students
            </Badge>
          ) : (
            "-"
          )}
        </div>
      ),
      sortable: true,
      sortKey: "capacity",
    },
    ...(!isDeletedView
      ? createCommonColumns<MasterClass>({ onView, onEdit, onDelete })
      : [
          {
            header: "Actions",
            accessor: (classData) => (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(classData)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(classData)}
                  className="text-green-600 hover:text-green-700"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reactivate
                </Button>
              </div>
            ),
          },
        ]),
  ];
}
