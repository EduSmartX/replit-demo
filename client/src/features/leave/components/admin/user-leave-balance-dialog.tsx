/**
 * User Leave Balance Dialog
 * Shows leave balance information and leave request history for a specific user
 */

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import type { Column } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  fetchUserLeaveBalancesSummary,
  fetchUserLeaveRequests,
  type LeaveRequest,
} from "@/lib/api/leave-api";
import { getApiErrorMessage } from "@/lib/error-utils";

interface UserLeaveBalanceDialogProps {
  open: boolean;
  onClose: () => void;
  userPublicId: string;
  userName: string;
}

export function UserLeaveBalanceDialog({
  open,
  onClose,
  userPublicId,
  userName,
}: UserLeaveBalanceDialogProps) {
  const [activeTab, setActiveTab] = useState("balances");

  const {
    data: balancesData,
    isLoading: isLoadingBalances,
    error: balancesError,
  } = useQuery({
    queryKey: ["user-leave-balances-summary", userPublicId],
    queryFn: () => fetchUserLeaveBalancesSummary(userPublicId),
    enabled: open && !!userPublicId,
    staleTime: 30000, // 30 seconds
  });

  const {
    data: requestsData,
    isLoading: isLoadingRequests,
    error: requestsError,
  } = useQuery({
    queryKey: ["user-leave-requests", userPublicId],
    queryFn: () => fetchUserLeaveRequests(userPublicId, { page: 1, page_size: 50 }),
    enabled: open && !!userPublicId,
    staleTime: 30000, // 30 seconds
  });

  const balances = balancesData?.data || [];
  const requests = requestsData?.data || [];

  // Define columns for leave requests table
  const requestColumns: Column<LeaveRequest>[] = [
    {
      header: "Leave Type",
      accessor: (request) => (
        <div>
          <div className="font-medium">{request.leave_name}</div>
          <Badge variant="outline" className="mt-1">
            {request.leave_type_code}
          </Badge>
        </div>
      ),
    },
    {
      header: "Duration",
      accessor: (request) => (
        <div className="text-sm">
          <div>
            {format(new Date(request.start_date), "MMM dd, yyyy")} -{" "}
            {format(new Date(request.end_date), "MMM dd, yyyy")}
          </div>
          <div className="text-muted-foreground mt-1 text-xs">
            ({parseFloat(request.number_of_days).toFixed(1)}{" "}
            {parseFloat(request.number_of_days) === 1 ? "day" : "days"})
          </div>
        </div>
      ),
      width: 220,
    },
    {
      header: "Status",
      accessor: (request) => {
        const statusConfig: Record<
          string,
          { variant: "default" | "destructive" | "secondary"; className: string }
        > = {
          pending: { variant: "default", className: "bg-yellow-500 hover:bg-yellow-600" },
          approved: { variant: "default", className: "bg-green-500 hover:bg-green-600" },
          rejected: { variant: "destructive", className: "" },
          cancelled: { variant: "secondary", className: "" },
        };

        const config = statusConfig[request.status] || statusConfig.pending;

        return (
          <Badge variant={config.variant} className={config.className}>
            {request.status.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      header: "Applied",
      accessor: (request) => (
        <div className="text-sm">{format(new Date(request.applied_at), "MMM dd, yyyy")}</div>
      ),
    },
  ];

  // Calculate totals
  const totalAvailable = balances.reduce(
    (sum, balance) =>
      sum +
      (Number(balance.total_allocated) + Number(balance.carried_forward) - Number(balance.used)),
    0
  );
  const totalUsed = balances.reduce((sum, balance) => sum + Number(balance.used), 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[85vh] max-w-4xl flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{userName}&apos;s Leave Information</span>
          </DialogTitle>
          <DialogDescription>View leave balances and request history</DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex min-h-0 flex-1 flex-col"
        >
          <TabsList className="grid w-full flex-shrink-0 grid-cols-2">
            <TabsTrigger value="balances">Leave Balances</TabsTrigger>
            <TabsTrigger value="requests">Leave Requests</TabsTrigger>
          </TabsList>

          {/* Leave Balances Tab */}
          <TabsContent value="balances" className="mt-4 min-h-0 flex-1 overflow-y-auto">
            {isLoadingBalances && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            )}

            {balancesError && (
              <Alert variant="destructive">
                <AlertDescription>{getApiErrorMessage(balancesError)}</AlertDescription>
              </Alert>
            )}

            {!isLoadingBalances && !balancesError && balances.length === 0 && (
              <Alert>
                <AlertDescription>No leave balances found for this user.</AlertDescription>
              </Alert>
            )}

            {!isLoadingBalances && !balancesError && balances.length > 0 && (
              <div className="space-y-6 pb-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <div className="text-muted-foreground text-sm">Total Available</div>
                    <div className="text-3xl font-bold text-green-700">
                      {totalAvailable.toFixed(1)}
                    </div>
                  </div>
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <div className="text-muted-foreground text-sm">Total Used</div>
                    <div className="text-3xl font-bold text-red-700">{totalUsed.toFixed(1)}</div>
                  </div>
                </div>

                {/* Leave Balance Details */}
                <div className="space-y-3">
                  <h4 className="text-muted-foreground text-sm font-semibold">
                    Leave Type Breakdown
                  </h4>
                  {balances.map((balance) => {
                    const available =
                      Number(balance.total_allocated) +
                      Number(balance.carried_forward) -
                      Number(balance.used);
                    return (
                      <div
                        key={balance.public_id}
                        className="rounded-lg border p-4 transition-colors hover:border-indigo-300"
                      >
                        <div className="mb-3 flex items-start justify-between">
                          <div>
                            <div className="text-base font-medium">{balance.leave_type_name}</div>
                            <Badge variant="outline" className="mt-1">
                              {balance.leave_type_code}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-indigo-600">
                              {available.toFixed(1)}
                            </div>
                            <div className="text-muted-foreground text-xs">Available</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Allocated</div>
                            <div className="font-medium">
                              {Number(balance.total_allocated).toFixed(1)}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Used</div>
                            <div className="font-medium text-red-600">
                              {Number(balance.used).toFixed(1)}
                            </div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Carried Forward</div>
                            <div className="font-medium text-green-600">
                              {Number(balance.carried_forward).toFixed(1)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Leave Requests Tab */}
          <TabsContent value="requests" className="mt-4 min-h-0 flex-1 overflow-y-auto">
            {isLoadingRequests && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            )}

            {requestsError && (
              <Alert variant="destructive">
                <AlertDescription>{getApiErrorMessage(requestsError)}</AlertDescription>
              </Alert>
            )}

            {!isLoadingRequests && !requestsError && requests.length === 0 && (
              <Alert>
                <AlertDescription>No leave requests found for this user.</AlertDescription>
              </Alert>
            )}

            {!isLoadingRequests && !requestsError && requests.length > 0 && (
              <div className="space-y-4 pb-4">
                <div className="text-muted-foreground text-sm">
                  Showing {requests.length} leave request(s)
                </div>
                <DataTable
                  columns={requestColumns}
                  data={requests}
                  isLoading={isLoadingRequests}
                  emptyMessage="No leave requests found"
                  getRowKey={(row: LeaveRequest) => row.public_id}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex flex-shrink-0 justify-end border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
