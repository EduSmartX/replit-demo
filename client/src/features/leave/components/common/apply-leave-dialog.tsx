/**
 * Apply Leave Dialog Component
 * Form dialog for creating/editing leave requests
 * Reusable across Admin, Teacher, and Student dashboards
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createLeaveRequest, updateLeaveRequest } from "@/lib/api/leave-api";
import type { LeaveBalance, LeaveRequest, LeaveRequestPayload } from "@/lib/api/leave-api";

const leaveRequestSchema = z.object({
  leave_balance: z.string().min(1, "Please select a leave type"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  is_half_day: z.boolean().default(false),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
  remarks: z.string().optional(),
});

type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>;

interface ApplyLeaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balances: LeaveBalance[];
  editData?: LeaveRequest | null;
}

export function ApplyLeaveDialog({
  open,
  onOpenChange,
  balances,
  editData,
}: ApplyLeaveDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LeaveRequestFormData>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      leave_balance: "",
      start_date: "",
      end_date: "",
      is_half_day: false,
      reason: "",
      remarks: "",
    },
  });

  useEffect(() => {
    if (editData && open) {
      form.reset({
        leave_balance: editData.leave_balance.public_id,
        start_date: editData.start_date,
        end_date: editData.end_date,
        is_half_day: editData.is_half_day,
        reason: editData.reason,
        remarks: editData.remarks || "",
      });
    } else if (!open) {
      form.reset();
    }
  }, [editData, open, form]);

  const createMutation = useMutation({
    mutationFn: createLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      toast({
        title: "Success!",
        description: "Leave request has been submitted successfully.",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit leave request",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { publicId: string; payload: Partial<LeaveRequestPayload> }) =>
      updateLeaveRequest(data.publicId, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      toast({
        title: "Success!",
        description: "Leave request has been updated successfully.",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update leave request",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: LeaveRequestFormData) => {
    setIsSubmitting(true);

    if (editData) {
      updateMutation.mutate({
        publicId: editData.public_id,
        payload: data,
      });
    } else {
      createMutation.mutate(data);
    }
  };

  // Filter available balances (those with available days)
  const availableBalances = balances.filter((b) => b.available > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit Leave Request" : "Apply for Leave"}</DialogTitle>
          <DialogDescription>
            {editData
              ? "Update your leave request details. Only pending requests can be edited."
              : "Fill in the details to apply for leave. Make sure you have sufficient leave balance."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="leave_balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leave Type *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!!editData}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableBalances.map((balance) => {
                        const leaveName =
                          balance.leave_allocation?.name ||
                          balance.leave_allocation?.leave_type?.name ||
                          "Leave";
                        return (
                          <SelectItem key={balance.public_id} value={balance.public_id}>
                            {leaveName} (Available: {balance.available} days)
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {availableBalances.length === 0
                      ? "No leave balances available"
                      : "Choose from your available leave types"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_half_day"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Half Day Leave</FormLabel>
                    <FormDescription>
                      Check this if you&apos;re applying for a half-day leave
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the reason for your leave (minimum 10 characters)"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Remarks (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional information"
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || availableBalances.length === 0}>
                {(() => {
                  if (isSubmitting) {
                    return (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editData ? "Updating..." : "Submitting..."}
                      </>
                    );
                  }
                  if (editData) {
                    return "Update Request";
                  }
                  return "Submit Request";
                })()}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
