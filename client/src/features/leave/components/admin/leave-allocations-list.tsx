/**
 * Leave Allocations List Component (Admin)
 * Displays and manages leave allocations for different roles and leave types.
 * Supports filtering by leave type and role with client-side pagination.
 */

import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ResourceFilter, type FilterField } from "@/common/components/filters";
import { createCommonColumns } from "@/common/components/tables";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { TablePagination } from "@/components/ui/table-pagination";
import {
  fetchLeaveAllocations,
  fetchLeaveTypes,
  fetchOrganizationRoles,
  type LeaveAllocation,
} from "@/lib/api/leave-api";

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
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<Record<string, string>>({});

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
  
  const {
    data: allocationsData,
    isLoading,
  } = useQuery({
    queryKey: ["leave-allocations", filters.leave_type, filters.role],
    queryFn: () =>
      fetchLeaveAllocations({
        page: 1,
        page_size: 100, // Fetch more records for client-side pagination
        leave_type: filters.leave_type ? parseInt(filters.leave_type) : undefined,
        role: filters.role ? parseInt(filters.role) : undefined,
      }),
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const leaveTypes = leaveTypesData?.data || [];
  const roles = rolesData?.data || [];
  const allAllocations = allocationsData?.data || [];

  // Calculate client-side pagination
  const totalRecords = allAllocations.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const allocations = allAllocations.slice(startIndex, endIndex);

  const handleClearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const handleApplyFilters = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  // Build filter fields configuration
  const filterFields: FilterField[] = [
    {
      name: "leave_type",
      label: "Leave Type",
      type: "select",
      placeholder: "All Leave Types",
      options: leaveTypes.map((type) => ({
        value: type.id.toString(),
        label: type.name,
      })),
    },
    {
      name: "role",
      label: "Role",
      type: "select",
      placeholder: "All Roles",
      options: roles.map((role) => ({
        value: role.id.toString(),
        label: role.name,
      })),
    },
  ];

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
    ...createCommonColumns<LeaveAllocation>({ onView, onEdit, onDelete }),
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="mb-3 text-3xl font-bold text-gray-900">Leave Allocation Policies</h1>
          <p className="text-base text-gray-600">
            Manage leave policies and allocations for your organization
          </p>
        </div>
        <Button onClick={onCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Create Policy
        </Button>
      </div>

      {/* Filters Section */}
      <ResourceFilter
        fields={filterFields}
        onFilter={handleApplyFilters}
        onReset={handleClearFilters}
        defaultValues={filters}
      />

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
