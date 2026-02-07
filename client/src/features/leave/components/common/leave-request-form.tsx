/**
 * Leave Request Form Component
 * Form for creating/viewing/editing leave requests
 * Used as a standalone page instead of dialog
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft, Calendar, Clock, Loader2 } from "lucide-react";
import { useEffect, useRef, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import * as z from "zod";
import { SuccessDialog } from "@/common/components/dialogs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { LeaveRequestStatus } from "@/features/leave/constants";
import { useToast } from "@/hooks/use-toast";
import {
  calculateWorkingDays,
  createLeaveRequest,
  fetchLeaveRequestById,
  fetchMyLeaveBalances,
  updateLeaveRequest,
  type HolidayInfo,
  type LeaveRequestPayload,
} from "@/lib/api/leave-api";
import { getApiErrorMessage } from "@/lib/error-utils";
import { formatDate } from "@/lib/utils";

const leaveRequestSchema = z
  .object({
    leave_balance: z.string().min(1, "Please select a leave type"),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    is_half_day: z.boolean().default(false),
    number_of_days: z.number().min(0.5, "Number of days must be at least 0.5"),
    reason: z.string().min(1, "Reason is required"),
  })
  .refine(
    (data) => {
      const start = new Date(data.start_date);
      const end = new Date(data.end_date);
      return end >= start;
    },
    {
      message: "End date must be on or after start date",
      path: ["end_date"],
    }
  )
  .refine(
    (data) => {
      const start = new Date(data.start_date);
      const end = new Date(data.end_date);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    },
    {
      message: "Date range cannot exceed 30 days. Please submit separate leave requests.",
      path: ["end_date"],
    }
  );

type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>;

interface LeaveRequestFormProps {
  mode: "create" | "view" | "edit";
  publicId?: string;
}

export function LeaveRequestForm({ mode, publicId }: LeaveRequestFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: "", description: "" });
  const [holidays, setHolidays] = useState<HolidayInfo[]>([]);
  const [dateRangeError, setDateRangeError] = useState<string | null>(null);

  // Track initial form population to avoid unnecessary API calls in edit mode
  const isInitialMount = useRef(true);
  const initialDates = useRef<{ start: string; end: string } | null>(null);
  const formPopulated = useRef(false);

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  // Fetch leave balances
  const { data: balancesData, isLoading: isLoadingBalances } = useQuery({
    queryKey: ["leave-balances"],
    queryFn: fetchMyLeaveBalances,
  });

  // Fetch existing request if editing or viewing
  const { data: requestData, isLoading: isLoadingRequest } = useQuery({
    queryKey: ["leave-request", publicId],
    queryFn: () => fetchLeaveRequestById(publicId as string),
    enabled: !!publicId && (isViewMode || isEditMode),
  });

  const balances = useMemo(() => balancesData?.data || [], [balancesData]);
  const request = requestData?.data;

  const form = useForm<LeaveRequestFormData>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      leave_balance: "",
      start_date: "",
      end_date: "",
      is_half_day: false,
      number_of_days: 1,
      reason: "",
    },
  });

  useEffect(() => {
    if (request && (isViewMode || isEditMode) && balances.length > 0 && !formPopulated.current) {
      const isHalfDay = parseFloat(request.number_of_days) % 1 === 0.5;
      initialDates.current = {
        start: request.start_date,
        end: request.end_date,
      };

      form.reset({
        leave_balance: request.leave_balance_public_id,
        start_date: request.start_date,
        end_date: request.end_date,
        is_half_day: isHalfDay,
        number_of_days: parseFloat(request.number_of_days),
        reason: request.reason,
      });

      formPopulated.current = true;

      setTimeout(() => {
        isInitialMount.current = false;
      }, 100);
    }
  }, [request, isViewMode, isEditMode, form, balances]);

  // Auto-calculate number of days when dates or is_half_day changes
  const startDate = form.watch("start_date");
  const endDate = form.watch("end_date");
  const isHalfDay = form.watch("is_half_day");

  useEffect(() => {
    if (startDate && endDate) {
      // Skip API call in view mode - just display existing data
      if (isViewMode) {
        return;
      }

      // In edit mode, skip API call if dates haven't changed from initial values
      if (isEditMode && isInitialMount.current && initialDates.current) {
        if (startDate === initialDates.current.start && endDate === initialDates.current.end) {
          return;
        }
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      // Validate date range
      if (end < start) {
        setDateRangeError("End date must be on or after start date");
        setHolidays([]);
        form.setValue("number_of_days", 0);
        return;
      }

      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 30) {
        setDateRangeError(
          "Date range cannot exceed 30 days. Please submit separate leave requests."
        );
        setHolidays([]);
        form.setValue("number_of_days", 0);
        return;
      }

      setDateRangeError(null);

      // Calculate working days (backend returns error if conflicts exist)
      // In edit mode, exclude the current leave request from conflict check
      const payload: { start_date: string; end_date: string; exclude_leave_public_id?: string } = {
        start_date: startDate,
        end_date: endDate,
      };

      if (isEditMode && publicId) {
        payload.exclude_leave_public_id = publicId;
      }
      calculateWorkingDays(payload)
        .then((response) => {
          const workingDays = response.data.working_days;
          const apiHolidays = response.data.holidays || [];

          setHolidays(apiHolidays);
          setDateRangeError(null);

          // Check if all days are non-working
          const totalDays = diffDays + 1;
          const nonWorkingCount = apiHolidays.length;

          if (nonWorkingCount >= totalDays) {
            setDateRangeError(
              "No valid working days available in selected date range. All days are holidays or weekends."
            );
            form.setValue("number_of_days", 0);
          } else {
            const calculatedDays = isHalfDay ? workingDays - 0.5 : workingDays;
            form.setValue("number_of_days", calculatedDays);
          }
        })
        .catch((error) => {
          // Backend returns error for overlapping leaves with details
          let errorMessage = error.message || "Failed to validate dates. Please try again.";

          // Check if error has conflicting_leaves data
          if (
            error.data &&
            error.data.conflicting_leaves &&
            Array.isArray(error.data.conflicting_leaves)
          ) {
            const conflicts = error.data.conflicting_leaves;
            errorMessage = `${errorMessage}\n\nConflicting Leaves:\n${conflicts.map((leave: string) => `• ${leave}`).join("\n")}`;
          }

          setDateRangeError(errorMessage);
          setHolidays([]);
          form.setValue("number_of_days", 0);
        });
    } else {
      setHolidays([]);
      setDateRangeError(null);
    }
  }, [startDate, endDate, isHalfDay, form, isEditMode, isViewMode, publicId]);

  const createMutation = useMutation({
    mutationFn: createLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      setSuccessMessage({
        title: "Leave Request Submitted!",
        description: "Your leave request has been submitted successfully and is pending approval.",
      });
      setShowSuccessDialog(true);
    },
    onError: (error: unknown) => {
      const errorMessage = getApiErrorMessage(error);
      toast({
        title: "Failed to Submit Leave Request",
        description: errorMessage,
        variant: "destructive",
        style: { whiteSpace: "pre-line" },
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { publicId: string; payload: Partial<LeaveRequestPayload> }) =>
      updateLeaveRequest(data.publicId, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-balances"] });
      queryClient.invalidateQueries({ queryKey: ["leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["leave-request", publicId] });
      setSuccessMessage({
        title: "Leave Request Updated!",
        description: "Your leave request has been updated successfully.",
      });
      setShowSuccessDialog(true);
    },
    onError: (error: unknown) => {
      const errorMessage = getApiErrorMessage(error);
      toast({
        title: "Failed to Update Leave Request",
        description: errorMessage,
        variant: "destructive",
        style: { whiteSpace: "pre-line" },
      });
    },
  });

  const onSubmit = (data: LeaveRequestFormData) => {
    // Remove is_half_day from payload as it's only used for calculation
    const { is_half_day: _isHalfDay, ...payload } = data;

    if (isEditMode && publicId) {
      updateMutation.mutate({
        publicId,
        payload,
      });
    } else if (isCreateMode) {
      createMutation.mutate(payload);
    }
  };

  const handleBack = () => {
    navigate("/leave-requests");
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    navigate("/leave-requests");
  };

  const handleEdit = () => {
    if (publicId) {
      navigate(`/leave-requests/${publicId}/edit`);
    }
  };

  const isLoading = isLoadingBalances || (!!publicId && isLoadingRequest);
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const availableBalances =
    isEditMode || isViewMode ? balances : balances.filter((b) => b.available > 0);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { variant: "default" | "destructive" | "secondary"; className: string }
    > = {
      PENDING: { variant: "default", className: "bg-yellow-500" },
      APPROVED: { variant: "default", className: "bg-green-500" },
      REJECTED: { variant: "destructive", className: "" },
      CANCELLED: { variant: "secondary", className: "" },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <Badge variant={config.variant} className={config.className}>
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isCreateMode && "Apply for Leave"}
              {isViewMode && "Leave Request Details"}
              {isEditMode && "Edit Leave Request"}
            </h1>
            <p className="text-gray-600">
              {isCreateMode && "Fill in the details to apply for leave"}
              {isViewMode && "View complete information about this leave request"}
              {isEditMode && "Update your leave request details"}
            </p>
          </div>
        </div>
        {isViewMode && request?.status === LeaveRequestStatus.PENDING && (
          <Button onClick={handleEdit}>Edit Request</Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Leave Request Form</CardTitle>
              <CardDescription>
                {isCreateMode && "Make sure you have sufficient leave balance"}
                {isViewMode && "Review all request details below"}
                {isEditMode && "Only pending requests can be edited"}
              </CardDescription>
            </div>
            {request && <div>{getStatusBadge(request.status)}</div>}
          </div>
        </CardHeader>
        <CardContent>
          {isViewMode && request ? (
            // View Mode - Display only
            <div className="space-y-6">
              {/* Leave Type */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Leave Type</p>
                <p className="text-lg font-semibold">{request.leave_name}</p>
              </div>

              <Separator />

              {/* Date Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-muted-foreground flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">Start Date</span>
                  </div>
                  <p className="text-base">{formatDate(request.start_date)}</p>
                </div>
                <div className="space-y-2">
                  <div className="text-muted-foreground flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">End Date</span>
                  </div>
                  <p className="text-base">{formatDate(request.end_date)}</p>
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <div className="text-muted-foreground flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Duration</span>
                </div>
                <p className="text-base">
                  {request.number_of_days}{" "}
                  {parseFloat(request.number_of_days) === 1 ? "day" : "days"}
                </p>
              </div>

              <Separator />

              {/* Reason */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Reason</p>
                <p className="text-muted-foreground text-base whitespace-pre-wrap">
                  {request.reason}
                </p>
              </div>

              {/* Approval Info - Removed as fields don't exist in interface */}
            </div>
          ) : (
            // Create/Edit Mode - Form
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {isEditMode && request?.status !== LeaveRequestStatus.PENDING && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Only pending leave requests can be edited. This request is {request?.status}.
                    </AlertDescription>
                  </Alert>
                )}

                <FormField
                  control={form.control}
                  name="leave_balance"
                  render={({ field }) => {
                    const selectedBalance = isEditMode
                      ? availableBalances.find((b) => b.public_id === field.value)
                      : null;

                    const selectedLeaveName = selectedBalance
                      ? selectedBalance.leave_allocation?.display_name ||
                        selectedBalance.leave_allocation?.name ||
                        selectedBalance.leave_allocation?.leave_type?.name ||
                        "Leave"
                      : null;

                    return (
                      <FormItem>
                        <FormLabel>Leave Type *</FormLabel>
                        {isEditMode && selectedLeaveName ? (
                          // In edit mode, show as read-only with hidden input
                          <>
                            <div className="border-input bg-muted flex h-10 w-full rounded-md border px-3 py-2 text-sm">
                              {selectedLeaveName} (Available: {selectedBalance?.available} days)
                            </div>
                            <input type="hidden" {...field} />
                          </>
                        ) : (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select leave type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableBalances.map((balance) => {
                                const leaveName =
                                  balance.leave_allocation?.display_name ||
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
                        )}
                        <FormDescription>
                          {availableBalances.length === 0
                            ? "No leave balances available"
                            : "Choose from your available leave types"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
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

                {/* Date Range Error Alert */}
                {dateRangeError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="whitespace-pre-line">
                      {dateRangeError}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Holidays Table - Show if there are holidays */}
                {holidays.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Holidays & Non-Working Days</p>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Type</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {holidays.map((holiday, index) => {
                            const isWeekend = holiday.type === "WEEKEND";

                            return (
                              <TableRow key={`${holiday.date}-${index}`}>
                                <TableCell className="font-medium">
                                  {new Date(holiday.date).toLocaleDateString("en-US", {
                                    weekday: "short",
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </TableCell>
                                <TableCell>{holiday.description}</TableCell>
                                <TableCell>
                                  <Badge variant={isWeekend ? "secondary" : "default"}>
                                    {holiday.type}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

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
                          Check this to reduce 0.5 days from the total
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="number_of_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Days *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          min="0.5"
                          disabled
                          {...field}
                          value={field.value}
                        />
                      </FormControl>
                      <FormDescription>
                        Automatically calculated based on dates and half-day selection
                      </FormDescription>
                      <FormMessage />
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

                <div className="flex flex-wrap justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      availableBalances.length === 0 ||
                      (dateRangeError !== null && !dateRangeError.startsWith("Warning")) ||
                      form.watch("number_of_days") <= 0
                    }
                  >
                    {isSubmitting && (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isEditMode ? "Updating..." : "Submitting..."}
                      </>
                    )}
                    {!isSubmitting && isEditMode && "Update Request"}
                    {!isSubmitting && !isEditMode && "Submit Request"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>

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
