/**
 * Students List Component
 * Following Teacher pattern with all required features
 */

import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { DeletedViewToggle } from "@/common/components";
import { ResourceFilter, type FilterField } from "@/common/components/filters";
import {
  getCardDescription,
  getCardTitle,
  getEmptyMessage,
  getListDescription,
  getListTitle,
} from "@/common/utils/deleted-view-helpers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { TablePagination } from "@/components/ui/table-pagination";
import { useDeletedView } from "@/hooks/use-deleted-view";
import { fetchClasses, fetchCoreClasses } from "@/lib/api/class-api";
import { getStudents, reactivateStudent, type Student } from "@/lib/api/student-api";
import { ERROR_MESSAGES } from "@/lib/constants";
import { BulkUploadStudents } from "./bulk-upload-students";
import { getStudentColumns } from "./students-table-columns";

interface StudentsListProps {
  onCreateNew?: () => void;
  onView?: (student: Student) => void;
  onEdit?: (student: Student) => void;
  onDelete?: (student: Student) => void;
  onReactivate?: (student: Student) => void;
}

export function StudentsList({
  onCreateNew,
  onView: onViewProp,
  onEdit: onEditProp,
  onDelete: onDeleteProp,
  onReactivate: onReactivateProp,
}: StudentsListProps = {}) {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [formFilters, setFormFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { showDeleted, toggleDeletedView } = useDeletedView({
    resourceName: "Student",
    queryKey: ["students"],
    reactivateFn: (publicId: string) => {
      // Extract class_id from the student record
      const student = students.find((s: Student) => s.public_id === publicId);
      if (!student) {
        throw new Error(ERROR_MESSAGES.STUDENT_NOT_FOUND);
      }
      return reactivateStudent(student.class_info.public_id, publicId);
    },
    onPageChange: setPage,
  });

  // Fetch core classes (master classes) for filter dropdown
  const { data: coreClassesData } = useQuery({
    queryKey: ["core-classes-list"],
    queryFn: () => fetchCoreClasses({ page_size: 100 }),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch all classes (sections) for filter dropdown
  const { data: classesData } = useQuery({
    queryKey: ["classes-list"],
    queryFn: () => fetchClasses({ page_size: 100 }),
    staleTime: 5 * 60 * 1000,
  });

  // Build API filters
  const apiFilters = {
    search: filters.search || undefined,
    class_id: filters.class_id || undefined,
    class_master_id: filters.class_master_id || undefined,
    is_deleted: showDeleted,
    page,
    page_size: pageSize,
  };

  const { data, isLoading } = useQuery({
    queryKey: ["students", apiFilters],
    queryFn: () => getStudents(apiFilters),
  });

  const students = data?.data || [];
  const totalRecords = data?.pagination?.count || 0;
  const totalPages = data?.pagination?.total_pages || 1;

  const handleView = (student: Student) => {
    if (onViewProp) {
      onViewProp(student);
    }
  };

  const handleEdit = (student: Student) => {
    if (onEditProp) {
      onEditProp(student);
    }
  };

  const handleDelete = (student: Student) => {
    if (onDeleteProp) {
      onDeleteProp(student);
    }
  };

  const handleCreateClick = () => {
    if (onCreateNew) {
      onCreateNew();
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  const handleFilter = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    setFormFilters(newFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({});
    setFormFilters({});
    setPage(1);
  };

  const handleFieldChange = (name: string, value: string, allFilters: Record<string, string>) => {
    setFormFilters(allFilters);
  };

  const handleReactivate = (student: Student) => {
    if (onReactivateProp) {
      onReactivateProp(student);
    }
  };

  // Prepare filter fields
  const coreClasses = useMemo(() => coreClassesData?.data || [], [coreClassesData?.data]);

  const filteredSections = useMemo(() => {
    const allClasses = classesData?.data || [];

    if (!formFilters.class_master_id) {
      return allClasses;
    }

    const selectedMasterClass = coreClasses.find(
      (c) => c.id.toString() === formFilters.class_master_id
    );

    if (!selectedMasterClass) {
      return [];
    }

    const filtered = allClasses.filter((cls) => {
      return cls.class_master.id === selectedMasterClass.id;
    });

    return filtered;
  }, [formFilters.class_master_id, classesData?.data, coreClasses]);

  const filterFields: FilterField[] = [
    {
      name: "search",
      label: "Search",
      type: "text",
      placeholder: "Search by name, roll number, or email...",
    },
    {
      name: "class_master_id",
      label: "Master Class",
      type: "select",
      placeholder: "All",
      options: coreClasses.map((cls) => ({
        value: cls.id.toString(),
        label: cls.name,
      })),
    },
    {
      name: "class_id",
      label: "Class Assigned",
      type: "select",
      placeholder: "All",
      options: filteredSections.map((cls) => ({
        value: cls.public_id,
        label: cls.name,
      })),
      disabled: !formFilters.class_master_id || filteredSections.length === 0,
    },
  ];

  // Define table columns
  const columns = showDeleted
    ? getStudentColumns({
        onReactivate: handleReactivate,
      })
    : getStudentColumns({
        onView: handleView,
        onEdit: handleEdit,
        onDelete: handleDelete,
      });

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-3 text-3xl font-bold text-gray-900">
            {getListTitle("Students", showDeleted)}
          </h1>
          <p className="text-base text-gray-600">{getListDescription("Students", showDeleted)}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <DeletedViewToggle showDeleted={showDeleted} onToggle={toggleDeletedView} />

          {!showDeleted && (
            <>
              <BulkUploadStudents />
              <Button onClick={handleCreateClick}>
                <Plus className="mr-2 h-4 w-4" />
                Add Student
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <ResourceFilter
        fields={filterFields}
        onFilter={handleFilter}
        onReset={handleResetFilters}
        defaultValues={formFilters}
        onFieldChange={handleFieldChange}
      />

      {/* Student List Table */}
      <Card>
        <CardHeader>
          <CardTitle>{getCardTitle("Students", totalRecords, showDeleted)}</CardTitle>
          <CardDescription>
            {getCardDescription("students", Object.keys(filters).length > 0, showDeleted)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={students}
            isLoading={isLoading}
            emptyMessage={getEmptyMessage("students", Object.keys(filters).length > 0, showDeleted)}
            getRowKey={(row) => row.public_id}
          />

          {totalRecords > 0 && (
            <div className="mt-4">
              <TablePagination
                currentPage={page}
                totalPages={totalPages}
                totalRecords={totalRecords}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
