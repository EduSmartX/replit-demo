import { Eye, RotateCcw } from "lucide-react";
import { createCommonColumns } from "@/common/components/tables";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Column } from "@/components/ui/data-table";
import type { Teacher } from "@/lib/api/teacher-api";

interface GetTeacherColumnsOptions {
  onView: (teacher: Teacher) => void;
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
  isDeletedView?: boolean;
}

export function getTeacherColumns({
  onView,
  onEdit,
  onDelete,
  isDeletedView = false,
}: GetTeacherColumnsOptions): Column<Teacher>[] {
  return [
    {
      header: "Employee ID",
      accessor: (teacher) => (
        <span className="font-medium text-gray-900">{teacher.employee_id}</span>
      ),
      sortable: true,
      sortKey: "employee_id",
    },
    {
      header: "Teacher Name",
      accessor: (teacher) => (
        <div className="flex min-w-[200px] flex-col">
          <span className="truncate font-medium text-gray-900">{teacher.full_name}</span>
          <span className="truncate text-sm text-gray-500" title={teacher.email}>
            {teacher.email}
          </span>
        </div>
      ),
      sortable: true,
      sortKey: "full_name",
      width: 220,
      minWidth: 200,
    },
    {
      header: "Phone",
      accessor: (teacher) => (
        <span className="text-sm text-gray-600">{teacher.phone || "N/A"}</span>
      ),
    },
    {
      header: "Designation",
      accessor: (teacher) => (
        <span className="text-sm text-gray-700">{teacher.designation || "N/A"}</span>
      ),
      sortable: true,
      sortKey: "designation",
    },
    {
      header: "Specialization",
      accessor: (teacher) => (
        <span className="text-sm text-gray-600">{teacher.specialization || "N/A"}</span>
      ),
    },
    {
      header: "Experience",
      accessor: (teacher) => {
        if (!teacher.experience_years) {
          return <span className="text-sm text-gray-500">N/A</span>;
        }
        return (
          <Badge variant="secondary">
            {teacher.experience_years} {teacher.experience_years === 1 ? "year" : "years"}
          </Badge>
        );
      },
      sortable: true,
      sortKey: "experience_years",
    },
    {
      header: "Joining Date",
      accessor: (teacher) => (
        <span className="text-sm text-gray-600">
          {teacher.joining_date ? new Date(teacher.joining_date).toLocaleDateString() : "N/A"}
        </span>
      ),
      sortable: true,
      sortKey: "joining_date",
    },
    ...(!isDeletedView
      ? createCommonColumns<Teacher>({ onView, onEdit, onDelete })
      : [
          {
            header: "Actions",
            accessor: (teacher) => (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(teacher)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(teacher)}
                  className="text-green-600 hover:text-green-700"
                  title="Restore Teacher"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            ),
          } as Column<Teacher>,
        ]),
  ];
}
