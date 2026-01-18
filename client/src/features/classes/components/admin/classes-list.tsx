/**
 * Classes/Sections List Component (Admin)
 * Displays a filterable and paginated table of all classes/sections in the organization.
 * Provides search, filtering, and CRUD actions.
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { TablePagination } from "@/components/ui/table-pagination";
import { fetchClasses, type MasterClass } from "@/lib/api/class-api";
import { useQuery } from "@tanstack/react-query";
import { Eye, GraduationCap, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { BulkUploadClasses } from "./bulk-upload-classes";

interface ClassesListProps {
  onCreateNew: () => void;
  onView: (classData: MasterClass) => void;
  onEdit: (classData: MasterClass) => void;
  onDelete: (classData: MasterClass) => void;
}

export function ClassesList({ onCreateNew, onView, onEdit, onDelete }: ClassesListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [pageSize, setPageSize] = useState(10);

  // Fetch all classes once, paginate client-side to avoid refetch on page navigation
  const {
    data: classesData,
    isLoading,
  } = useQuery({
    queryKey: ["classes", searchQuery],
    queryFn: () =>
      fetchClasses({
        page: 1,
        page_size: 100, // Fetch more records for client-side pagination
        search: searchQuery || undefined,
      }),
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const allClasses = classesData?.data || [];

  // Client-side pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const classes = allClasses.slice(startIndex, endIndex);
  const totalRecords = allClasses.length;
  const totalPages = Math.ceil(totalRecords / pageSize);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Table columns definition
  const columns: Column<MasterClass>[] = [
    {
      header: "Class",
      accessor: (row: MasterClass) => (
        <div className="font-medium text-gray-900">
          {row.class_master.name} - {row.name}
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
          {row.capacity ? `${row.capacity} students` : "-"}
        </div>
      ),
      sortable: true,
      sortKey: "capacity",
    },
    {
      header: "Actions",
      accessor: (row: MasterClass) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(row)}
            className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row)}
            className="h-8 w-8 p-0 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(row)}
            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page Header */}
      <div className="mt-10 mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-3 text-3xl font-bold text-gray-900">Classes & Sections Management</h1>
          <p className="text-base text-gray-600">
            Manage your organization&apos;s classes and sections
          </p>
        </div>
        <div className="flex gap-3">
          <BulkUploadClasses />
          <Button
            onClick={onCreateNew}
            className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="h-4 w-4" />
            Add Sections
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="mb-6 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <span className="mb-2 block text-sm font-medium text-gray-700">Search</span>
              <Input
                type="text"
                placeholder="Search by section name..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classes Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Sections
          </CardTitle>
          <CardDescription>
            {totalRecords > 0
              ? `Showing ${startIndex + 1}-${Math.min(endIndex, totalRecords)} of ${totalRecords} section(s)`
              : "No sections found"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={classes}
            isLoading={isLoading}
            emptyMessage="No sections found"
            emptyAction={{
              label: "Add Your First Section",
              onClick: onCreateNew,
            }}
            getRowKey={(row) => row.public_id}
          />

          <div className="mt-4">
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalRecords={totalRecords}
              onPageChange={setCurrentPage}
              pageSize={pageSize}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
