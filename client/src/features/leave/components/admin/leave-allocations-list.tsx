/**
 * Leave Allocations List Component (Admin)
 * Displays and manages leave allocations for different roles and leave types.
 * Supports filtering by leave type and role with client-side pagination.
 */

import { useQuery } from "@tanstack/react-query";
import { Plus, Filter, X, Eye, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TablePagination } from "@/components/ui/table-pagination";
import {
  fetchLeaveAllocations,
  fetchLeaveTypes,
  fetchOrganizationRoles,
  type LeaveAllocation,
} from "@/lib/api/leave-api";
import { formatDateForDisplay } from "@/lib/utils/date-utils";

interface LeaveAllocationsListProps {
  onCreateNew: () => void;
  onView?: (allocation: LeaveAllocation) => void;
  onEdit?: (allocation: LeaveAllocation) => void;
  onDelete?: (allocation: LeaveAllocation) => void;
}

export function LeaveAllocationsList({
  onCreateNew,
  onView,
  onEdit,
  onDelete,
}: LeaveAllocationsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterLeaveType, setFilterLeaveType] = useState<string>("all");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [pageSize, setPageSize] = useState(10);

  // Fetch leave types for filter
  const { data: leaveTypesData } = useQuery({
    queryKey: ["leave-types"],
    queryFn: fetchLeaveTypes,
  });

  // Fetch organization roles for filter
  const { data: rolesData } = useQuery({
    queryKey: ["organization-roles"],
    queryFn: fetchOrganizationRoles,
  });

  // Fetch allocations with filters (fetch all without pagination for client-side filtering)
  const {
    data: allocationsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["leave-allocations", filterLeaveType],
    queryFn: () =>
      fetchLeaveAllocations({
        page: 1,
        page_size: 100, // Fetch more records for client-side pagination
        leave_type: filterLeaveType !== "all" ? parseInt(filterLeaveType) : undefined,
      }),
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const leaveTypes = leaveTypesData?.data || [];
  const roles = rolesData?.data || [];
  const allAllocations = allocationsData?.data || [];

  // Apply client-side role filtering
  const filteredAllocations =
    filterRole !== "all"
      ? allAllocations.filter((allocation) => {
          const rolesArray = allocation.roles.split(",").map((role) => role.trim());
          return rolesArray.includes(filterRole);
        })
      : allAllocations;

  // Calculate client-side pagination
  const totalRecords = filteredAllocations.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const allocations = filteredAllocations.slice(startIndex, endIndex);

  const handleClearFilters = () => {
    setFilterLeaveType("all");
    setFilterRole("all");
    setCurrentPage(1);
  };

  // Reset to page 1 when filters change
  const handleLeaveTypeChange = (value: string) => {
    setFilterLeaveType(value);
    setCurrentPage(1);
  };

  const handleRoleChange = (value: string) => {
    setFilterRole(value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const hasActiveFilters = filterLeaveType !== "all" || filterRole !== "all";

  // Define table columns
  const columns: Column<LeaveAllocation>[] = [
    {
      header: "Leave Type",
      accessor: (row) => <div className="font-medium text-gray-900">{row.leave_type_name}</div>,
      sortable: true,
      sortKey: "leave_type_name",
    },
    {
      header: "Total Days",
      accessor: (row) => <span className="font-semibold text-blue-600">{row.total_days}</span>,
      sortable: true,
      sortKey: "total_days",
    },
    {
      header: "Carry Forward",
      accessor: (row) => <span className="text-gray-700">{row.max_carry_forward_days} days</span>,
      sortable: true,
      sortKey: "max_carry_forward_days",
    },
    {
      header: "Applicable Roles",
      accessor: (row) => {
        const rolesArray = row.roles
          .split(",")
          .map((role) => role.trim())
          .filter((role) => role.length > 0);

        return (
          <div className="flex max-w-xs flex-wrap gap-1">
            {rolesArray.slice(0, 3).map((role, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="border-blue-200 bg-blue-50 text-xs text-blue-700"
              >
                {role}
              </Badge>
            ))}
            {rolesArray.length > 3 && (
              <Badge variant="secondary" className="bg-gray-100 text-xs text-gray-600">
                +{rolesArray.length - 3} more
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      header: "Created By",
      accessor: (row) => (
        <div className="text-sm">
          <div className="text-gray-700">{row.created_by_name || "System"}</div>
          <div className="text-xs text-gray-500">{formatDateForDisplay(row.created_at)}</div>
        </div>
      ),
      sortable: true,
      sortKey: "created_by_name",
    },
    {
      header: "Last Updated",
      accessor: (row) => (
        <div className="text-sm text-gray-500">{formatDateForDisplay(row.updated_at)}</div>
      ),
      sortable: true,
      sortKey: "updated_at",
    },
    {
      header: "Actions",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onView?.(row);
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
              onEdit?.(row);
            }}
            className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(row);
            }}
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
          <h1 className="mb-3 text-3xl font-bold text-gray-900">Leave Allocation Policies</h1>
          <p className="text-base text-gray-600">
            Manage leave policies and allocations for your organization
          </p>
        </div>
        <Button onClick={onCreateNew} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Create Policy
        </Button>
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Leave Type Filter */}
            <div>
              <span className="mb-2 block text-sm font-medium text-gray-700">Leave Type</span>
              <Select value={filterLeaveType} onValueChange={handleLeaveTypeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Leave Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leave Types</SelectItem>
                  {leaveTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role Filter */}
            <div>
              <span className="mb-2 block text-sm font-medium text-gray-700">Role</span>
              <Select value={filterRole} onValueChange={handleRoleChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Allocations Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Leave Policies</CardTitle>
          <CardDescription>
            {totalRecords > 0
              ? `Showing ${startIndex + 1}-${Math.min(endIndex, totalRecords)} of ${totalRecords} policies`
              : "No policies found"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={allocations}
            isLoading={isLoading}
            emptyMessage="No leave allocations found"
            emptyAction={{
              label: "Create Your First Policy",
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
