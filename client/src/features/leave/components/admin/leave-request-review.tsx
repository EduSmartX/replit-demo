/**
 * Leave Request Review Component
 * For managers/admins to review and approve/reject leave requests
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle, RefreshCw, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ViewModeTabs } from "@/common/components";
import { SuccessDialog } from "@/common/components/dialogs";
import { ResourceFilter } from "@/common/components/filters/resource-filter";
import type { FilterField } from "@/common/components/filters/resource-filter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TablePagination } from "@/components/ui/table-pagination";
import { LeaveRequestStatus } from "@/features/leave/constants";
import { fetchClasses } from "@/lib/api/class-api";
import {
  fetchLeaveRequestReviews,
  approveLeaveRequest,
  rejectLeaveRequest,
  fetchLeaveTypes,
  fetchManageableUsersWithBalances,
  type LeaveRequest,
  type LeaveRequestReviewPayload,
} from "@/lib/api/leave-api";
import { getApiErrorMessage } from "@/lib/error-utils";
import { LeaveRequestReviewDialog } from "./leave-request-review-dialog";
import { getLeaveRequestReviewColumns } from "./leave-request-review-table-columns";
import { UserLeaveBalanceDialog } from "./user-leave-balance-dialog";

type ViewMode = "staff" | "student";

export function LeaveRequestReview() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>("staff");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [filters, setFilters] = useState<Record<string, string>>({
    status: LeaveRequestStatus.PENDING,
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [reviewDialog, setReviewDialog] = useState<{
    open: boolean;
    request: LeaveRequest | null;
    action: "approve" | "reject" | null;
  }>({
    open: false,
    request: null,
    action: null,
  });
  const [balanceDialog, setBalanceDialog] = useState<{
    open: boolean;
    userPublicId: string;
    userName: string;
  }>({
    open: false,
    userPublicId: "",
    userName: "",
  });
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: "", description: "" });

  // Reset filters to default when component mounts or view mode changes
  useEffect(() => {
    setFilters({ status: LeaveRequestStatus.PENDING });
    setPage(1);
  }, [viewMode]);

  // Fetch classes for student view
  const { data: classesData, isLoading: isLoadingClasses } = useQuery({
    queryKey: ["classes-for-leave-reviews"],
    queryFn: () => fetchClasses({ page: 1, page_size: 100, is_active: true }),
    enabled: viewMode === "student",
    staleTime: 300000,
  });

  const classes = classesData?.data || [];

  // Fetch leave types for filter
  const { data: leaveTypesData } = useQuery({
    queryKey: ["leave-types"],
    queryFn: fetchLeaveTypes,
    staleTime: 300000, // 5 minutes
  });

  const leaveTypes = leaveTypesData?.data || [];

  // Fetch manageable users for the dropdown
  const { data: usersData } = useQuery({
    queryKey: ["manageable-users", viewMode, selectedClassId],
    queryFn: () =>
      fetchManageableUsersWithBalances({
        role: viewMode,
        class_id: viewMode === "student" ? selectedClassId : undefined,
      }),
    enabled: viewMode === "staff" || (viewMode === "student" && !!selectedClassId),
    staleTime: 300000, // 5 minutes
  });

  const users = usersData?.data?.users || [];

  // Fetch leave request reviews
  const {
    data: requestsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["leave-request-reviews", viewMode, selectedClassId, filters, page, pageSize],
    queryFn: () =>
      fetchLeaveRequestReviews({
        role: viewMode,
        class_id: viewMode === "student" ? selectedClassId : undefined,
        page,
        page_size: pageSize,
        ...filters,
      }),
    enabled: viewMode === "staff" || (viewMode === "student" && !!selectedClassId),
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const requests = requestsData?.data || [];
  const totalCount = requestsData?.pagination?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: ({ publicId, payload }: { publicId: string; payload: LeaveRequestReviewPayload }) =>
      approveLeaveRequest(publicId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-request-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["leave-dashboard"] });
      setReviewDialog({ open: false, request: null, action: null });
      setSuccessMessage({
        title: "Leave Request Approved!",
        description: "The leave request has been approved successfully.",
      });
      setShowSuccessDialog(true);
    },
    onError: (error: Error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ publicId, payload }: { publicId: string; payload: LeaveRequestReviewPayload }) =>
      rejectLeaveRequest(publicId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-request-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["leave-dashboard"] });
      setReviewDialog({ open: false, request: null, action: null });
      setSuccessMessage({
        title: "Leave Request Rejected!",
        description: "The leave request has been rejected successfully.",
      });
      setShowSuccessDialog(true);
    },
    onError: (error: Error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const handleApprove = (request: LeaveRequest) => {
    setReviewDialog({ open: true, request, action: "approve" });
  };

  const handleReject = (request: LeaveRequest) => {
    setReviewDialog({ open: true, request, action: "reject" });
  };

  const handleSubmitReview = (comments: string) => {
    if (!reviewDialog.request || !reviewDialog.action) {
      return;
    }

    const payload: LeaveRequestReviewPayload = { comments };
    const publicId = reviewDialog.request.public_id;

    if (reviewDialog.action === "approve") {
      approveMutation.mutate({ publicId, payload });
    } else {
      rejectMutation.mutate({ publicId, payload });
    }
  };

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

  const handleViewModeChange = (value: ViewMode) => {
    setViewMode(value);
    setSelectedClassId(""); // Reset class selection when changing view mode
    setPage(1);
  };

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    setPage(1);
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
  };

  const handleViewUserBalance = (userPublicId: string, userName: string) => {
    setBalanceDialog({
      open: true,
      userPublicId,
      userName,
    });
  };

  const handleCloseBalanceDialog = () => {
    setBalanceDialog({
      open: false,
      userPublicId: "",
      userName: "",
    });
  };

  const columns = getLeaveRequestReviewColumns({
    onApprove: handleApprove,
    onReject: handleReject,
    onViewUserBalance: handleViewUserBalance,
  });

  // Filter fields configuration
  const filterFields: FilterField[] = [
    {
      name: "is_reviewed",
      label: "Review Status",
      type: "select",
      placeholder: "All Requests",
      searchPlaceholder: "Search review status...",
      options: [
        { value: "true", label: "Reviewed" },
        { value: "false", label: "Not Reviewed" },
      ],
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      placeholder: "All Statuses",
      searchPlaceholder: "Search status...",
      options: [
        { value: LeaveRequestStatus.PENDING, label: "Pending" },
        { value: LeaveRequestStatus.APPROVED, label: "Approved" },
        { value: LeaveRequestStatus.REJECTED, label: "Rejected" },
      ],
    },
    {
      name: "leave_type__name",
      label: "Leave Type",
      type: "select",
      placeholder: "All Leave Types",
      searchPlaceholder: "Search leave type...",
      options: leaveTypes.map((type) => ({
        value: type.name,
        label: `${type.name} (${type.code})`,
      })),
    },
    {
      name: "user",
      label: "Search User",
      type: "combobox",
      placeholder: "Select user",
      searchPlaceholder: "Search by name or email...",
      emptyText: "No users found.",
      options: users.map((user) => ({
        value: user.public_id,
        label: `${user.full_name} (${user.email})`,
      })),
    },
    {
      name: "start_date__gte",
      label: "From Date",
      type: "date",
      placeholder: "Select start date",
    },
    {
      name: "end_date__lte",
      label: "To Date",
      type: "date",
      placeholder: "Select end date",
    },
  ];

  // Show full-page loading only on initial load (no data yet)
  if (isLoading && !requestsData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-muted-foreground">Loading leave requests for review...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load leave requests. {(error as Error).message}
          <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-4">
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
          <h2 className="text-3xl font-bold text-gray-900">Leave Request Reviews</h2>
          <p className="text-gray-600">Review and approve/reject leave requests from your team</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Staff/Student Toggle */}
      <ViewModeTabs
        value={viewMode}
        onValueChange={(value) => handleViewModeChange(value as ViewMode)}
      />

      {/* Class Selection for Student View */}
      {viewMode === "student" && (
        <Card>
          <CardHeader>
            <CardTitle>Select Class</CardTitle>
            <CardDescription>
              Choose a class to view and review student leave requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingClasses && (
              <div className="flex items-center gap-2 py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-muted-foreground text-sm">Loading classes...</span>
              </div>
            )}
            {!isLoadingClasses && classes.length === 0 && (
              <Alert>
                <AlertDescription>
                  No active classes found. Please create classes first.
                </AlertDescription>
              </Alert>
            )}
            {!isLoadingClasses && classes.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="class-select">Class/Section</Label>
                <Select value={selectedClassId} onValueChange={handleClassChange}>
                  <SelectTrigger id="class-select" className="w-full max-w-md">
                    <SelectValue placeholder="Select a class to view student requests" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.public_id} value={cls.public_id}>
                        {cls.class_master.name} - {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Show filters and table only when class is selected for student view, or always for staff view */}
      {(viewMode === "staff" || (viewMode === "student" && selectedClassId)) && (
        <>
          {/* Filters */}
          <ResourceFilter
            fields={filterFields}
            onFilter={handleFilter}
            onReset={handleResetFilters}
            defaultValues={filters}
          />

          {/* Leave Requests Table */}
          <Card>
            <CardHeader>
              <CardTitle>Leave Requests</CardTitle>
              <CardDescription>
                {viewMode === "staff" ? "Staff" : "Student"} leave requests awaiting your review
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && requestsData && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="mr-2 h-6 w-6 animate-spin text-indigo-600" />
                  <span className="text-muted-foreground text-sm">Refreshing requests...</span>
                </div>
              )}
              {!isLoading && requests.length === 0 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    {filters.status === LeaveRequestStatus.PENDING || !filters.status
                      ? "No pending leave requests found to review."
                      : "No leave requests found matching the selected filters."}
                  </AlertDescription>
                </Alert>
              )}
              {!isLoading && requests.length > 0 && (
                <>
                  <DataTable
                    columns={columns}
                    data={requests}
                    isLoading={isLoading}
                    emptyMessage="No leave requests found"
                    getRowKey={(row: LeaveRequest) => row.public_id}
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
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Review Dialog */}
      <LeaveRequestReviewDialog
        open={reviewDialog.open}
        onOpenChange={(open: boolean) =>
          !open && setReviewDialog({ open: false, request: null, action: null })
        }
        request={reviewDialog.request}
        action={reviewDialog.action}
        onSubmit={handleSubmitReview}
        isSubmitting={approveMutation.isPending || rejectMutation.isPending}
      />

      {/* User Balance Dialog */}
      <UserLeaveBalanceDialog
        open={balanceDialog.open}
        onClose={handleCloseBalanceDialog}
        userPublicId={balanceDialog.userPublicId}
        userName={balanceDialog.userName}
      />

      {/* Success Dialog */}
      <SuccessDialog
        open={showSuccessDialog}
        onClose={handleSuccessDialogClose}
        title={successMessage.title}
        description={successMessage.description}
      />
    </div>
  );
}
