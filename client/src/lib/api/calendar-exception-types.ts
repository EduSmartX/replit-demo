/**
 * Calendar Exception Types
 * Type definitions for calendar exceptions API
 */

export type OverrideType = "FORCE_WORKING" | "FORCE_HOLIDAY";

export interface CalendarException {
  public_id: string;
  organization: string;
  is_applicable_to_all_classes: boolean;
  classes: string[];
  date: string;
  override_type: OverrideType;
  reason: string;
  created_at: string;
  updated_at: string;
}

export interface CalendarExceptionCreate {
  is_applicable_to_all_classes: boolean;
  classes: string[];
  date: string;
  override_type: OverrideType;
  reason: string;
}

export interface CalendarExceptionUpdate {
  is_applicable_to_all_classes?: boolean;
  classes?: string[];
  date?: string;
  override_type?: OverrideType;
  reason?: string;
}

export interface BulkCreateCalendarExceptionsRequest {
  exceptions: CalendarExceptionCreate[];
}

export interface BulkCreateCalendarExceptionsResponse {
  created_count: number;
  exceptions: CalendarException[];
}
