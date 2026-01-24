import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
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
import { fetchTeachers, reactivateTeacher, type Teacher } from "@/lib/api/teacher-api";
import { BulkUploadTeachers } from "./bulk-upload-teachers";
import { getTeacherColumns } from "./teachers-table-columns";

interface TeachersListProps {
  onCreateNew: () => void;
  onView: (teacher: Teacher) => void;
  onEdit: (teacher: Teacher) => void;
  onDelete: (teacher: Teacher) => void;
  onReactivate?: (teacher: Teacher) => void;
}

export function TeachersList({ 
  onCreateNew,
  onView, 
  onEdit, 
  onDelete,
  onReactivate
}: TeachersListProps) {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    showDeleted,
    toggleDeletedView,
    handleReactivate: _handleReactivate,
  } = useDeletedView({
    resourceName: "Teacher",
    queryKey: ["teachers"],
    reactivateFn: reactivateTeacher,
    onPageChange: setPage,
  });

  const {
    data: teachersData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["teachers", page, pageSize, filters, showDeleted],
    queryFn: () =>
      fetchTeachers({
        page,
        page_size: pageSize,
        search: filters.search,
        is_deleted: showDeleted
      }),
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const teachers = teachersData?.data || [];
  const totalCount = teachersData?.pagination?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const columns = showDeleted 
    ? getTeacherColumns({ 
        onView, 
        onEdit: () => {}, 
        onDelete: onReactivate || (() => {}),
        isDeletedView: true 
      })
    : getTeacherColumns({ onView, onEdit, onDelete });

  const filterFields: FilterField[] = [
    {
      name: "search",
      label: "Search",
      type: "text",
      placeholder: "Name, email, or employee ID...",
    },
  ];

  const handleFilter = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({});
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  if (error) {
    return (
      <Card className="mx-auto max-w-7xl">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Teachers</h3>
            <p className="text-gray-600 mb-4">Failed to fetch teachers. Please try again.</p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="mb-3 text-3xl font-bold text-gray-900">
            {getListTitle("Teachers", showDeleted)}
          </h1>
          <p className="text-base text-gray-600">
            {getListDescription("Teachers", showDeleted)}
          </p>
        </div>
        <div className="flex gap-2">
          <DeletedViewToggle
            showDeleted={showDeleted}
            onToggle={toggleDeletedView}
            resourceName="teachers"
          />
          {!showDeleted && (
            <>
              <BulkUploadTeachers />
              <Button onClick={onCreateNew} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Teacher
              </Button>
            </>
          )}
        </div>
      </div>

      <ResourceFilter
        fields={filterFields}
        onFilter={handleFilter}
        onReset={handleResetFilters}
        defaultValues={filters}
      />

      <Card>
        <CardHeader>
          <CardTitle>
            {getCardTitle("Teachers", totalCount, showDeleted)}
          </CardTitle>
          <CardDescription>
            {getCardDescription("Teachers", Object.keys(filters).length > 0, showDeleted)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={teachers} 
            isLoading={isLoading}
            emptyMessage={getEmptyMessage("Teachers", Object.keys(filters).length > 0, showDeleted)}
            emptyAction={!showDeleted && Object.keys(filters).length === 0 && teachers.length === 0 ? {
              label: "Add First Teacher",
              onClick: onCreateNew
            } : undefined}
            getRowKey={(teacher) => teacher.public_id}
          />

          {totalCount > 0 && (
            <div className="mt-4">
              <TablePagination
                currentPage={page}
                totalPages={totalPages}
                totalRecords={totalCount}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
