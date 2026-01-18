/**
 * Students Table Columns Configuration
 * Defines column structure for students data table
 */

import { Eye, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Column } from "@/components/ui/data-table";
import type { Student } from "@/lib/api/student-api";

interface GetStudentColumnsOptions {
  onView: (student: Student) => void;
  onEdit: (student: Student) => void;
  onDelete: (publicId: string) => void;
}

export function getStudentColumns({
  onView,
  onEdit,
  onDelete,
}: GetStudentColumnsOptions): Column<Student>[] {
  return [
    {
      key: "roll_number",
      label: "Roll No",
      render: (student) => (
        <span className="font-medium text-gray-900">{student.roll_number}</span>
      ),
    },
    {
      key: "full_name",
      label: "Student Name",
      render: (student) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{student.full_name}</span>
          <span className="text-sm text-gray-500">{student.user?.email || "No email"}</span>
        </div>
      ),
    },
    {
      key: "admission_number",
      label: "Admission No",
      render: (student) => (
        <span className="text-sm text-gray-600">{student.admission_number || "N/A"}</span>
      ),
    },
    {
      key: "class_assigned",
      label: "Class",
      render: (student) => {
        if (!student.class_assigned) {
          return <Badge variant="outline">Not Assigned</Badge>;
        }
        return (
          <Badge variant="secondary">
            {student.class_assigned.class_master?.name || ""} - {student.class_assigned.name}
          </Badge>
        );
      },
    },
    {
      key: "guardian_name",
      label: "Guardian",
      render: (student) => (
        <div className="flex flex-col">
          <span className="text-sm text-gray-900">{student.guardian_name || "N/A"}</span>
          <span className="text-xs text-gray-500">{student.guardian_phone || ""}</span>
        </div>
      ),
    },
    {
      key: "admission_date",
      label: "Admission Date",
      render: (student) => (
        <span className="text-sm text-gray-600">
          {student.admission_date
            ? new Date(student.admission_date).toLocaleDateString()
            : "N/A"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (student) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(student)}
            className="text-blue-600 hover:text-blue-700"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(student)}
            className="text-orange-600 hover:text-orange-700"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(student.public_id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
}
