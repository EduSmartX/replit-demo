/**
 * Subjects List Page (Admin)
 * Lists all subject assignments in a single table ordered by class
 * Allows filtering by class and subject with pagination
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { TablePagination } from "@/components/ui/table-pagination";
import { useDeleteMutation } from "@/hooks/use-delete-mutation";
import { useDeletedView } from "@/hooks/use-deleted-view";
import { api, API_ENDPOINTS } from "@/lib/api";
import { fetchClasses } from "@/lib/api/class-api";
import { deleteSubject, getSubjects, reactivateSubject, type Subject, type CoreSubject } from "@/lib/api/subject-api";
import { fetchTeachers } from "@/lib/api/teacher-api";
import { BulkUploadSubjects } from "./bulk-upload-subjects";
import { getSubjectColumns } from "./subjects-table-columns";

interface SubjectsListProps {
  onCreateNew?: () => void;
  onEdit?: (subject: Subject) => void;
}

export function SubjectsList({ onCreateNew, onEdit: onEditProp }: SubjectsListProps = {}) {
  const _queryClient = useQueryClient();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [deleteSubjectId, setDeleteSubjectId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    showDeleted,
    toggleDeletedView,
    handleReactivate,
  } = useDeletedView({
    resourceName: "Subject",
    queryKey: ["subjects"],
    reactivateFn: reactivateSubject,
    onPageChange: setPage,
  });

  // Fetch classes for filter dropdown
  const { data: classesData } = useQuery({
    queryKey: ["classes-list"],
    queryFn: () => fetchClasses({ page_size: 100 }),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch core subjects for filter dropdown
  const { data: coreSubjectsData } = useQuery({
    queryKey: ["core", "subjects"],
    queryFn: async () => {
      const response = await api.get<CoreSubject[]>(API_ENDPOINTS.core.subjects);
      return response;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch teachers for filter dropdown
  const { data: teachersData } = useQuery({
    queryKey: ["teachers-list"],
    queryFn: () => fetchTeachers({ page_size: 100 }),
    staleTime: 5 * 60 * 1000,
  });

  // Build API filters matching backend filter names
  const apiFilters = {
    search: filters.search || undefined,
    class_assigned__public_id: filters.class_id || undefined,
    subject_master__id: filters.subject_id || undefined,
    teacher__public_id: filters.teacher_id || undefined,
    is_deleted: showDeleted,
    page,
    page_size: pageSize,
  };

  const { data, isLoading } = useQuery({
    queryKey: ["subjects", apiFilters],
    queryFn: () => getSubjects(apiFilters),
  });

  const deleteMutation = useDeleteMutation({
    resourceName: "Subject assignment",
    deleteFn: deleteSubject,
    queryKeys: ["subjects"],
    refetchQueries: false,
  });

  // Get subjects ordered by class (API should return them ordered)
  const subjects = data?.data || [];
  const totalRecords = data?.pagination?.count || 0;
  const totalPages = data?.pagination?.total_pages || 1;

  const handleEdit = (subject: Subject) => {
    if (onEditProp) {
      onEditProp(subject);
    }
  };

  const handleDelete = (publicId: string) => {
    setDeleteSubjectId(publicId);
  };

  const confirmDelete = () => {
    if (deleteSubjectId) {
      deleteMutation.mutate(deleteSubjectId);
      setDeleteSubjectId(null);
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
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({});
    setPage(1);
  };

  // Prepare filter fields
  const classes = classesData?.data || [];
  const coreSubjects = Array.isArray(coreSubjectsData) 
    ? coreSubjectsData 
    : (coreSubjectsData as any)?.data || [];
  const teachers = teachersData?.data || [];

  const filterFields: FilterField[] = [
    {
      name: "search",
      label: "Search",
      type: "text",
      placeholder: "Search by subject, class, or teacher...",
    },
    {
      name: "class_id",
      label: "Filter by Class",
      type: "select",
      placeholder: "All Classes",
      options: classes.map((cls) => ({
        value: cls.public_id,
        label: `${cls.class_master.name} - ${cls.name}`,
      })),
    },
    {
      name: "subject_id",
      label: "Filter by Subject",
      type: "select",
      placeholder: "All Subjects",
      options: coreSubjects.map((subject: CoreSubject) => ({
        value: subject.id.toString(),
        label: `${subject.name} (${subject.code})`,
      })),
    },
    {
      name: "teacher_id",
      label: "Filter by Teacher",
      type: "select",
      placeholder: "All Teachers",
      options: teachers.map((teacher) => ({
        value: teacher.public_id,
        label: `${teacher.full_name} (${teacher.email})`,
      })),
    },
  ];

  // Define table columns
  const columns = showDeleted
    ? getSubjectColumns({
        onReactivate: handleReactivate,
      })
    : getSubjectColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
      });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="mb-3 text-3xl font-bold text-gray-900">
                {getListTitle("Subjects", showDeleted)}
              </h1>
              <p className="text-base text-gray-600">
                {getListDescription("Subjects", showDeleted)}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <DeletedViewToggle
                showDeleted={showDeleted}
                onToggle={toggleDeletedView}
              />

              {!showDeleted && (
                <>
                  <BulkUploadSubjects />
                  <Button
                    onClick={handleCreateClick}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Assign Subject
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
            defaultValues={filters}
          />

          {/* Subject List Table */}
          <Card>
            <CardHeader>
              <CardTitle>{getCardTitle("Subjects", totalRecords, showDeleted)}</CardTitle>
              <CardDescription>
                {getCardDescription("subjects", Object.keys(filters).length > 0, showDeleted)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable 
                columns={columns} 
                data={subjects} 
                isLoading={isLoading}
                emptyMessage={getEmptyMessage("subjects", Object.keys(filters).length > 0, showDeleted)}
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

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteSubjectId} onOpenChange={() => setDeleteSubjectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subject Assignment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the subject assignment. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
