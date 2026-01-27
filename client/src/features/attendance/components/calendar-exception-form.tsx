/**
 * Calendar Exception Form Component
 * Full-page form for creating, editing, or viewing calendar exceptions
 * Supports multiple modes: create, edit, view
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, isWithinInterval, parseISO } from "date-fns";
import { ArrowLeft, Calendar as CalendarIcon, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { SuccessDialog } from "@/common/components/dialogs";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createCalendarException, fetchCalendarException, updateCalendarException } from "@/lib/api/calendar-exception-api";
import type { CalendarExceptionCreate, CalendarExceptionUpdate } from "@/lib/api/calendar-exception-types";
import { fetchClasses, type MasterClass } from "@/lib/api/class-api";
import { fetchHolidayCalendar, fetchWorkingDayPolicy } from "@/lib/api/holiday-api";
import { getShortErrorMessage } from "@/lib/error-utils";
import { cn } from "@/lib/utils";

const exceptionSchema = z.object({
  id: z.string(),
  date: z.date({
    required_error: "Date is required",
  }),
  override_type: z.enum(["FORCE_WORKING", "FORCE_HOLIDAY"], {
    required_error: "Override type is required",
  }),
  is_applicable_to_all_classes: z.boolean().default(false),
  selected_classes: z.array(z.string()).default([]),
  reason: z.string().min(1, "Reason is required").max(500, "Reason too long"),
  isExpanded: z.boolean().default(true),
});

type ExceptionFormData = z.infer<typeof exceptionSchema>;

interface CalendarExceptionFormProps {
  publicId?: string;
  mode?: "create" | "edit" | "view";
}

export function CalendarExceptionForm({ publicId, mode = "create" }: CalendarExceptionFormProps = {}) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = mode === "edit";
  const isViewMode = mode === "view";
  const isCreateMode = mode === "create";
  
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: "", description: "" });
  
  const [exception, setException] = useState<ExceptionFormData>({
    id: crypto.randomUUID(),
    date: new Date(),
    override_type: "FORCE_WORKING",
    is_applicable_to_all_classes: false,
    selected_classes: [],
    reason: "",
    isExpanded: true,
  });

  // Fetch classes
  const { data: classesResponse } = useQuery({
    queryKey: ["classes"],
    queryFn: () => fetchClasses({ page_size: 100 }),
  });

  const classes = classesResponse?.data || [];

  // Fetch existing exception for edit/view mode
  const {
    data: existingException,
    isLoading: isLoadingException,
  } = useQuery({
    queryKey: ["calendar-exception", publicId],
    queryFn: () => fetchCalendarException(publicId as string),
    enabled: !!publicId && (isEditMode || isViewMode),
  });

  // Fetch holiday calendar (yearly scope for validation)
  const { data: holidayData } = useQuery({
    queryKey: ["holiday-calendar"],
    queryFn: () => fetchHolidayCalendar({ page_size: 500 }),
  });

  const holidays = holidayData?.data || [];

  // Fetch working day policy
  const { data: workingDayPolicyData } = useQuery({
    queryKey: ["working-day-policy"],
    queryFn: fetchWorkingDayPolicy,
  });

  const workingDayPolicy = workingDayPolicyData?.data?.[0];

  // Populate form when editing or viewing existing exception
  useEffect(() => {
    if (existingException && (isEditMode || isViewMode)) {
      setException({
        id: crypto.randomUUID(),
        date: parseISO(existingException.date),
        override_type: existingException.override_type,
        is_applicable_to_all_classes: existingException.is_applicable_to_all_classes,
        selected_classes: existingException.classes,
        reason: existingException.reason,
        isExpanded: true,
      });
    }
  }, [existingException, isEditMode, isViewMode]);

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: CalendarExceptionCreate | CalendarExceptionUpdate) => {
      if (isEditMode && publicId) {
        // Update single exception
        return updateCalendarException(publicId, data as CalendarExceptionUpdate);
      } else {
        // Create single exception
        return createCalendarException(data as CalendarExceptionCreate);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-exceptions"] });
      if (publicId) {
        queryClient.invalidateQueries({ queryKey: ["calendar-exception", publicId] });
      }
      setSuccessMessage({
        title: isEditMode ? "Exception Updated!" : "Exception Created!",
        description: isEditMode 
          ? "The calendar exception has been updated successfully."
          : "The calendar exception has been created successfully.",
      });
      setShowSuccessDialog(true);
    },
    onError: (error: unknown) => {
      const errorMessage = getShortErrorMessage(error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    setLocation("/exceptional-work");
  };

  const updateException = (updates: Partial<ExceptionFormData>) => {
    setException({ ...exception, ...updates });
  };

  const handleClassToggle = (classId: string) => {
    const newClasses = exception.selected_classes.includes(classId)
      ? exception.selected_classes.filter((id) => id !== classId)
      : [...exception.selected_classes, classId];
    setException({ ...exception, selected_classes: newClasses });
  };

  // Helper: Check if date is already an organization holiday
  const isDateHoliday = (date: Date): boolean => {
    return holidays.some((holiday) => {
      // Skip auto-generated weekend holidays
      if (holiday.holiday_type === "SUNDAY" || holiday.holiday_type === "SATURDAY") {
        return false;
      }
      const holidayStart = parseISO(holiday.start_date);
      const holidayEnd = parseISO(holiday.end_date);
      return isWithinInterval(date, { start: holidayStart, end: holidayEnd });
    });
  };

  // Helper: Check if date is a weekend based on working day policy
  const isDateWeekend = (date: Date): boolean => {
    if (!workingDayPolicy) {
      return false;
    }
    
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Check Sunday
    if (dayOfWeek === 0 && workingDayPolicy.sunday_off) {
      return true;
    }
    
    // Check Saturday
    if (dayOfWeek === 6) {
      if (workingDayPolicy.saturday_off_pattern === "ALL") {
        return true;
      }
      if (workingDayPolicy.saturday_off_pattern === "NONE") {
        return false;
      }
      
      // Calculate which Saturday of the month (1st, 2nd, 3rd, 4th, 5th)
      const dayOfMonth = date.getDate();
      const saturdayOfMonth = Math.floor((dayOfMonth - 1) / 7) + 1;
      
      if (workingDayPolicy.saturday_off_pattern === "SECOND_ONLY") {
        return saturdayOfMonth === 2;
      }
      if (workingDayPolicy.saturday_off_pattern === "SECOND_AND_FOURTH") {
        return saturdayOfMonth === 2 || saturdayOfMonth === 4;
      }
    }
    
    return false;
  };

  // Helper: Check if date is a working day (not a holiday and not a weekend)
  const isDateWorkingDay = (date: Date): boolean => {
    return !isDateHoliday(date) && !isDateWeekend(date);
  };

  const validateExceptions = () => {
    if (!exception.date) {
      toast({
        title: "Validation Error",
        description: "Please select a date",
        variant: "destructive",
      });
      return false;
    }
    if (!exception.reason.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a reason",
        variant: "destructive",
      });
      return false;
    }
    if (!exception.is_applicable_to_all_classes && exception.selected_classes.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one class or apply to all classes",
        variant: "destructive",
      });
      return false;
    }

    // Validate FORCE_HOLIDAY exceptions
    if (exception.override_type === "FORCE_HOLIDAY") {
      if (isDateHoliday(exception.date)) {
        toast({
          title: "Validation Error",
          description: `${format(exception.date, "MMM dd, yyyy")} is already an organization holiday. You don't need to create a FORCE_HOLIDAY exception.`,
          variant: "destructive",
        });
        return false;
      }
      if (isDateWeekend(exception.date)) {
        toast({
          title: "Validation Error",
          description: `${format(exception.date, "MMM dd, yyyy")} is already a weekend. You don't need to create a FORCE_HOLIDAY exception.`,
          variant: "destructive",
        });
        return false;
      }
    }

    // Validate FORCE_WORKING exceptions
    if (exception.override_type === "FORCE_WORKING") {
      if (isDateWorkingDay(exception.date)) {
        toast({
          title: "Validation Error",
          description: `${format(exception.date, "MMM dd, yyyy")} is already a working day. You don't need to create a FORCE_WORKING exception.`,
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateExceptions()) {
      return;
    }

    if (isEditMode && publicId) {
      // Update single exception
      const payload: CalendarExceptionUpdate = {
        date: format(exception.date, "yyyy-MM-dd"),
        override_type: exception.override_type,
        is_applicable_to_all_classes: exception.is_applicable_to_all_classes,
        classes: exception.is_applicable_to_all_classes ? [] : exception.selected_classes,
        reason: exception.reason.trim(),
      };
      saveMutation.mutate(payload);
    } else {
      // Create single exception
      const payload: CalendarExceptionCreate = {
        date: format(exception.date, "yyyy-MM-dd"),
        override_type: exception.override_type,
        is_applicable_to_all_classes: exception.is_applicable_to_all_classes,
        classes: exception.is_applicable_to_all_classes ? [] : exception.selected_classes,
        reason: exception.reason.trim(),
      };
      saveMutation.mutate(payload);
    }
  };

  // Loading state for edit/view mode
  if ((isEditMode || isViewMode) && isLoadingException) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/exceptional-work")} title="Back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="mb-3 text-3xl font-bold text-gray-900">
              {isViewMode && "View Calendar Exception"}
              {isEditMode && "Edit Calendar Exception"}
              {isCreateMode && "Create Calendar Exception"}
            </h1>
            <p className="text-base text-gray-600">
              {isViewMode && "View exception details"}
              {isEditMode && "Update exception details below"}
              {isCreateMode && "Add exceptional work policies for specific dates and classes"}
            </p>
          </div>
        </div>
      </div>

      {/* Exception Form */}
      <Card className="border-2">
        <CardContent className="pt-6 space-y-4">
                {/* Date and Exception Type in Single Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Date */}
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Date</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          disabled={isViewMode}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !exception.date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {exception.date ? format(exception.date, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      {!isViewMode && (
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={exception.date}
                            onSelect={(date) => date && updateException({ date })}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            initialFocus
                          />
                        </PopoverContent>
                      )}
                    </Popover>
                  </div>

                  {/* Exception Type */}
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Exception Type</span>
                    <Select
                      value={exception.override_type}
                      onValueChange={(value: "FORCE_WORKING" | "FORCE_HOLIDAY") =>
                        updateException({ override_type: value })
                      }
                      disabled={isViewMode}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FORCE_WORKING">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <span>Force Working - Make holiday a working day</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="FORCE_HOLIDAY">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-red-500" />
                            <span>Force Holiday - Give holiday on working day</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Apply to All Classes */}
                <div className="flex items-center space-x-3 rounded-md border p-4">
                  <Checkbox
                    checked={exception.is_applicable_to_all_classes}
                    onCheckedChange={(checked) =>
                      updateException({ is_applicable_to_all_classes: checked as boolean })
                    }
                    disabled={isViewMode}
                  />
                  <div className="space-y-1 leading-none">
                    <span className="text-sm font-medium">Apply to all classes</span>
                    <p className="text-sm text-gray-600">
                      This exception will apply to all classes in the organization
                    </p>
                  </div>
                </div>

                {/* Class Selection */}
                {!exception.is_applicable_to_all_classes && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Select Classes</span>
                    <div className="max-h-60 overflow-y-auto rounded-md border p-4">
                      {classes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {classes.map((cls: MasterClass) => (
                            <div key={cls.public_id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                              <Checkbox
                                checked={exception.selected_classes.includes(cls.public_id)}
                                onCheckedChange={() => handleClassToggle(cls.public_id)}
                                disabled={isViewMode}
                              />
                              <label className="text-sm font-medium leading-none cursor-pointer">
                                {cls.class_master.name} - {cls.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No classes available</p>
                      )}
                    </div>
                    {exception.selected_classes.length === 0 && (
                      <p className="text-sm text-red-600">Please select at least one class</p>
                    )}
                  </div>
                )}

                {/* Reason */}
                <div className="space-y-2">
                  <span className="text-sm font-medium">Reason</span>
                  <Textarea
                    value={exception.reason}
                    onChange={(e) => updateException({ reason: e.target.value })}
                    placeholder="Enter reason for this exception..."
                    className="resize-none"
                    rows={3}
                    disabled={isViewMode}
                  />
                  <p className="text-sm text-gray-600">Provide a clear reason for this exception</p>
                </div>
              </CardContent>
            </Card>

      {/* Bottom Action Buttons */}
      {!isViewMode && (
        <div className="flex items-center justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setLocation("/exceptional-work")}
            disabled={saveMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={saveMutation.isPending}
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                {isEditMode && <Save className="mr-2 h-4 w-4" />}
                {isEditMode ? "Update Exception" : "Create Exception"}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Success Dialog */}
      <SuccessDialog
        open={showSuccessDialog}
        title={successMessage.title}
        description={successMessage.description}
        onClose={handleSuccessDialogClose}
      />
    </div>
  );
}
