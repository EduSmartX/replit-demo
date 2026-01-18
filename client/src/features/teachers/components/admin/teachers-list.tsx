/**
 * Teachers List Component (Admin)
 * Displays a filterable and paginated table of all teachers in the organization.
 * Provides bulk upload, search, filtering by specialization/designation, and CRUD actions.
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TablePagination } from "@/components/ui/table-pagination";
import { fetchTeachers, type Teacher } from "@/lib/api/teacher-api";
import { useQuery } from "@tanstack/react-query";
import { Archive, Eye, Filter, Pencil, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { useState } from "react";
import { BulkUploadTeachers } from "./bulk-upload-teachers";

interface TeachersListProps {
  onCreateNew: () => void;
  onView: (teacher: Teacher) => void;
  onEdit: (teacher: Teacher) => void;
  onDelete: (publicId: string) => void;
  onReactivate: (publicId: string) => void;
}

export function TeachersList({ onCreateNew, onView, onEdit, onDelete, onReactivate }: TeachersListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterSpecialization, setFilterSpecialization] = useState<string>("all");
  const [filterDesignation, setFilterDesignation] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [pageSize, setPageSize] = useState(10);
  const [showDeleted, setShowDeleted] = useState(false);

  // Fetch all teachers once with filters, then paginate client-side for better UX (no refetch on page change)
  const {
    data: teachersData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["teachers", filterSpecialization, filterDesignation, searchQuery, showDeleted],
    queryFn: () =>
      fetchTeachers({
        page: 1,
        page_size: 100, // Fetch more records for client-side pagination
        specialization: filterSpecialization !== "all" ? filterSpecialization : undefined,
        designation: filterDesignation !== "all" ? filterDesignation : undefined,
        search: searchQuery || undefined,
        is_deleted: showDeleted ? true : undefined,
      }),
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const allTeachers = teachersData?.data || [];

  // Dynamic filter extraction: Build filter options from actual data instead of hardcoded lists
  const uniqueSpecializations = Array.from(
    new Set(allTeachers.map((t) => t.specialization).filter(Boolean))
  ).sort();

  const uniqueDesignations = Array.from(
    new Set(allTeachers.map((t) => t.designation).filter(Boolean))
  ).sort();

  // Client-side pagination: Slice in-memory data to avoid refetch on page change
  const totalRecords = allTeachers.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const teachers = allTeachers.slice(startIndex, endIndex);

  const handleClearFilters = () => {
    setFilterSpecialization("all");
    setFilterDesignation("all");
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Filter change handlers: Reset to page 1 to avoid empty pages after filtering
  const handleSpecializationChange = (value: string) => {
    setFilterSpecialization(value);
    setCurrentPage(1);
  };

  const handleDesignationChange = (value: string) => {
    setFilterDesignation(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const hasActiveFilters =
    filterSpecialization !== "all" || filterDesignation !== "all" || searchQuery !== "";

  // Define table columns
  const columns: Column<Teacher>[] = [
    {
      header: "Employee ID",
      accessor: (row) => <div className="font-medium text-gray-900">{row.employee_id}</div>,
      sortable: true,
      sortKey: "employee_id",
    },
    {
      header: "Name",
      accessor: (row) => (
        <div>
          <div className="font-medium">{row.full_name}</div>
          {row.designation && <div className="text-xs text-gray-500">{row.designation}</div>}
        </div>
      ),
      sortable: true,
      sortKey: "full_name",
    },
    {
      header: "Email",
      accessor: (row) => <span className="text-sm text-gray-700">{row.email}</span>,
      sortable: true,
      sortKey: "email",
    },
    {
      header: "Phone",
      accessor: (row) => <span className="text-sm text-gray-700">{row.phone || "-"}</span>,
      sortable: true,
      sortKey: "phone",
    },
    {
      header: "Specialization",
      accessor: (row) => <span className="text-sm text-gray-700">{row.specialization || "-"}</span>,
      sortable: true,
      sortKey: "specialization",
    },
    {
      header: "Subjects",
      accessor: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.subjects && row.subjects.length > 0 ? (
            <>
              {row.subjects.slice(0, 2).map((subject) => (
                <Badge
                  key={subject.public_id}
                  variant="secondary"
                  className="bg-purple-100 text-xs text-purple-700"
                >
                  {subject.name}
                </Badge>
              ))}
              {row.subjects.length > 2 && (
                <Badge variant="secondary" className="bg-purple-100 text-xs text-purple-700">
                  +{row.subjects.length - 2}
                </Badge>
              )}
            </>
          ) : (
            <span className="text-sm text-gray-400">No subjects</span>
          )}
        </div>
      ),
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(row)}
            className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {!showDeleted ? (
            <>
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
                onClick={() => onDelete(row.public_id)}
                className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReactivate(row.public_id)}
              className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700"
              title="Reactivate"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      {/* Page Header */}
      <div className="mt-10 mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-3 text-3xl font-bold text-gray-900">
            {showDeleted ? "Deleted Teachers" : "Teachers Management"}
          </h1>
          <p className="text-base text-gray-600">
            {showDeleted ? "View and reactivate deleted teachers" : "Manage and track teachers in your organization"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={showDeleted ? "default" : "outline"}
            onClick={() => {
              setShowDeleted(!showDeleted);
              setCurrentPage(1);
            }}
            className={showDeleted ? "bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-700 hover:to-orange-700" : ""}
          >
            <Archive className="mr-2 h-4 w-4" />
            {showDeleted ? "Show Active Teachers" : "View Deleted Teachers"}
          </Button>
          {!showDeleted && (
            <>
              <BulkUploadTeachers />
              <Button
                onClick={onCreateNew}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Teacher
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filters Section */}
      <Card className="mb-6 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <CardTitle className="text-lg">Filters</CardTitle>
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="mr-1 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Specialization Filter */}
            <div>
              <span className="mb-2 block text-sm font-medium text-gray-700">Specialization</span>
              <Select value={filterSpecialization} onValueChange={handleSpecializationChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Specializations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specializations</SelectItem>
                  {uniqueSpecializations.map((spec) => (
                    <SelectItem key={spec} value={spec as string}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Designation Filter */}
            <div>
              <span className="mb-2 block text-sm font-medium text-gray-700">Designation</span>
              <Select value={filterDesignation} onValueChange={handleDesignationChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Designations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Designations</SelectItem>
                  {uniqueDesignations.map((desig) => (
                    <SelectItem key={desig} value={desig as string}>
                      {desig}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search Filter */}
            <div>
              <span className="mb-2 block text-sm font-medium text-gray-700">Search</span>
              <Input
                type="text"
                placeholder="Search by name, email, ID..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teachers Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Teachers</CardTitle>
          <CardDescription>
            {totalRecords > 0
              ? `Showing ${startIndex + 1}-${Math.min(endIndex, totalRecords)} of ${totalRecords} teacher(s)`
              : showDeleted 
                ? "No deleted teachers found" 
                : "No teachers found"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={teachers}
            isLoading={isLoading}
            emptyMessage={showDeleted ? "No deleted teachers found" : "No teachers found"}
            emptyAction={
              showDeleted
                ? undefined
                : {
                    label: "Add Your First Teacher",
                    onClick: onCreateNew,
                  }
            }
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
