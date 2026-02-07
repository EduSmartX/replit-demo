/**
 * Classes/Sections List Component (Admin)
 * Displays a filterable and paginated table of all classes/sections in the organization.
 * Provides search, filtering, and CRUD actions.
 * Supports deleted view for reactivating classes.
 */

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
import {
  fetchClasses,
  fetchCoreClasses,
  reactivateClass,
  type MasterClass,
} from "@/lib/api/class-api";
import { fetchTeachers } from "@/lib/api/teacher-api";
import { BulkUploadClasses } from "./bulk-upload-classes";
import { getClassColumns } from "./classes-table-columns";

interface ClassesListProps {
  onCreateNew: () => void;
  onView: (classData: MasterClass) => void;
  onEdit: (classData: MasterClass) => void;
  onDelete: (classData: MasterClass) => void;
  onReactivate?: (classData: MasterClass) => void;
}

export function ClassesList({
  onCreateNew,
  onView,
  onEdit,
  onDelete,
  onReactivate,
}: ClassesListProps) {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    showDeleted,
    toggleDeletedView,
    handleReactivate: _handleReactivate,
  } = useDeletedView({
    resourceName: "Section",
    queryKey: ["classes"],
    reactivateFn: reactivateClass,
    onPageChange: setPage,
  });

  // Fetch class masters for dropdown filter
  const { data: classMastersData } = useQuery({
    queryKey: ["core-classes"],
    queryFn: () => fetchCoreClasses({ page_size: 100 }),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch teachers for dropdown filter
  const { data: teachersData } = useQuery({
    queryKey: ["teachers-list"],
    queryFn: () => fetchTeachers({ page_size: 100 }),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const {
    data: classesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["classes", page, pageSize, filters, showDeleted],
    queryFn: () =>
      fetchClasses({
        page,
        page_size: pageSize,
        search: filters.search,
        class_master: filters.class_master ? parseInt(filters.class_master) : undefined,
        class_teacher: filters.class_teacher || undefined,
        is_deleted: showDeleted,
      }),
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const classes = classesData?.data || [];
  const totalCount = classesData?.pagination?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const columns = showDeleted
    ? getClassColumns({
        onView,
        onEdit: () => {},
        onDelete: onReactivate || (() => {}),
        isDeletedView: true,
      })
    : getClassColumns({ onView, onEdit, onDelete });

  const classMasters = classMastersData?.data || [];
  const teachers = teachersData?.data || [];

  const filterFields: FilterField[] = [
    {
      name: "search",
      label: "Search",
      type: "text",
      placeholder: "Search classes by name, class master, or teacher...",
    },
    {
      name: "class_master",
      label: "Class Master",
      type: "select",
      placeholder: "All Class Levels",
      options: classMasters.map((cm) => ({
        label: cm.name,
        value: cm.id.toString(),
      })),
    },
    {
      name: "class_teacher",
      label: "Class Teacher",
      type: "select",
      placeholder: "All Class Teachers",
      options: teachers.map((teacher) => ({
        label:
          teacher.full_name ||
          `${teacher.user?.first_name || ""} ${teacher.user?.last_name || ""}`.trim() ||
          teacher.email,
        value: teacher.public_id,
      })),
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
            <h3 className="mb-2 text-lg font-semibold text-red-600">Error Loading Classes</h3>
            <p className="mb-4 text-gray-600">Failed to fetch classes. Please try again.</p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-3 text-3xl font-bold text-gray-900">
            {getListTitle("Classes", showDeleted)}
          </h1>
          <p className="text-base text-gray-600">{getListDescription("Classes", showDeleted)}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <DeletedViewToggle
            showDeleted={showDeleted}
            onToggle={toggleDeletedView}
            resourceName="classes"
          />
          {!showDeleted && (
            <>
              <BulkUploadClasses />
              <Button onClick={onCreateNew} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Sections
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

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>{getCardTitle("Classes", totalCount, showDeleted)}</CardTitle>
          <CardDescription>
            {getCardDescription("classes", Object.keys(filters).length > 0, showDeleted)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={classes}
            isLoading={isLoading}
            emptyMessage={getEmptyMessage(
              "classes",
              Object.keys(filters).some((key) => filters[key]),
              showDeleted
            )}
            emptyAction={
              !showDeleted
                ? {
                    label: "Add Your First Section",
                    onClick: onCreateNew,
                  }
                : undefined
            }
            getRowKey={(row, _index) => row.public_id}
          />

          <div className="mt-4">
            <TablePagination
              currentPage={page}
              totalPages={totalPages}
              totalRecords={totalCount}
              onPageChange={handlePageChange}
              pageSize={pageSize}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
