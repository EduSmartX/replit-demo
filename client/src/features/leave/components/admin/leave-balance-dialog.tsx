/**
 * Leave Balance Dialog
 * Dialog for creating or editing leave balances
 */

import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createLeaveBalance,
  updateLeaveBalance,
  type LeaveBalance,
  type LeaveAllocation,
  type CreateLeaveBalancePayload,
  type UpdateLeaveBalancePayload,
} from "@/lib/api/leave-api";
import { getApiErrorMessage } from "@/lib/error-utils";

interface LeaveBalanceDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  balance: LeaveBalance | null;
  mode: "create" | "edit";
  userPublicId: string;
  userName: string;
  availableAllocations: LeaveAllocation[];
  isLoadingAllocations: boolean;
}

interface FormData {
  leave_allocation: string;
  total_allocated: string;
  carried_forward: string;
}

export function LeaveBalanceDialog({
  open,
  onClose,
  onSuccess,
  balance,
  mode,
  userPublicId,
  userName,
  availableAllocations,
  isLoadingAllocations,
}: LeaveBalanceDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    defaultValues: {
      leave_allocation: balance?.leave_allocation?.public_id || "",
      total_allocated: balance?.total_allocated?.toString() || "",
      carried_forward: balance?.carried_forward?.toString() || "0",
    },
  });

  const selectedAllocation = watch("leave_allocation");

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateLeaveBalancePayload) => createLeaveBalance(data),
    onSuccess: () => {
      onSuccess();
      reset();
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ publicId, data }: { publicId: string; data: UpdateLeaveBalancePayload }) =>
      updateLeaveBalance(publicId, data),
    onSuccess: () => {
      onSuccess();
      reset();
    },
  });

  // Reset form when dialog opens or balance changes
  useEffect(() => {
    if (open) {
      reset({
        leave_allocation: balance?.leave_allocation?.public_id || "",
        total_allocated: balance?.total_allocated?.toString() || "",
        carried_forward: balance?.carried_forward?.toString() || "0",
      });
      // Reset mutation states when dialog opens
      createMutation.reset();
      updateMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, balance]);

  const onSubmit = (data: FormData) => {
    if (mode === "create") {
      const payload: CreateLeaveBalancePayload = {
        user: userPublicId,
        leave_allocation: data.leave_allocation,
        total_allocated: parseFloat(data.total_allocated),
        carried_forward: parseFloat(data.carried_forward) || 0,
      };
      createMutation.mutate(payload);
    } else if (balance) {
      const payload: UpdateLeaveBalancePayload = {
        total_allocated: parseFloat(data.total_allocated),
        carried_forward: parseFloat(data.carried_forward) || 0,
      };
      updateMutation.mutate({ publicId: balance.public_id, data: payload });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  // Get allocation details to pre-fill total_allocated
  const handleAllocationChange = (allocationId: string) => {
    setValue("leave_allocation", allocationId);
    const allocation = availableAllocations.find((a) => a.public_id === allocationId);
    if (allocation && mode === "create") {
      setValue("total_allocated", allocation.total_days.toString());
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add" : "Edit"} Leave Balance</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Create a new" : "Modify"} leave balance for {userName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Leave Allocation Selection */}
          {mode === "create" && (
            <div className="space-y-2">
              <Label htmlFor="leave_allocation">
                Leave Type <span className="text-red-500">*</span>
              </Label>
              {isLoadingAllocations && (
                <div className="flex items-center gap-2 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-muted-foreground text-sm">Loading leave types...</span>
                </div>
              )}
              {!isLoadingAllocations && availableAllocations.length === 0 && (
                <Alert>
                  <AlertDescription>
                    No available leave types. All allocations have been assigned to this user.
                  </AlertDescription>
                </Alert>
              )}
              {!isLoadingAllocations && availableAllocations.length > 0 && (
                <>
                  <Combobox
                    options={availableAllocations.map((allocation) => ({
                      value: allocation.public_id,
                      label: `${allocation.leave_type_name} (${allocation.total_days} days)`,
                    }))}
                    value={selectedAllocation}
                    onValueChange={handleAllocationChange}
                    placeholder="Select leave type"
                    searchPlaceholder="Search leave types..."
                    emptyText="No leave types found."
                  />
                  {errors.leave_allocation && (
                    <p className="text-sm text-red-500">{errors.leave_allocation.message}</p>
                  )}
                </>
              )}
            </div>
          )}

          {/* Show current leave type for edit mode */}
          {mode === "edit" && balance && (
            <div className="space-y-2">
              <Label>Leave Type</Label>
              <div className="bg-muted rounded-md border p-3">
                <div className="font-medium">{balance.leave_allocation.leave_type.name}</div>
                <div className="text-muted-foreground text-sm">
                  {balance.leave_allocation.leave_type.code}
                </div>
              </div>
            </div>
          )}

          {/* Total Allocated */}
          <div className="space-y-2">
            <Label htmlFor="total_allocated">
              Total Allocated Days <span className="text-red-500">*</span>
            </Label>
            <Input
              id="total_allocated"
              type="number"
              step="0.5"
              min="0"
              placeholder="Enter total allocated days"
              {...register("total_allocated", {
                required: "Total allocated days is required",
                min: { value: 0, message: "Must be at least 0" },
              })}
            />
            {errors.total_allocated && (
              <p className="text-sm text-red-500">{errors.total_allocated.message}</p>
            )}
          </div>

          {/* Carried Forward */}
          <div className="space-y-2">
            <Label htmlFor="carried_forward">Carried Forward Days</Label>
            <Input
              id="carried_forward"
              type="number"
              step="0.5"
              min="0"
              placeholder="Enter carried forward days (default: 0)"
              {...register("carried_forward", {
                min: { value: 0, message: "Must be at least 0" },
              })}
            />
            {errors.carried_forward && (
              <p className="text-sm text-red-500">{errors.carried_forward.message}</p>
            )}
          </div>

          {/* Show used days for edit mode */}
          {mode === "edit" && balance && (
            <div className="space-y-2">
              <Label>Used Days</Label>
              <div className="bg-muted rounded-md border p-3">
                <div className="font-medium">{Number(balance.used).toFixed(1)} days</div>
                <div className="text-muted-foreground text-sm">Cannot be modified</div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{getApiErrorMessage(error)}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || (mode === "create" && availableAllocations.length === 0)}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Create" : "Update"} Balance
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
