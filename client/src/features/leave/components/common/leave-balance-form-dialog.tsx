/**
 * Leave Balance Form Dialog Component
 * Form dialog for creating/editing leave balances for users
 * Reusable across Admin and Teacher dashboards
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  createLeaveBalance,
  updateLeaveBalance,
  fetchLeaveAllocations,
  fetchManageableUsers,
} from "@/lib/api/leave-api";
import type { LeaveBalance, LeaveBalancePayload } from "@/lib/api/leave-api";

const leaveBalanceSchema = z.object({
  user: z.string().min(1, "Please select a user"),
  leave_allocation: z.string().min(1, "Please select a leave allocation"),
  total_allocated: z.string().optional(),
  carried_forward: z.string().optional(),
});

type LeaveBalanceFormData = z.infer<typeof leaveBalanceSchema>;

interface LeaveBalanceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: LeaveBalance | null;
  preSelectedUser?: string; // public_id
}

export function LeaveBalanceFormDialog({
  open,
  onOpenChange,
  editData,
  preSelectedUser,
}: LeaveBalanceFormDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LeaveBalanceFormData>({
    resolver: zodResolver(leaveBalanceSchema),
    defaultValues: {
      user: preSelectedUser || "",
      leave_allocation: "",
      total_allocated: "",
      carried_forward: "0",
    },
  });

  // Fetch users
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["manageable-users"],
    queryFn: () => fetchManageableUsers(),
    enabled: open && !editData,
  });

  // Fetch leave allocations
  const { data: allocationsData, isLoading: isLoadingAllocations } = useQuery({
    queryKey: ["leave-allocations-all"],
    queryFn: () => fetchLeaveAllocations({ page_size: 100 }),
    enabled: open,
  });

  useEffect(() => {
    if (editData && open) {
      form.reset({
        user: editData.user.public_id,
        leave_allocation: editData.leave_allocation.public_id,
        total_allocated: editData.total_allocated.toString(),
        carried_forward: editData.carried_forward.toString(),
      });
    } else if (!open) {
      form.reset({
        user: preSelectedUser || "",
        leave_allocation: "",
        total_allocated: "",
        carried_forward: "0",
      });
    }
  }, [editData, open, form, preSelectedUser]);

  const createMutation = useMutation({
    mutationFn: createLeaveBalance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
      toast({
        title: "Success!",
        description: "Leave balance has been created successfully.",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create leave balance",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: {
      publicId: string;
      payload: { total_allocated?: number; carried_forward?: number };
    }) => updateLeaveBalance(data.publicId, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
      toast({
        title: "Success!",
        description: "Leave balance has been updated successfully.",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update leave balance",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: LeaveBalanceFormData) => {
    setIsSubmitting(true);

    if (editData) {
      updateMutation.mutate({
        publicId: editData.public_id,
        payload: {
          total_allocated: data.total_allocated ? parseFloat(data.total_allocated) : undefined,
          carried_forward: data.carried_forward ? parseFloat(data.carried_forward) : undefined,
        },
      });
    } else {
      const payload: LeaveBalancePayload = {
        user: data.user,
        leave_allocation: data.leave_allocation,
      };

      if (data.total_allocated) {
        payload.total_allocated = parseFloat(data.total_allocated);
      }
      if (data.carried_forward) {
        payload.carried_forward = parseFloat(data.carried_forward);
      }

      createMutation.mutate(payload);
    }
  };

  const users = usersData?.data || [];
  const allocations = allocationsData?.data || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit Leave Balance" : "Create Leave Balance"}</DialogTitle>
          <DialogDescription>
            {editData
              ? "Update the leave balance details for this user."
              : "Assign a leave balance to a user. Select the user and leave type."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="user"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!!editData || !!preSelectedUser || isLoadingUsers}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(() => {
                        if (isLoadingUsers) {
                          return (
                            <SelectItem value="loading" disabled>
                              Loading users...
                            </SelectItem>
                          );
                        }
                        if (users.length === 0) {
                          return (
                            <SelectItem value="no-users" disabled>
                              No users available
                            </SelectItem>
                          );
                        }
                        return users.map((user) => (
                          <SelectItem key={user.public_id} value={user.public_id}>
                            {user.full_name} ({user.email})
                          </SelectItem>
                        ));
                      })()}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {editData
                      ? "User cannot be changed after creation"
                      : "Select the user to assign leave balance"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="leave_allocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leave Type *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!!editData || isLoadingAllocations}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave allocation" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(() => {
                        if (isLoadingAllocations) {
                          return (
                            <SelectItem value="loading" disabled>
                              Loading allocations...
                            </SelectItem>
                          );
                        }
                        if (allocations.length === 0) {
                          return (
                            <SelectItem value="no-allocations" disabled>
                              No leave allocations available
                            </SelectItem>
                          );
                        }
                        return allocations.map((allocation) => (
                          <SelectItem key={allocation.public_id} value={allocation.public_id}>
                            {allocation.name || allocation.leave_type_name} ({allocation.total_days}{" "}
                            days)
                          </SelectItem>
                        ));
                      })()}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {editData
                      ? "Leave type cannot be changed after creation"
                      : "Choose from available leave allocations"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="total_allocated"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Allocated Days</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        placeholder="Auto from allocation"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Leave empty to use allocation default
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="carried_forward"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carried Forward Days</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.5" min="0" placeholder="0" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">Previous year balance</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || allocations.length === 0}>
                {(() => {
                  if (isSubmitting) {
                    return (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editData ? "Updating..." : "Creating..."}
                      </>
                    );
                  }
                  if (editData) {
                    return "Update Balance";
                  }
                  return "Create Balance";
                })()}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
