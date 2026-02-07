/**
 * Date Utility Functions
 * Centralized date formatting and parsing utilities for consistent date handling across the application
 */

import { format, parse, isValid, parseISO } from "date-fns";

/**
 * Standard date format used across the application
 * Format: "MMM dd, yyyy" (e.g., "Aug 16, 2025")
 */
export const DATE_DISPLAY_FORMAT = "MMM dd, yyyy";

/**
 * ISO date format for API communication
 * Format: "yyyy-MM-dd" (e.g., "2025-08-16")
 */
export const DATE_API_FORMAT = "yyyy-MM-dd";

/**
 * Format a date for display using the standard application format
 * @param date - Date to format (Date object, ISO string, or undefined)
 * @returns Formatted date string (e.g., "Aug 16, 2025") or empty string
 */
export function formatDateForDisplay(date: Date | string | undefined | null): string {
  if (!date) {
    return "";
  }

  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      return "";
    }
    return format(dateObj, DATE_DISPLAY_FORMAT);
  } catch {
    return "";
  }
}

/**
 * Format a date for API requests (YYYY-MM-DD)
 * @param date - Date to format (Date object or string)
 * @returns Formatted date string (e.g., "2025-08-16") or empty string
 */
export function formatDateForAPI(date: Date | string | undefined | null): string {
  if (!date) {
    return "";
  }

  try {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(dateObj)) {
      return "";
    }
    return format(dateObj, DATE_API_FORMAT);
  } catch {
    return "";
  }
}

/**
 * Parse a date string in the display format to a Date object
 * Accepts formats: "MMM dd, yyyy", "YYYY-MM-DD", or Date object
 * @param dateString - Date string to parse
 * @returns Date object or undefined if invalid
 */
export function parseDateInput(dateString: string | Date | undefined | null): Date | undefined {
  if (!dateString) {
    return undefined;
  }
  if (dateString instanceof Date) {
    return isValid(dateString) ? dateString : undefined;
  }

  try {
    // Try parsing as display format first (e.g., "Aug 16, 2025")
    let dateObj = parse(dateString, DATE_DISPLAY_FORMAT, new Date());
    if (isValid(dateObj)) {
      return dateObj;
    }

    // Try parsing as ISO format (e.g., "2025-08-16")
    dateObj = parseISO(dateString);
    if (isValid(dateObj)) {
      return dateObj;
    }

    // Try parsing as API format
    dateObj = parse(dateString, DATE_API_FORMAT, new Date());
    if (isValid(dateObj)) {
      return dateObj;
    }

    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Parse a local date string (YYYY-MM-DD) without timezone conversion
 * @param dateString - Date string in format "YYYY-MM-DD"
 * @returns Date object or undefined
 */
export function parseLocalDate(dateString: string | null | undefined): Date | undefined {
  if (!dateString) {
    return undefined;
  }
  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) {
    return undefined;
  }
  return new Date(year, month - 1, day); // month is 0-indexed
}

/**
 * Format date for input field (YYYY-MM-DD)
 * @param date - Date to format
 * @returns Formatted date string or empty string
 */
export function formatDateForInput(date: string | Date | undefined | null): string {
  if (!date) {
    return "";
  }
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(dateObj)) {
    return "";
  }
  return format(dateObj, DATE_API_FORMAT);
}

/**
 * Check if a date string is valid in any accepted format
 * @param dateString - Date string to validate
 * @returns true if valid, false otherwise
 */
export function isValidDateString(dateString: string): boolean {
  return parseDateInput(dateString) !== undefined;
}

/**
 * Get current date in API format (YYYY-MM-DD)
 * @returns Current date string
 */
export function getCurrentDateString(): string {
  return format(new Date(), DATE_API_FORMAT);
}

/**
 * Get current date in display format (MMM dd, yyyy)
 * @returns Current date string
 */
export function getCurrentDateDisplay(): string {
  return format(new Date(), DATE_DISPLAY_FORMAT);
}
