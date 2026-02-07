/**
 * Manage Leave Balances Component
 * For managers/admins to create and modify leave balances for manageable users
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { ViewModeTabs } from "@/common/components";
import { SuccessDialog } from "@/common/components/dialogs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import type { Column } from "@/components/ui/data-table";
import { DataTable } from "@/components/ui/data-table";
import { Label } from "@/components/ui/label";
import { useUser } from "@/core/contexts";
import { fetchClasses } from "@/lib/api/class-api";
import {
  deleteLeaveBalance,
  fetchLeaveAllocationsForUser,
  fetchManageableUsersWithBalances,
  fetchUserLeaveBalances,
  type LeaveBalance,
} from "@/lib/api/leave-api";
import { getApiErrorMessage } from "@/lib/error-utils";
import { LeaveBalanceDialog } from "./leave-balance-dialog";

type ViewMode = "staff" | "student";

export function ManageLeaveBalances() {
  const { user: currentUser } = useUser();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>("staff");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [manageSelf, setManageSelf] = useState(false);
  const [balanceDialog, setBalanceDialog] = useState<{
    open: boolean;
    balance: LeaveBalance | null;
    mode: "create" | "edit";
  }>({
    open: false,
    balance: null,
    mode: "create",
  });
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: "", description: "" });
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState({ title: "", description: "" });

  // Fetch classes for student view
  const { data: classesData, isLoading: isLoadingClasses } = useQuery({
    queryKey: ["classes-for-leave-management"],
    queryFn: () => fetchClasses({ page: 1, page_size: 100, is_active: true }),
    enabled: viewMode === "student",
    staleTime: 300000,
  });

  // Fetch manageable users (without balances)
  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useQuery({
    queryKey: ["manageable-users", viewMode, selectedClassId],
    queryFn: () =>
      fetchManageableUsersWithBalances({
        role: viewMode,
        class_id: viewMode === "student" ? selectedClassId : undefined,
      }),
    enabled: !manageSelf && (viewMode === "staff" || (viewMode === "student" && !!selectedClassId)),
    staleTime: 30000,
  });

  // Use either the selected user ID or the current user's ID if managing self
  const effectiveUserId = manageSelf ? currentUser?.public_id || "" : selectedUserId;

  // Fetch selected user's leave balances
  const {
    data: userBalancesData,
    isLoading: isLoadingBalances,
    error: balancesError,
  } = useQuery({
    queryKey: ["user-leave-balances", effectiveUserId],
    queryFn: () => fetchUserLeaveBalances(effectiveUserId),
    enabled: !!effectiveUserId,
    staleTime: 30000,
  });

  // Fetch leave allocations for the selected user (filtered by role and gender on backend)
  // Only fetch when dialog is open to avoid unnecessary requests
  const { data: allocationsData, isLoading: isLoadingAllocations } = useQuery({
    queryKey: ["leave-allocations-for-user", effectiveUserId],
    queryFn: () => fetchLeaveAllocationsForUser(effectiveUserId),
    enabled: !!effectiveUserId,
    staleTime: 300000, // 5 minutes
  });

  const users = usersData?.data?.users || [];
  const userBalances = userBalancesData?.data?.balances || [];
  const selectedUser = userBalancesData?.data?.user;
  const allocations = allocationsData?.data || [];
  const classes = classesData?.data || [];

  // Get user details - either from selected user or current user if managing self
  const selectedUserDetails = (() => {
    if (manageSelf) {
      if (!currentUser) {
        return null;
      }
      return {
        public_id: currentUser.public_id,
        full_name: currentUser.full_name,
        email: currentUser.email,
        role: currentUser.role,
        role_display: currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1),
      };
    }
    return users.find((u) => u.public_id === selectedUserId);
  })();

  const existingAllocationIds = new Set(
    userBalances.map((balance) => balance.leave_allocation.public_id)
  );

  const availableAllocations = allocations.filter((allocation) => {
    return !existingAllocationIds.has(allocation.public_id);
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (publicId: string) => deleteLeaveBalance(publicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-leave-balances", effectiveUserId] });
      setSuccessMessage({
        title: "Leave Balance Deleted!",
        description: "The leave balance has been deleted successfully.",
      });
      setShowSuccessDialog(true);
    },
    onError: (error: Error) => {
      setErrorMessage({
        title: "Delete Failed",
        description: getApiErrorMessage(error),
      });
      setShowErrorDialog(true);
    },
  });

  const handleViewModeChange = (value: ViewMode) => {
    setViewMode(value);
    setSelectedClassId("");
    setSelectedUserId("");
    setManageSelf(false);
  };

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    setSelectedUserId("");
  };

  const handleUserChange = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleManageSelfChange = (checked: boolean) => {
    setManageSelf(checked);
    if (checked) {
      // Clear other selections when managing self
      setSelectedClassId("");
      setSelectedUserId("");
    }
  };

  const handleAddBalance = () => {
    if (!effectiveUserId) {
      setErrorMessage({
        title: "No User Selected",
        description: manageSelf
          ? "Unable to load your user information. Please refresh the page."
          : "Please select a user first before adding a leave balance.",
      });
      setShowErrorDialog(true);
      return;
    }

    // Wait for allocations to load before validating
    if (isLoadingAllocations) {
      setErrorMessage({
        title: "Loading",
        description: "Please wait while we load available leave types...",
      });
      setShowErrorDialog(true);
      return;
    }

    // Check if there are any available allocations
    if (availableAllocations.length === 0) {
      setErrorMessage({
        title: "No Available Leave Types",
        description:
          "No new leave allocations available for this user. All leave types have been assigned.",
      });
      setShowErrorDialog(true);
      return;
    }

    setBalanceDialog({
      open: true,
      balance: null,
      mode: "create",
    });
  };

  const handleEditBalance = (balance: LeaveBalance) => {
    setBalanceDialog({
      open: true,
      balance,
      mode: "edit",
    });
  };

  const handleDeleteBalance = (publicId: string) => {
    if (confirm("Are you sure you want to delete this leave balance?")) {
      deleteMutation.mutate(publicId);
    }
  };

  const handleDialogClose = () => {
    setBalanceDialog({
      open: false,
      balance: null,
      mode: "create",
    });
  };

  const handleDialogSuccess = () => {
    handleDialogClose();
    queryClient.invalidateQueries({ queryKey: ["user-leave-balances", effectiveUserId] });
    setSuccessMessage({
      title: balanceDialog.mode === "create" ? "Leave Balance Created!" : "Leave Balance Updated!",
      description: `The leave balance has been ${balanceDialog.mode === "create" ? "created" : "updated"} successfully.`,
    });
    setShowSuccessDialog(true);
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
  };

  const handleErrorDialogClose = () => {
    setShowErrorDialog(false);
  };

  // Define columns for the DataTable
  const leaveBalanceColumns: Column<LeaveBalance>[] = [
    {
      header: "Leave Type",
      accessor: (balance) => {
        const leaveName =
          balance.leave_allocation?.leave_type?.name ||
          balance.leave_allocation?.display_name ||
          balance.leave_allocation?.name ||
          "N/A";
        const leaveCode =
          balance.leave_allocation?.leave_type?.code ||
          balance.leave_allocation?.name ||
          (balance.leave_allocation?.display_name
            ? balance.leave_allocation.display_name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .toUpperCase()
                .slice(0, 5)
            : "N/A");

        return (
          <div>
            <div className="font-medium">{leaveName}</div>
            <Badge variant="outline" className="mt-1 text-xs">
              {leaveCode}
            </Badge>
          </div>
        );
      },
    },
    {
      header: "Allocated",
      accessor: (balance) => (
        <div className="text-center">
          <div className="text-lg font-semibold">{Number(balance.total_allocated).toFixed(1)}</div>
          <div className="text-muted-foreground text-xs">days</div>
        </div>
      ),
      width: 100,
    },
    {
      header: "Used",
      accessor: (balance) => (
        <div className="text-center">
          <div className="text-lg font-semibold text-red-600">
            {Number(balance.used).toFixed(1)}
          </div>
          <div className="text-muted-foreground text-xs">days</div>
        </div>
      ),
      width: 100,
    },
    {
      header: "Carried Forward",
      accessor: (balance) => (
        <div className="text-center">
          <div className="text-lg font-semibold text-green-600">
            {Number(balance.carried_forward).toFixed(1)}
          </div>
          <div className="text-muted-foreground text-xs">days</div>
        </div>
      ),
      width: 120,
    },
    {
      header: "Available",
      accessor: (balance) => {
        const available =
          Number(balance.total_allocated) + Number(balance.carried_forward) - Number(balance.used);
        return (
          <div className="text-center">
            <div className="text-lg font-semibold text-indigo-600">{available.toFixed(1)}</div>
            <div className="text-muted-foreground text-xs">days</div>
          </div>
        );
      },
      width: 100,
    },
    {
      header: "Actions",
      accessor: (balance) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => handleEditBalance(balance)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteBalance(balance.public_id)}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      width: 120,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Manage Leave Balances</h2>
          <p className="text-gray-600">Create and modify leave balances for your team members</p>
        </div>
      </div>

      {/* Manage Self Toggle */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="manage-self"
              checked={manageSelf}
              onCheckedChange={handleManageSelfChange}
            />
            <Label
              htmlFor="manage-self"
              className="cursor-pointer text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Manage my own leave balance
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* View Mode Toggle - only show when not managing self */}
      {!manageSelf && (
        <ViewModeTabs
          value={viewMode}
          onValueChange={(value) => handleViewModeChange(value as ViewMode)}
        />
      )}

      {/* User Selection - only show when not managing self */}
      {!manageSelf && (
        <Card>
          <CardHeader>
            <CardTitle>Select User</CardTitle>
            <CardDescription>
              Choose a {viewMode === "staff" ? "staff member" : "student"} to manage their leave
              balances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Class Selection for Students */}
              {viewMode === "student" && (
                <div className="flex-1">
                  <Label htmlFor="class-select">Select Class</Label>
                  {isLoadingClasses ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin text-indigo-600" />
                      <span className="text-muted-foreground text-sm">Loading classes...</span>
                    </div>
                  ) : (
                    <Combobox
                      options={classes.map((classItem) => ({
                        value: classItem.public_id,
                        label: `${classItem.class_master.name} (${classItem.name})`,
                      }))}
                      value={selectedClassId}
                      onValueChange={handleClassChange}
                      placeholder="Select a class"
                      searchPlaceholder="Search classes..."
                      emptyText="No classes found."
                      className="mt-2"
                    />
                  )}
                </div>
              )}

              {/* User Selection */}
              {(viewMode === "staff" || (viewMode === "student" && selectedClassId)) && (
                <>
                  {(() => {
                    if (isLoadingUsers) {
                      return (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="mr-2 h-6 w-6 animate-spin text-indigo-600" />
                          <span className="text-muted-foreground text-sm">Loading users...</span>
                        </div>
                      );
                    }
                    if (usersError) {
                      return (
                        <Alert variant="destructive">
                          <AlertDescription>{getApiErrorMessage(usersError)}</AlertDescription>
                        </Alert>
                      );
                    }
                    if (users.length === 0) {
                      return (
                        <Alert>
                          <AlertDescription>
                            No manageable {viewMode === "staff" ? "staff members" : "students"}{" "}
                            found
                            {viewMode === "student" ? " in this class" : ""}.
                          </AlertDescription>
                        </Alert>
                      );
                    }
                    return (
                      <div className="flex-1">
                        <Label htmlFor="user-select">Select User</Label>
                        <Combobox
                          options={users.map((user) => ({
                            value: user.public_id,
                            label:
                              viewMode === "student" && user.roll_number
                                ? `${user.full_name} (${user.roll_number})`
                                : `${user.full_name} (${user.email})`,
                          }))}
                          value={selectedUserId}
                          onValueChange={handleUserChange}
                          placeholder={`Select a ${viewMode === "staff" ? "staff member" : "student"}`}
                          searchPlaceholder="Search by name or email..."
                          emptyText="No users found."
                          className="mt-2"
                        />
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Info Card */}
      {effectiveUserId && selectedUserDetails && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg">User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="text-muted-foreground w-1/4 px-3 py-2 text-sm font-medium">
                      Name
                    </td>
                    <td className="px-3 py-2 text-base font-semibold">
                      {selectedUserDetails.full_name}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted-foreground w-1/4 px-3 py-2 text-sm font-medium">
                      Email
                    </td>
                    <td className="px-3 py-2 text-base">{selectedUserDetails.email}</td>
                  </tr>
                  {selectedUserDetails.employee_id && (
                    <tr>
                      <td className="text-muted-foreground w-1/4 px-3 py-2 text-sm font-medium">
                        Employee ID
                      </td>
                      <td className="px-3 py-2 text-base font-semibold">
                        {selectedUserDetails.employee_id}
                      </td>
                    </tr>
                  )}
                  {selectedUserDetails.organization_role && (
                    <tr>
                      <td className="text-muted-foreground w-1/4 px-3 py-2 text-sm font-medium">
                        Organization Role
                      </td>
                      <td className="px-3 py-2 text-base">
                        {selectedUserDetails.organization_role}
                      </td>
                    </tr>
                  )}
                  {selectedUserDetails.gender && (
                    <tr>
                      <td className="text-muted-foreground w-1/4 px-3 py-2 text-sm font-medium">
                        Gender
                      </td>
                      <td className="px-3 py-2 text-base">
                        {(() => {
                          if (selectedUserDetails.gender === "M") {
                            return "Male";
                          }
                          if (selectedUserDetails.gender === "F") {
                            return "Female";
                          }
                          return selectedUserDetails.gender;
                        })()}
                      </td>
                    </tr>
                  )}
                  {selectedUserDetails.subjects && selectedUserDetails.subjects.length > 0 && (
                    <tr>
                      <td className="text-muted-foreground w-1/4 px-3 py-2 text-sm font-medium">
                        Subjects
                      </td>
                      <td className="px-3 py-2 text-base">
                        {selectedUserDetails.subjects.join(", ")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leave Balances Display */}
      {effectiveUserId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Leave Balances</CardTitle>
                <CardDescription>
                  {isLoadingBalances
                    ? "Loading balances..."
                    : `${userBalances.length} leave type(s) configured`}
                </CardDescription>
              </div>
              <Button onClick={handleAddBalance}>
                <Plus className="mr-2 h-4 w-4" />
                Add Leave Balance
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {(() => {
              if (isLoadingBalances) {
                return (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="mr-2 h-6 w-6 animate-spin text-indigo-600" />
                    <span className="text-muted-foreground text-sm">Loading leave balances...</span>
                  </div>
                );
              }
              if (balancesError) {
                return (
                  <Alert variant="destructive">
                    <AlertDescription>{getApiErrorMessage(balancesError)}</AlertDescription>
                  </Alert>
                );
              }
              return (
                <DataTable
                  columns={leaveBalanceColumns}
                  data={userBalances}
                  isLoading={isLoadingBalances}
                  emptyMessage="No leave balances found. Click 'Add Leave Balance' to create one."
                  getRowKey={(balance) => balance.public_id}
                />
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Leave Balance Dialog */}
      <LeaveBalanceDialog
        open={balanceDialog.open}
        onClose={handleDialogClose}
        onSuccess={handleDialogSuccess}
        balance={balanceDialog.balance}
        mode={balanceDialog.mode}
        userPublicId={effectiveUserId}
        userName={
          manageSelf
            ? currentUser?.full_name || "You"
            : selectedUser?.name || selectedUserDetails?.full_name || ""
        }
        availableAllocations={availableAllocations}
        isLoadingAllocations={isLoadingAllocations}
      />

      {/* Success Dialog */}
      <SuccessDialog
        open={showSuccessDialog}
        onClose={handleSuccessDialogClose}
        title={successMessage.title}
        description={successMessage.description}
      />

      {/* Error Dialog */}
      <SuccessDialog
        open={showErrorDialog}
        onClose={handleErrorDialogClose}
        title={errorMessage.title}
        description={errorMessage.description}
      />
    </div>
  );
}
