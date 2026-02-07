/**
 * Organization Holiday Calendar Component
 * Displays organization holidays in both calendar and tabular views
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addMonths,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfMonth,
  subMonths,
} from "date-fns";
import {
  AlertCircle,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  List,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { ConfirmationDialog } from "@/common/components/dialogs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useDeleteHoliday } from "@/hooks/use-holiday-mutations";
import { useToast } from "@/hooks/use-toast";
import { fetchClasses } from "@/lib/api/class-api";
import type { Holiday } from "@/lib/api/holiday-api";
import {
  calculateDuration,
  fetchHolidayCalendar,
  fetchWorkingDayPolicy,
  formatHolidayType,
  getHolidayTypeColor,
  isNthWeekdayOfMonth,
} from "@/lib/api/holiday-api";
import { cn } from "@/lib/utils";
import {
  filterNonWeekendHolidays,
  filterWeekendTypes,
  getUpcomingHolidays,
  isHolidayPast,
  isWeekendHoliday,
  sortHolidaysByDate,
} from "@/lib/utils/holiday-utils";
import { AddHolidaysForm } from "./add-holidays-form";
import { BulkUploadHolidays } from "./bulk-upload-holidays";
import { EditHolidayDialog } from "./edit-holiday-dialog";

type ViewMode = "calendar" | "table";
type DateRange = "monthly" | "quarterly" | "half-yearly";

interface OrganizationHolidayCalendarProps {
  className?: string;
}

export function OrganizationHolidayCalendar({ className }: OrganizationHolidayCalendarProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [_dateRange] = useState<DateRange>("monthly");

  // Year-based caching strategy: Fetch working day policy once and cache for 30min
  const { data: workingDayPolicyData } = useQuery({
    queryKey: ["working-day-policy"],
    queryFn: fetchWorkingDayPolicy,
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
  });

  const workingDayPolicy = workingDayPolicyData?.data?.[0];

  const { currentYear, currentMonth, fetchFromDate, fetchToDate } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);

    return {
      currentYear: year.toString(),
      currentMonth: month.toString(),
      fetchFromDate: format(monthStart, "yyyy-MM-dd"),
      fetchToDate: format(monthEnd, "yyyy-MM-dd"),
    };
  }, [currentDate]);

  const {
    data: holidayData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["holiday-calendar", currentYear, currentMonth],
    queryFn: () =>
      fetchHolidayCalendar({
        from_date: fetchFromDate,
        to_date: fetchToDate,
        ordering: "start_date",
        page_size: 365,
      }),
    staleTime: 30 * 60 * 1000,
  });

  // Weekend generation algorithm: Dynamically compute Sunday/Saturday holidays based on policy
  // (ALL, SECOND_ONLY, SECOND_AND_FOURTH, NONE) without backend storage
  const generatedWeekendHolidays = useMemo(() => {
    if (!workingDayPolicy) {
      return [];
    }

    const holidays: Holiday[] = [];
    const startDate = parseISO(fetchFromDate);
    const endDate = parseISO(fetchToDate);

    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();

      // Check for Sunday
      if (dayOfWeek === 0 && workingDayPolicy.sunday_off) {
        holidays.push({
          public_id: `sunday-${format(currentDate, "yyyy-MM-dd")}`,
          start_date: format(currentDate, "yyyy-MM-dd"),
          end_date: format(currentDate, "yyyy-MM-dd"),
          holiday_type: "SUNDAY",
          description: "Sunday",
        });
      }

      if (dayOfWeek === 6) {
        let isSaturdayOff = false;

        switch (workingDayPolicy.saturday_off_pattern) {
          case "ALL":
            isSaturdayOff = true;
            break;
          case "SECOND_ONLY":
            isSaturdayOff = isNthWeekdayOfMonth(currentDate, 6, [2]);
            break;
          case "SECOND_AND_FOURTH":
            isSaturdayOff = isNthWeekdayOfMonth(currentDate, 6, [2, 4]);
            break;
          case "NONE":
          default:
            isSaturdayOff = false;
        }

        if (isSaturdayOff) {
          holidays.push({
            public_id: `saturday-${format(currentDate, "yyyy-MM-dd")}`,
            start_date: format(currentDate, "yyyy-MM-dd"),
            end_date: format(currentDate, "yyyy-MM-dd"),
            holiday_type: "SATURDAY",
            description: "Saturday",
          });
        }
      }

      // Move to next day
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return holidays;
  }, [workingDayPolicy, fetchFromDate, fetchToDate]);

  // Combine API holidays with generated weekend holidays
  const allHolidays = useMemo(() => {
    const apiHolidays = holidayData?.data || [];
    return [...apiHolidays, ...generatedWeekendHolidays];
  }, [holidayData, generatedWeekendHolidays]);

  // Since we're fetching monthly data, all holidays are for current month
  const displayHolidays = allHolidays;

  // Navigation handlers
  const handlePreviousMonth = () => {
    setCurrentDate((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => addMonths(prev, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-3 text-3xl font-bold text-gray-900">Holiday Calendar</h1>
          <p className="text-base text-gray-600">
            Manage organization-wide holidays and working days
          </p>
        </div>
        <div className="flex items-center gap-3">
          <BulkUploadHolidays />
          <AddHolidaysForm />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-foreground text-lg font-semibold">
              {format(currentDate, "MMMM yyyy")}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* View Toggle */}
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                <TabsList>
                  <TabsTrigger value="calendar" className="gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Calendar</span>
                  </TabsTrigger>
                  <TabsTrigger value="table" className="gap-2">
                    <List className="h-4 w-4" />
                    <span className="hidden sm:inline">Table</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Date Navigation */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousMonth}
                  disabled={isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={handleToday} disabled={isLoading}>
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextMonth}
                  disabled={isLoading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-3">
          {/* Error State */}
          {isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error instanceof Error ? error.message : "Failed to load holiday calendar"}
              </AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          )}

          {/* Content */}
          {!isLoading && !isError && (
            <>
              {viewMode === "calendar" ? (
                <CalendarView currentDate={currentDate} holidays={displayHolidays} />
              ) : (
                <TableView holidays={displayHolidays} allHolidays={allHolidays} />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Calendar View Component
// ============================================================================

interface CalendarViewProps {
  currentDate: Date;
  holidays: Holiday[];
}

function CalendarView({ currentDate, holidays }: CalendarViewProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showExceptionDialog, setShowExceptionDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateHolidays, setSelectedDateHolidays] = useState<Holiday[]>([]);
  const [isAddingException, setIsAddingException] = useState(false);
  const today = startOfDay(new Date());

  const handleDateClick = (date: Date, isCurrentMonth: boolean, dayHolidays: Holiday[]) => {
    if (isCurrentMonth) {
      setSelectedDate(date);
      setSelectedDateHolidays(dayHolidays);
      setIsAddingException(false);

      // If date already has holidays (excluding weekends), show exception dialog
      const nonWeekendHolidays = filterNonWeekendHolidays(dayHolidays);
      if (nonWeekendHolidays.length > 0) {
        setShowExceptionDialog(true);
      } else {
        setShowAddDialog(true);
      }
    }
  };

  // Get calendar grid data
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);

    // Get first day of the month (0 = Sunday, 6 = Saturday)
    const firstDayOfMonth = start.getDay();

    // Calculate days to show from previous month
    const daysInMonth = end.getDate();
    const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;

    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      isToday: boolean;
      holidays: Holiday[];
    }> = [];

    for (let i = 0; i < totalCells; i++) {
      const dayOffset = i - firstDayOfMonth;
      const date = new Date(start);
      date.setDate(date.getDate() + dayOffset);

      const isCurrentMonth = isSameMonth(date, currentDate);
      const isToday = isSameDay(date, today);

      // Find holidays for this date
      const dayHolidays = holidays.filter((holiday) => {
        const holidayStart = parseISO(holiday.start_date);
        const holidayEnd = parseISO(holiday.end_date);
        return isWithinInterval(date, { start: holidayStart, end: holidayEnd });
      });

      days.push({
        date,
        isCurrentMonth,
        isToday,
        holidays: dayHolidays,
      });
    }

    return days;
  }, [currentDate, holidays, today]);

  // Group holidays by type for legend (exclude weekends)
  const holidayTypes = useMemo(() => {
    const types = new Set(holidays.map((h) => h.holiday_type));
    return filterWeekendTypes(Array.from(types));
  }, [holidays]);

  // Get upcoming holidays from current date (exclude weekends)
  const upcomingHolidays = useMemo(() => {
    return getUpcomingHolidays(holidays, today, 5);
  }, [holidays, today]);

  return (
    <div className="space-y-3">
      {/* Legend */}
      {holidayTypes.length > 0 && (
        <div className="bg-muted/50 flex flex-wrap items-center gap-3 rounded-lg px-3 py-2">
          <div className="text-xs font-semibold">Legend:</div>
          {holidayTypes.map((type) => {
            const colors = getHolidayTypeColor(type);
            return (
              <div key={type} className="flex items-center gap-1.5">
                <div className={cn("h-2.5 w-2.5 rounded", colors.badge)} />
                <span className="text-xs">{formatHolidayType(type)}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Calendar Grid */}
      <div className="overflow-hidden rounded-lg border">
        {/* Weekday Headers */}
        <div className="bg-muted/30 grid grid-cols-7">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-muted-foreground border-b px-1 py-1 text-center text-[10px] font-semibold"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const primaryHoliday = day.holidays[0];
            const colors = primaryHoliday ? getHolidayTypeColor(primaryHoliday.holiday_type) : null;

            let titleText = "";
            if (day.isCurrentMonth) {
              if (day.holidays.length > 0) {
                titleText = "Click to manage holidays";
              } else {
                titleText = "Click to add holiday";
              }
            }

            return (
              <div
                key={index}
                role="button"
                tabIndex={day.isCurrentMonth ? 0 : -1}
                className={cn(
                  "hover:bg-muted/50 min-h-[60px] cursor-pointer border-r border-b p-1.5 transition-colors",
                  !day.isCurrentMonth &&
                    "bg-muted/20 text-muted-foreground hover:bg-muted/20 cursor-default",
                  day.isToday && "border-indigo-300 bg-blue-50",
                  colors && day.isCurrentMonth && colors.bg
                )}
                onClick={() => handleDateClick(day.date, day.isCurrentMonth, day.holidays)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleDateClick(day.date, day.isCurrentMonth, day.holidays);
                  }
                }}
                title={titleText}
              >
                <div
                  className={cn(
                    "mb-0.5 text-xs font-medium",
                    day.isToday && "font-bold text-indigo-600"
                  )}
                >
                  {format(day.date, "d")}
                </div>
                {day.holidays.length > 0 && day.isCurrentMonth && (
                  <div className="space-y-0.5">
                    {day.holidays.slice(0, 1).map((holiday) => {
                      // Don't show text for Sunday/Saturday, just background color
                      if (isWeekendHoliday(holiday)) {
                        return null;
                      }
                      const holidayColors = getHolidayTypeColor(holiday.holiday_type);
                      return (
                        <div
                          key={holiday.public_id}
                          className={cn(
                            "truncate rounded px-1 py-0.5 text-[10px] leading-tight",
                            holidayColors.text,
                            holidayColors.border,
                            "border"
                          )}
                          title={holiday.description}
                        >
                          {holiday.description}
                        </div>
                      );
                    })}
                    {filterNonWeekendHolidays(day.holidays).length > 1 && (
                      <div className="text-muted-foreground text-[9px]">
                        +{filterNonWeekendHolidays(day.holidays).length - 1} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Holidays */}
      {upcomingHolidays.length > 0 && (
        <Card>
          <CardHeader className="pt-3 pb-2">
            <CardTitle className="text-base">Upcoming Holidays</CardTitle>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="space-y-1.5">
              {upcomingHolidays.map((holiday) => {
                const colors = getHolidayTypeColor(holiday.holiday_type);
                const duration = calculateDuration(holiday.start_date, holiday.end_date);
                return (
                  <div
                    key={holiday.public_id}
                    className="flex items-center justify-between rounded-lg border p-2"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className={cn("h-2 w-2 rounded-full", colors.badge)} />
                        <span className="text-sm font-medium">{holiday.description}</span>
                      </div>
                      <div className="text-muted-foreground mt-0.5 text-xs">
                        {format(parseISO(holiday.start_date), "MMM dd, yyyy")}
                        {duration > 1 && ` - ${format(parseISO(holiday.end_date), "MMM dd, yyyy")}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary" className="px-1.5 py-0 text-xs">
                        {duration} {duration === 1 ? "Day" : "Days"}
                      </Badge>
                      <Badge className={cn(colors.badge, "px-1.5 py-0 text-xs")}>
                        {formatHolidayType(holiday.holiday_type)}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Holiday Dialog */}
      <AddHolidaysForm
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        defaultDate={selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined}
        isException={isAddingException}
      />

      {/* Exception Policy Dialog - for managing existing holidays */}
      <ExceptionPolicyDialog
        open={showExceptionDialog}
        onOpenChange={setShowExceptionDialog}
        date={selectedDate}
        holidays={selectedDateHolidays}
        onAddException={() => {
          setShowExceptionDialog(false);
          setIsAddingException(true);
          setShowAddDialog(true);
        }}
      />
    </div>
  );
}

// ============================================================================
// Exception Policy Dialog Component
// ============================================================================

interface ExceptionPolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  holidays: Holiday[];
  onAddException: () => void;
}

function ExceptionPolicyDialog({
  open,
  onOpenChange,
  date,
  holidays,
  onAddException,
}: ExceptionPolicyDialogProps) {
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState<Holiday | null>(null);
  const [showExceptionForm, setShowExceptionForm] = useState(false);

  const deleteMutation = useDeleteHoliday();

  const handleEdit = (holiday: Holiday) => {
    setEditingHoliday(holiday);
    setEditDialogOpen(true);
  };

  const handleDelete = (holiday: Holiday) => {
    setHolidayToDelete(holiday);
    setDeleteDialogOpen(true);
  };

  const handleCreateException = () => {
    setShowExceptionForm(true);
  };

  const confirmDelete = () => {
    if (holidayToDelete) {
      deleteMutation.mutate(holidayToDelete.public_id);
      setDeleteDialogOpen(false);
      setHolidayToDelete(null);
      // Close exception dialog if no more holidays
      const remainingHolidays = filterNonWeekendHolidays(holidays).filter(
        (h) => h.public_id !== holidayToDelete.public_id
      );
      if (remainingHolidays.length === 0) {
        onOpenChange(false);
      }
    }
  };

  const nonWeekendHolidays = filterNonWeekendHolidays(holidays);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-indigo-600" />
              Manage Holidays - {date ? format(date, "MMMM dd, yyyy") : ""}
            </DialogTitle>
            <DialogDescription>
              This date has existing holidays. You can edit or delete them, add more holidays, or
              create an exception policy (Force Working/Holiday).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {nonWeekendHolidays.map((holiday) => {
              const colors = getHolidayTypeColor(holiday.holiday_type);
              const duration = calculateDuration(holiday.start_date, holiday.end_date);

              return (
                <Card key={holiday.public_id} className="border">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <div className={cn("h-2.5 w-2.5 rounded-full", colors.badge)} />
                          <span className="text-sm font-semibold">{holiday.description}</span>
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {format(parseISO(holiday.start_date), "MMM dd, yyyy")}
                          {duration > 1 &&
                            ` - ${format(parseISO(holiday.end_date), "MMM dd, yyyy")}`}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {duration} {duration === 1 ? "Day" : "Days"}
                          </Badge>
                          <Badge className={cn(colors.badge, "text-xs")}>
                            {formatHolidayType(holiday.holiday_type)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(holiday)}
                          disabled={deleteMutation.isPending}
                          title="Edit holiday"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive h-8 w-8"
                          onClick={() => handleDelete(holiday)}
                          disabled={deleteMutation.isPending}
                          title="Delete holiday"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={onAddException} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Another Holiday
            </Button>
            <Button onClick={handleCreateException} variant="secondary" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              Create Exception Policy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditHolidayDialog
        holiday={editingHoliday}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Holiday"
        description={`Are you sure you want to delete "${holidayToDelete?.description}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        variant="destructive"
      />

      {/* Exception Form Dialog */}
      <ExceptionFormDialog
        open={showExceptionForm}
        onOpenChange={setShowExceptionForm}
        date={date}
        onSuccess={() => {
          setShowExceptionForm(false);
          onOpenChange(false);
        }}
      />
    </>
  );
}

// ============================================================================
// Exception Form Dialog Component
// ============================================================================

interface ExceptionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date | null;
  onSuccess: () => void;
}

function ExceptionFormDialog({ open, onOpenChange, date, onSuccess }: ExceptionFormDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [overrideType, setOverrideType] = useState<"FORCE_WORKING" | "FORCE_HOLIDAY">(
    "FORCE_WORKING"
  );
  const [isApplicableToAll, setIsApplicableToAll] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [reason, setReason] = useState("");

  // Fetch classes
  const { data: classesResponse } = useQuery({
    queryKey: ["classes"],
    queryFn: () => fetchClasses({ page_size: 100 }),
  });

  const classes = classesResponse?.data || [];

  const createMutation = useMutation({
    mutationFn: async (data: {
      date: string;
      override_type: "FORCE_WORKING" | "FORCE_HOLIDAY";
      is_applicable_to_all_classes: boolean;
      classes: string[];
      reason: string;
    }) => {
      const response = await fetch("/api/calendar-exceptions/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create exception");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-exceptions"] });
      queryClient.invalidateQueries({ queryKey: ["holiday-calendar"] });
      toast({
        title: "Exception Created!",
        description: "The calendar exception has been created successfully.",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create exception",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!date) {
      toast({
        title: "Validation Error",
        description: "Please select a date",
        variant: "destructive",
      });
      return;
    }
    if (!reason.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a reason",
        variant: "destructive",
      });
      return;
    }
    if (!isApplicableToAll && selectedClasses.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one class or apply to all classes",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      date: format(date, "yyyy-MM-dd"),
      override_type: overrideType,
      is_applicable_to_all_classes: isApplicableToAll,
      classes: isApplicableToAll ? [] : selectedClasses,
      reason: reason.trim(),
    };

    createMutation.mutate(payload);
  };

  const handleClassToggle = (classId: string) => {
    setSelectedClasses((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-indigo-600" />
            Create Exception Policy - {date ? format(date, "MMMM dd, yyyy") : ""}
          </DialogTitle>
          <DialogDescription>
            Create an exception to override the default working day policy for this date.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Exception Type */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Exception Type</span>
            <Select
              value={overrideType}
              onValueChange={(value: "FORCE_WORKING" | "FORCE_HOLIDAY") => setOverrideType(value)}
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

          {/* Apply to All Classes */}
          <div className="flex items-center space-x-3 rounded-md border p-4">
            <Checkbox
              checked={isApplicableToAll}
              onCheckedChange={(checked) => setIsApplicableToAll(checked as boolean)}
            />
            <div className="space-y-1 leading-none">
              <span className="text-sm font-medium">Apply to all classes</span>
              <p className="text-muted-foreground text-sm">
                This exception will apply to all classes in the organization
              </p>
            </div>
          </div>

          {/* Class Selection */}
          {!isApplicableToAll && (
            <div className="space-y-2">
              <span className="text-sm font-medium">Select Classes</span>
              <div className="max-h-40 overflow-y-auto rounded-md border p-4">
                {classes.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {classes.map((cls) => (
                      <div key={cls.public_id} className="flex items-center space-x-2">
                        <Checkbox
                          checked={selectedClasses.includes(cls.public_id)}
                          onCheckedChange={() => handleClassToggle(cls.public_id)}
                        />
                        <label className="cursor-pointer text-sm leading-none font-medium">
                          {cls.class_master.name} - {cls.name}
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No classes available</p>
                )}
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Reason *</span>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for this exception..."
              rows={3}
              maxLength={500}
            />
            <p className="text-muted-foreground text-xs">{reason.length}/500 characters</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Exception
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Table View Component
// ============================================================================

interface TableViewProps {
  holidays: Holiday[];
  allHolidays: Holiday[];
}

function TableView({ holidays, allHolidays: _allHolidays }: TableViewProps) {
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState<Holiday | null>(null);
  const today = startOfDay(new Date());

  const deleteMutation = useDeleteHoliday();

  const handleEdit = (holiday: Holiday) => {
    setEditingHoliday(holiday);
    setEditDialogOpen(true);
  };

  const handleDelete = (holiday: Holiday) => {
    setHolidayToDelete(holiday);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (holidayToDelete) {
      deleteMutation.mutate(holidayToDelete.public_id);
    }
  };

  // Sort holidays by start date
  const sortedHolidays = useMemo(() => {
    return sortHolidaysByDate(holidays);
  }, [holidays]);

  if (holidays.length === 0) {
    return (
      <div className="text-muted-foreground py-12 text-center">
        No holidays found for the selected period.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-center font-semibold">Date</TableHead>
              <TableHead className="text-center font-semibold">Description</TableHead>
              <TableHead className="text-center font-semibold">Duration</TableHead>
              <TableHead className="text-center font-semibold">Type</TableHead>
              <TableHead className="w-[100px] text-center font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedHolidays.map((holiday) => {
              const colors = getHolidayTypeColor(holiday.holiday_type);
              const duration = calculateDuration(holiday.start_date, holiday.end_date);
              const isPast = isHolidayPast(holiday, today);
              const isWeekend = isWeekendHoliday(holiday);

              return (
                <TableRow key={holiday.public_id} className={cn(isPast && "opacity-50")}>
                  <TableCell className="text-center font-medium">
                    <div>
                      {format(parseISO(holiday.start_date), "MMM dd, yyyy")}
                      {duration > 1 && (
                        <>
                          <br />
                          <span className="text-muted-foreground text-sm">
                            to {format(parseISO(holiday.end_date), "MMM dd, yyyy")}
                          </span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className={cn("h-2 w-2 flex-shrink-0 rounded-full", colors.badge)} />
                      <span>{holiday.description}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">
                      {duration} {duration === 1 ? "Day" : "Days"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={colors.badge}>
                      {formatHolidayType(holiday.holiday_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(holiday)}
                        disabled={isWeekend || deleteMutation.isPending}
                        title={isWeekend ? "Cannot edit weekend holidays" : "Edit holiday"}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive h-8 w-8"
                        onClick={() => handleDelete(holiday)}
                        disabled={isWeekend || deleteMutation.isPending}
                        title={isWeekend ? "Cannot delete weekend holidays" : "Delete holiday"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <EditHolidayDialog
        holiday={editingHoliday}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Holiday"
        description={`Are you sure you want to delete "${holidayToDelete?.description}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </>
  );
}
