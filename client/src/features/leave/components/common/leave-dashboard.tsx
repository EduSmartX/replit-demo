/**
 * Leave Dashboard Component
 * Main dashboard showing leave balances and requests
 * Reusable across Admin, Teacher, and Student dashboards
 */

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Filter, Loader2, Plus, RefreshCw, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { ResourceFilter, type FilterField } from "@/common/components/filters";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { TablePagination } from "@/components/ui/table-pagination";
import { LeaveRequestStatus, LEAVE_STATUS_CONFIG } from "@/features/leave/constants";
import type { LeaveRequest } from "@/lib/api/leave-api";
import {
  fetchMyLeaveBalancesSummary,
  fetchMyLeaveRequests,
  fetchLeaveTypes,
  fetchUserLeaveBalancesSummary,
  fetchUserLeaveRequests,
} from "@/lib/api/leave-api";
import { CancelLeaveDialog } from "./cancel-leave-dialog";
import { getLeaveRequestColumns } from "./leave-request-table-columns";

export function LeaveDashboard() {
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const userPublicId = searchParams.get("user");

  const [cancelRequest, setCancelRequest] = useState<LeaveRequest | null>(null);

  // Pagination state for requests
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Fetch leave types for filter dropdown
  const { data: leaveTypesData } = useQuery({
    queryKey: ["leave-types"],
    queryFn: fetchLeaveTypes,
    staleTime: 300000, // 5 minutes
  });

  const leaveTypes = leaveTypesData?.data || [];

  // Fetch leave balances (no pagination needed)
  const {
    data: balancesData,
    isLoading: isLoadingBalances,
    error: balancesError,
    refetch: refetchBalances,
  } = useQuery({
    queryKey: userPublicId
      ? ["user-leave-balances-summary", userPublicId]
      : ["leave-balances-summary"],
    queryFn: () =>
      userPublicId ? fetchUserLeaveBalancesSummary(userPublicId) : fetchMyLeaveBalancesSummary(),
    staleTime: 30000, // 30 seconds
  });

  // Fetch leave requests with pagination and filters
  const {
    data: requestsData,
    isLoading: isLoadingRequests,
    error: requestsError,
    refetch: refetchRequests,
  } = useQuery({
    queryKey: userPublicId
      ? ["user-leave-requests", userPublicId, currentPage, pageSize, filters]
      : ["leave-requests", currentPage, pageSize, filters],
    queryFn: () => {
      const params = {
        page: currentPage,
        page_size: pageSize,
        status: filters.status || undefined,
        leave_type__name: filters.leave_type || undefined,
        start_date__gte: filters.start_date || undefined,
        end_date__lte: filters.end_date || undefined,
      };
      return userPublicId
        ? fetchUserLeaveRequests(userPublicId, params)
        : fetchMyLeaveRequests(params);
    },
    staleTime: 30000, // 30 seconds
  });

  const balances = balancesData?.data || [];
  const requests = requestsData?.data || [];
  const pagination = requestsData?.pagination;

  // Get user name from the first request if viewing another user's dashboard
  const viewingUserName = userPublicId ? requests[0]?.user_name || "User" : null;

  const handleApplyLeave = () => {
    navigate("/leave-requests/new");
  };

  const handleEditRequest = (request: LeaveRequest) => {
    navigate(`/leave-requests/${request.public_id}/edit`);
  };

  const handleViewRequest = (request: LeaveRequest) => {
    navigate(`/leave-requests/${request.public_id}`);
  };

  const handleDeleteRequest = (request: LeaveRequest) => {
    setCancelRequest(request);
  };

  const handleRefresh = () => {
    refetchBalances();
    refetchRequests();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleFilter = (newFilters: Record<string, string>) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when applying filters
  };

  const handleResetFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const activeFiltersCount = Object.keys(filters).length;

  // Define filter fields
  const filterFields: FilterField[] = [
    {
      name: "status",
      label: "Status",
      type: "select",
      placeholder: "All statuses",
      options: [
        {
          value: LeaveRequestStatus.PENDING,
          label: LEAVE_STATUS_CONFIG[LeaveRequestStatus.PENDING].label,
        },
        {
          value: LeaveRequestStatus.APPROVED,
          label: LEAVE_STATUS_CONFIG[LeaveRequestStatus.APPROVED].label,
        },
        {
          value: LeaveRequestStatus.REJECTED,
          label: LEAVE_STATUS_CONFIG[LeaveRequestStatus.REJECTED].label,
        },
        {
          value: LeaveRequestStatus.CANCELLED,
          label: LEAVE_STATUS_CONFIG[LeaveRequestStatus.CANCELLED].label,
        },
      ],
    },
    {
      name: "leave_type",
      label: "Leave Type",
      type: "select",
      placeholder: "All leave types",
      options: leaveTypes.map((type) => ({
        value: type.name,
        label: type.name,
      })),
    },
    {
      name: "date_range",
      label: "Date Range",
      type: "daterange",
      startDateName: "start_date",
      endDateName: "end_date",
    },
  ];

  const error = balancesError || requestsError;

  // Show full loading only on initial load when there's no data
  if (isLoadingBalances && !balancesData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-muted-foreground">Loading your leave information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load leave data. {(error as Error).message}
          <Button variant="outline" size="sm" onClick={handleRefresh} className="ml-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4">
            {userPublicId && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/leave-request-reviews")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {userPublicId ? `${viewingUserName}'s Leave Information` : "Leave Management"}
              </h2>
              <p className="text-gray-600">
                {userPublicId
                  ? "View leave balances and request history"
                  : "Manage your leave balances and requests"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {!userPublicId && (
            <Button onClick={handleApplyLeave}>
              <Plus className="mr-2 h-4 w-4" />
              Apply for Leave
            </Button>
          )}
        </div>
      </div>

      {/* Leave Balances Section */}
      {balances.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No leave balances allocated yet. Please contact your administrator.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Leave Balances</h3>

            {/* First Row: Summary Cards */}
            <div className="mb-4 flex gap-3 overflow-x-auto pb-2">
              {/* Total Available Balance Card */}
              {(() => {
                const totalAvailable = balances.reduce(
                  (sum, balance) => sum + (balance.available || 0),
                  0
                );
                return (
                  <div className="w-[140px] min-w-[140px] flex-shrink-0 rounded-lg border-2 border-emerald-300 bg-emerald-100 p-4">
                    <div className="flex flex-col gap-2">
                      <div className="text-4xl font-bold">{Math.floor(totalAvailable)}</div>
                      <div className="line-clamp-2 text-xs font-semibold">Total Available</div>
                    </div>
                  </div>
                );
              })()}

              {/* Total Used Balance Card */}
              {(() => {
                const totalUsed = balances.reduce(
                  (sum, balance) => sum + (Number(balance.used) || 0),
                  0
                );
                return (
                  <div className="w-[140px] min-w-[140px] flex-shrink-0 rounded-lg border-2 border-rose-300 bg-rose-100 p-4">
                    <div className="flex flex-col gap-2">
                      <div className="text-4xl font-bold">{Math.floor(totalUsed)}</div>
                      <div className="line-clamp-2 text-xs font-semibold">Total Used</div>
                    </div>
                  </div>
                );
              })()}

              {/* Pending Leave Card */}
              {(() => {
                const totalPending = balances.reduce((sum, balance) => {
                  // Use the pending field from API which calculates from DB
                  const pending = typeof balance.pending === "number" ? balance.pending : 0;
                  return sum + pending;
                }, 0);
                return (
                  <div className="w-[140px] min-w-[140px] flex-shrink-0 rounded-lg border-2 border-amber-300 bg-amber-100 p-4">
                    <div className="flex flex-col gap-2">
                      <div className="text-4xl font-bold">{Math.floor(totalPending)}</div>
                      <div className="line-clamp-2 text-xs font-semibold">Pending Leaves</div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Second Row: Individual Leave Type Cards */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {balances.map((balance, index) => {
                const total = balance.total_allocated || 0;
                const available = balance.available || 0;
                const used = balance.used || 0;
                const pending = balance.pending || 0;
                const leaveName = balance.leave_type_name || "Leave";

                // Cycle through background colors with border
                const cardStyles = [
                  {
                    bg: "bg-gradient-to-br from-teal-50 to-teal-100",
                    border: "border-teal-300",
                    text: "text-teal-800",
                    badge: "bg-teal-200/60",
                  },
                  {
                    bg: "bg-gradient-to-br from-blue-50 to-blue-100",
                    border: "border-indigo-300",
                    text: "text-blue-800",
                    badge: "bg-blue-200/60",
                  },
                  {
                    bg: "bg-gradient-to-br from-purple-50 to-purple-100",
                    border: "border-purple-300",
                    text: "text-purple-800",
                    badge: "bg-purple-200/60",
                  },
                  {
                    bg: "bg-gradient-to-br from-orange-50 to-orange-100",
                    border: "border-orange-300",
                    text: "text-orange-800",
                    badge: "bg-orange-200/60",
                  },
                ];
                const style = cardStyles[index % cardStyles.length];

                return (
                  <div
                    key={balance.public_id}
                    className={`${style.bg} rounded-xl border-2 p-4 ${style.border} w-[160px] min-w-[160px] flex-shrink-0 shadow-sm transition-shadow hover:shadow-md`}
                  >
                    <div className="flex flex-col gap-2">
                      {/* Leave Type Name */}
                      <div className={`text-xs font-bold ${style.text} mb-1 line-clamp-1`}>
                        {leaveName}
                      </div>

                      {/* Main Number with Breakdown */}
                      <div className="flex items-baseline gap-2">
                        <div className="text-3xl font-bold">{Math.floor(total)}</div>
                        <div className={`text-base font-semibold ${style.text}`}>
                          {Math.floor(available)}/{Math.floor(used)}/{Math.floor(pending)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Leave Requests Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Leave Requests</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4">
              <ResourceFilter
                fields={filterFields}
                onFilter={handleFilter}
                onReset={handleResetFilters}
                defaultValues={filters}
              />
            </div>
          )}
        </CardHeader>
        <CardContent>
          <DataTable
            columns={getLeaveRequestColumns({
              onView: handleViewRequest,
              onEdit: handleEditRequest,
              onDelete: handleDeleteRequest,
            })}
            data={requests}
            isLoading={isLoadingRequests}
            emptyMessage="No leave requests found. Click 'Apply for Leave' to create one."
            getRowKey={(request) => request.public_id}
            onRowClick={handleViewRequest}
          />

          {/* Pagination */}
          {pagination && (
            <TablePagination
              currentPage={pagination.current_page}
              totalPages={pagination.total_pages}
              totalRecords={pagination.count}
              pageSize={pagination.page_size}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </CardContent>
      </Card>

      {/* Cancel Dialog */}
      <CancelLeaveDialog
        request={cancelRequest}
        open={!!cancelRequest}
        onOpenChange={(open) => !open && setCancelRequest(null)}
      />
    </div>
  );
}
