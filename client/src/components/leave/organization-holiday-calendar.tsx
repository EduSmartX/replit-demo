/**
 * Organization Holiday Calendar Component
 * Displays organization holidays in both calendar and tabular views
 */

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar as CalendarIcon,
  List,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import { fetchHolidayCalendar, fetchWorkingDayPolicy, getHolidayTypeColor, formatHolidayType, calculateDuration, isNthWeekdayOfMonth } from "@/lib/api/holiday-api";
import type { Holiday, WorkingDayPolicy, SaturdayOffPattern } from "@/lib/api/holiday-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddHolidaysForm } from "./add-holidays-form";
import { EditHolidayDialog } from "./edit-holiday-dialog";
import { BulkUploadHolidays } from "./bulk-upload-holidays";
import { ConfirmationDialog } from "@/components/common/confirmation-dialog";
import { useDeleteHoliday } from "@/hooks/use-holiday-mutations";
import { 
  isWeekendHoliday, 
  filterNonWeekendHolidays, 
  filterWeekendTypes,
  formatDateRange,
  sortHolidaysByDate,
  isHolidayPast,
  getUpcomingHolidays 
} from "@/lib/utils/holiday-utils";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, addMonths, subMonths, isSameMonth, isSameDay, isWithinInterval, parseISO, startOfDay } from "date-fns";

type ViewMode = "calendar" | "table";
type DateRange = "monthly" | "quarterly" | "half-yearly";

interface OrganizationHolidayCalendarProps {
  className?: string;
}

export function OrganizationHolidayCalendar({ className }: OrganizationHolidayCalendarProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateRange] = useState<DateRange>("monthly");

  // Fetch working day policy once
  const { data: workingDayPolicyData } = useQuery({
    queryKey: ["working-day-policy"],
    queryFn: fetchWorkingDayPolicy,
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
  });

  const workingDayPolicy = workingDayPolicyData?.data?.[0];

  // Calculate date range for fetching entire year data
  const { currentYear, fetchFromDate, fetchToDate, displayFromDate, displayToDate } = useMemo(() => {
    // Fetch entire year: January 1st to December 31st of current viewing year
    const year = currentDate.getFullYear();
    const yearStart = new Date(year, 0, 1); // Jan 1
    const yearEnd = new Date(year, 11, 31); // Dec 31
    
    // Display range for current month view
    const currentMonthStart = startOfMonth(currentDate);
    const currentMonthEnd = endOfMonth(currentDate);

    return {
      currentYear: year.toString(),
      fetchFromDate: format(yearStart, "yyyy-MM-dd"),
      fetchToDate: format(yearEnd, "yyyy-MM-dd"),
      displayFromDate: format(currentMonthStart, "yyyy-MM-dd"),
      displayToDate: format(currentMonthEnd, "yyyy-MM-dd"),
    };
  }, [currentDate]);

  // Fetch holiday data for entire year - cache by year to reuse across all months
  const {
    data: holidayData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["holiday-calendar", currentYear],
    queryFn: () =>
      fetchHolidayCalendar({
        from_date: fetchFromDate,
        to_date: fetchToDate,
        ordering: "start_date",
        page_size: 365,
      }),
    staleTime: 30 * 60 * 1000,
  });
  
  const generatedWeekendHolidays = useMemo(() => {
    if (!workingDayPolicy) return [];

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

  // Filter holidays for current display month
  const displayHolidays = useMemo(() => {
    return allHolidays.filter((holiday) => {
      const holidayStart = parseISO(holiday.start_date);
      const holidayEnd = parseISO(holiday.end_date);
      const displayStart = parseISO(displayFromDate);
      const displayEnd = parseISO(displayToDate);
      
      // Check if holiday overlaps with display range
      return (
        (holidayStart >= displayStart && holidayStart <= displayEnd) ||
        (holidayEnd >= displayStart && holidayEnd <= displayEnd) ||
        (holidayStart <= displayStart && holidayEnd >= displayEnd)
      );
    });
  }, [allHolidays, displayFromDate, displayToDate]);

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
    <div className={cn("space-y-3", className)}>
      {/* Header with view toggle and navigation */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-xl font-bold">Holiday Calendar</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
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

              {/* Bulk Upload and Add Holidays Buttons */}
              <BulkUploadHolidays />
              <AddHolidaysForm />
            </div>
          </div>
          <div className="text-lg font-semibold text-foreground mt-2">
            {format(currentDate, "MMMM yyyy")}
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
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
  const today = startOfDay(new Date());
  
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
        <div className="flex flex-wrap items-center gap-3 px-3 py-2 bg-muted/50 rounded-lg">
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
      <div className="border rounded-lg overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 bg-muted/30">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="py-1 px-1 text-center text-[10px] font-semibold text-muted-foreground border-b"
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

            return (
              <div
                key={index}
                className={cn(
                  "min-h-[60px] p-1.5 border-b border-r",
                  !day.isCurrentMonth && "bg-muted/20 text-muted-foreground",
                  day.isToday && "bg-blue-50 border-blue-300",
                  colors && day.isCurrentMonth && colors.bg
                )}
              >
                <div
                  className={cn(
                    "text-xs font-medium mb-0.5",
                    day.isToday && "text-blue-600 font-bold"
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
                            "text-[10px] px-1 py-0.5 rounded truncate leading-tight",
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
                      <div className="text-[9px] text-muted-foreground">
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
          <CardHeader className="pb-2 pt-3">
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
                    className="flex items-center justify-between p-2 rounded-lg border"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className={cn("h-2 w-2 rounded-full", colors.badge)} />
                        <span className="text-sm font-medium">{holiday.description}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {format(parseISO(holiday.start_date), "MMM dd, yyyy")}
                        {duration > 1 && ` - ${format(parseISO(holiday.end_date), "MMM dd, yyyy")}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary" className="text-xs px-1.5 py-0">{duration} {duration === 1 ? "Day" : "Days"}</Badge>
                      <Badge className={cn(colors.badge, "text-xs px-1.5 py-0")}>{formatHolidayType(holiday.holiday_type)}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================================================
// Table View Component
// ============================================================================

interface TableViewProps {
  holidays: Holiday[];
  allHolidays: Holiday[];
}

function TableView({ holidays, allHolidays }: TableViewProps) {
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
      <div className="text-center py-12 text-muted-foreground">
        No holidays found for the selected period.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-center font-semibold">Date</TableHead>
              <TableHead className="text-center font-semibold">Description</TableHead>
              <TableHead className="text-center font-semibold">Duration</TableHead>
              <TableHead className="text-center font-semibold">Type</TableHead>
              <TableHead className="text-center font-semibold w-[100px]">Actions</TableHead>
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
                  <TableCell className="font-medium text-center">
                    <div>
                      {format(parseISO(holiday.start_date), "MMM dd, yyyy")}
                      {duration > 1 && (
                        <>
                          <br />
                          <span className="text-sm text-muted-foreground">
                            to {format(parseISO(holiday.end_date), "MMM dd, yyyy")}
                          </span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className={cn("h-2 w-2 rounded-full flex-shrink-0", colors.badge)} />
                      <span>{holiday.description}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">
                      {duration} {duration === 1 ? "Day" : "Days"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={colors.badge}>{formatHolidayType(holiday.holiday_type)}</Badge>
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
                        className="h-8 w-8 text-destructive hover:text-destructive"
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
