/**
 * Subjects Table Columns Configuration
 * Defines column structure for subjects data table
 */

import { Pencil, Trash2, User, RotateCcw } from "lucide-react";
import { createCreatedByColumn, createLastUpdatedColumn } from "@/common/components/tables";
import { Button } from "@/components/ui/button";
import type { Column } from "@/components/ui/data-table";
import type { Subject } from "@/lib/api/subject-api";

interface GetSubjectColumnsOptions {
  onEdit?: (subject: Subject) => void;
  onDelete?: (publicId: string) => void;
  onReactivate?: (publicId: string) => void;
}

export function getSubjectColumns({
  onEdit,
  onDelete,
  onReactivate,
}: GetSubjectColumnsOptions): Column<Subject>[] {
  return [
    {
      header: "Class",
      accessor: (subject) => (
        <div>
          <p className="font-medium text-gray-900">{subject.class_info.class_master_name}</p>
          <p className="text-sm text-gray-500">{subject.class_info.name}</p>
        </div>
      ),
      sortable: true,
      sortKey: "class_info.name",
    },
    {
      header: "Subject",
      accessor: (subject) => (
        <div>
          <p className="font-medium text-gray-900">{subject.subject_info.name}</p>
        </div>
      ),
      sortable: true,
      sortKey: "subject_info.name",
    },
    {
      header: "Teacher",
      accessor: (subject) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          <div>
            <p className="font-medium text-gray-900">{subject.teacher_info?.full_name || "-"}</p>
            <p className="text-sm text-gray-500">{subject.teacher_info?.employee_id || "-"}</p>
          </div>
        </div>
      ),
      sortable: true,
      sortKey: "teacher_info.full_name",
    },
    {
      header: "Description",
      accessor: (subject) => {
        const desc = subject.description;
        const displayText = (!desc || desc === 'nan' || desc === 'NaN') ? "-" : desc;
        return <p className="text-sm text-gray-600 text-center">{displayText}</p>;
      },
    },
    createCreatedByColumn<Subject>(),
    createLastUpdatedColumn<Subject>(),
    {
      header: "Actions",
      accessor: (subject) => (
        <div className="flex items-center gap-2">
          {onReactivate ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onReactivate(subject.public_id);
              }}
              className="h-8 px-3 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
              title="Reactivate"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reactivate
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(subject);
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
                  onDelete?.(subject.public_id);
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
