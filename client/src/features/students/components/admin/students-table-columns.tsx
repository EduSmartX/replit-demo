/**
 * Students Table Columns Configuration
 * Defines column structure for students data table
 */

import { Pencil, Trash2, RotateCcw, User, Eye } from "lucide-react";
import { createCreatedByColumn, createLastUpdatedColumn } from "@/common/components/tables";
import { Button } from "@/components/ui/button";
import type { Column } from "@/components/ui/data-table";
import type { Student } from "@/lib/api/student-api";

interface GetStudentColumnsOptions {
  onView?: (student: Student) => void;
  onEdit?: (student: Student) => void;
  onDelete?: (student: Student) => void;
  onReactivate?: (student: Student) => void;
}

export function getStudentColumns({
  onView,
  onEdit,
  onDelete,
  onReactivate,
}: GetStudentColumnsOptions): Column<Student>[] {
  return [
    {
      header: "Class",
      accessor: (student) => (
        <div>
          <p className="font-medium text-gray-900">
            {student.class_info.class_master_name} ( {student.class_info.name} )
          </p>
        </div>
      ),
      sortable: true,
      sortKey: "class_info.name",
    },
    {
      header: "Student Name",
      accessor: (student) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          <p className="font-medium text-gray-900">{student.user_info.full_name}</p>
        </div>
      ),
      sortable: true,
      sortKey: "user_info.full_name",
    },
    {
      header: "Roll Number",
      accessor: (student) => <p className="text-sm text-gray-900">{student.roll_number}</p>,
      sortable: true,
      sortKey: "roll_number",
    },
    {
      header: "Admission Number",
      accessor: (student) => (
        <p className="text-sm text-gray-900">{student.admission_number || "-"}</p>
      ),
      sortable: true,
      sortKey: "admission_number",
    },
    {
      header: "Guardian",
      accessor: (student) => (
        <p className="font-medium text-gray-900">{student.guardian_name || "-"}</p>
      ),
    },
    createCreatedByColumn<Student>(),
    createLastUpdatedColumn<Student>(),
    {
      header: "Actions",
      accessor: (student) => (
        <div className="flex items-center gap-2">
          {onReactivate ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onReactivate(student);
              }}
              className="h-8 px-3 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              title="Reactivate"
            >
              <RotateCcw className="mr-1 h-4 w-4" />
              Reactivate
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onView?.(student);
                }}
                className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                title="View"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(student);
                }}
                className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700"
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(student);
                }}
                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];
}
