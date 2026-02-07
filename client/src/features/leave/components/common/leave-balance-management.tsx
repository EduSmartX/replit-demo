/**
 * Leave Balance Management Component
 * Manage leave balances for users (view, create, edit, delete)
 * Reusable across Admin and Teacher dashboards
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, RefreshCw, AlertCircle, Trash2, Edit, Loader2, MoreVertical } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { fetchMyLeaveBalances, deleteLeaveBalance } from "@/lib/api/leave-api";
import type { LeaveBalance } from "@/lib/api/leave-api";
import { LeaveBalanceFormDialog } from "./leave-balance-form-dialog";

export function LeaveBalanceManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editBalance, setEditBalance] = useState<LeaveBalance | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; balance: LeaveBalance | null }>(
    {
      open: false,
      balance: null,
    }
  );

  // Fetch balances
  const {
    data: balancesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["leave-balances"],
    queryFn: () => fetchMyLeaveBalances(),
    staleTime: 30000,
  });

  const deleteMutation = useMutation({
    mutationFn: (publicId: string) => deleteLeaveBalance(publicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
      queryClient.invalidateQueries({ queryKey: ["leave-dashboard"] });
      toast({
        title: "Leave Balance Deleted",
        description: "The leave balance has been deleted successfully.",
      });
      setDeleteDialog({ open: false, balance: null });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete leave balance",
        variant: "destructive",
      });
    },
  });

  const handleCreateBalance = () => {
    setEditBalance(null);
    setFormDialogOpen(true);
  };

  const handleEditBalance = (balance: LeaveBalance) => {
    setEditBalance(balance);
    setFormDialogOpen(true);
  };

  const handleDeleteBalance = (balance: LeaveBalance) => {
    setDeleteDialog({ open: true, balance });
  };

  const confirmDelete = () => {
    if (deleteDialog.balance) {
      deleteMutation.mutate(deleteDialog.balance.public_id);
    }
  };

  const balances = balancesData?.data || [];

  // Show full-page loading only on initial load (no data yet)
  if (isLoading && !balancesData) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-muted-foreground">Loading leave balances...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load leave balances. {(error as Error).message}
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
          <h2 className="text-3xl font-bold text-gray-900">Leave Balance Management</h2>
          <p className="text-gray-600">Manage leave balances for yourself and others</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleCreateBalance}>
            <Plus className="mr-2 h-4 w-4" />
            Create Leave Balance
          </Button>
        </div>
      </div>

      {/* Leave Balances Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Balances</CardTitle>
          <CardDescription>View and manage all leave balances</CardDescription>
        </CardHeader>
        <CardContent>
          {(() => {
            if (isLoading && balancesData) {
              return (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="mr-2 h-6 w-6 animate-spin text-indigo-600" />
                  <span className="text-muted-foreground text-sm">Refreshing balances...</span>
                </div>
              );
            }
            if (!isLoading && balances.length === 0) {
              return (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No leave balances found. Click &quot;Create Leave Balance&quot; to add one.
                  </AlertDescription>
                </Alert>
              );
            }
            if (!isLoading) {
              return (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Leave Type</TableHead>
                        <TableHead className="text-center">Total Allocated</TableHead>
                        <TableHead className="text-center">Used</TableHead>
                        <TableHead className="text-center">Available</TableHead>
                        <TableHead className="text-center">Carried Forward</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {balances.map((balance) => (
                        <TableRow key={balance.public_id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{balance.user.full_name}</div>
                              <div className="text-muted-foreground text-xs">
                                {balance.user.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {balance.leave_allocation.name ||
                                balance.leave_allocation.leave_type.name}
                            </div>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {balance.leave_allocation.leave_type.code}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center font-semibold text-indigo-600">
                            {balance.total_allocated}
                          </TableCell>
                          <TableCell className="text-center font-semibold text-red-600">
                            {balance.used}
                          </TableCell>
                          <TableCell className="text-center font-semibold text-green-600">
                            {balance.available}
                          </TableCell>
                          <TableCell className="text-center">
                            {balance.carried_forward > 0 ? (
                              <Badge variant="secondary">{balance.carried_forward}</Badge>
                            ) : (
                              <span className="text-muted-foreground">0</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={balance.available > 0 ? "default" : "secondary"}
                              className={balance.available > 0 ? "bg-green-500" : ""}
                            >
                              {balance.available > 0 ? "Active" : "Exhausted"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditBalance(balance)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteBalance(balance)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              );
            }
            return null;
          })()}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <LeaveBalanceFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        editData={editBalance}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => !open && setDeleteDialog({ open: false, balance: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Leave Balance</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this leave balance? This action cannot be undone.
              {deleteDialog.balance && (
                <div className="bg-muted mt-4 space-y-1 rounded-md p-3 text-sm">
                  <div>
                    <span className="font-medium">User:</span> {deleteDialog.balance.user.full_name}
                  </div>
                  <div>
                    <span className="font-medium">Leave Type:</span>{" "}
                    {deleteDialog.balance.leave_allocation.name ||
                      deleteDialog.balance.leave_allocation.leave_type.name}
                  </div>
                  <div>
                    <span className="font-medium">Available:</span> {deleteDialog.balance.available}{" "}
                    days
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
