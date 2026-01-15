/**
 * Holiday Utility Functions
 * Reusable helper functions for holiday-related operations
 */

import { format, parseISO } from "date-fns";
import type { Holiday, HolidayType } from "@/lib/api/holiday-api";

/**
 * Check if a holiday is a weekend (auto-generated)
 */
export function isWeekendHoliday(holiday: Holiday): boolean {
  return holiday.holiday_type === "SUNDAY" || holiday.holiday_type === "SATURDAY";
}

/**
 * Filter out weekend holidays from array
 */
export function filterNonWeekendHolidays(holidays: Holiday[]): Holiday[] {
  return holidays.filter((h) => !isWeekendHoliday(h));
}

/**
 * Filter weekend types from holiday type array
 */
export function filterWeekendTypes(types: HolidayType[]): HolidayType[] {
  return types.filter((t) => t !== "SUNDAY" && t !== "SATURDAY");
}

/**
 * Format date range for display
 * @param startDate - Start date string (YYYY-MM-DD)
 * @param endDate - End date string (YYYY-MM-DD)
 * @param duration - Number of days
 * @returns Formatted date range string
 */
export function formatDateRange(
  startDate: string,
  endDate: string,
  duration: number
): string {
  const start = format(parseISO(startDate), "MMM dd, yyyy");
  if (duration === 1) {
    return start;
  }
  const end = format(parseISO(endDate), "MMM dd, yyyy");
  return `${start} - ${end}`;
}

/**
 * Get default form values for creating a holiday
 */
export function getDefaultHolidayFormData(): {
  start_date: string;
  end_date?: string;
  holiday_type: "FESTIVAL";
  description: string;
} {
  return {
    start_date: format(new Date(), "yyyy-MM-dd"),
    end_date: undefined,
    holiday_type: "FESTIVAL",
    description: "",
  };
}

/**
 * Sort holidays by start date
 */
export function sortHolidaysByDate(holidays: Holiday[]): Holiday[] {
  return [...holidays].sort((a, b) => {
    return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
  });
}

/**
 * Check if holiday is in the past
 */
export function isHolidayPast(holiday: Holiday, today: Date = new Date()): boolean {
  return new Date(holiday.end_date) < today;
}

/**
 * Get upcoming holidays from a date
 */
export function getUpcomingHolidays(
  holidays: Holiday[],
  fromDate: Date = new Date(),
  limit: number = 5
): Holiday[] {
  return filterNonWeekendHolidays(holidays)
    .filter((h) => new Date(h.start_date) >= fromDate)
    .slice(0, limit);
}
