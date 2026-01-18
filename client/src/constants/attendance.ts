/**
 * Attendance Module Constants
 * Centralized constants for attendance-related features.
 * Matches backend constants from edusphere.attendance.constants
 */

/**
 * Saturday off patterns for working day policy
 * Matches backend SaturdayOffPattern enum
 */
export const SaturdayOffPattern = {
  ALL: "ALL",
  SECOND_ONLY: "SECOND_ONLY",
  SECOND_AND_FOURTH: "SECOND_AND_FOURTH",
  NONE: "NONE",
} as const;

export type SaturdayOffPatternType = typeof SaturdayOffPattern[keyof typeof SaturdayOffPattern];

/**
 * Saturday off pattern display labels
 */
export const SaturdayOffPatternLabels: Record<SaturdayOffPatternType, string> = {
  [SaturdayOffPattern.ALL]: "All Saturdays Off",
  [SaturdayOffPattern.SECOND_ONLY]: "Second Saturday Only",
  [SaturdayOffPattern.SECOND_AND_FOURTH]: "Second and Fourth Saturday",
  [SaturdayOffPattern.NONE]: "No Saturday Off",
};

/**
 * Holiday types for organization calendar
 * Matches backend HolidayType enum
 */
export const HolidayType = {
  SUNDAY: "SUNDAY",
  SATURDAY: "SATURDAY",
  SECOND_SATURDAY: "SECOND_SATURDAY",
  NATIONAL_HOLIDAY: "NATIONAL_HOLIDAY",
  FESTIVAL: "FESTIVAL",
  ORGANIZATION_HOLIDAY: "ORGANIZATION_HOLIDAY",
  OTHER: "OTHER",
} as const;

export type HolidayTypeValue = typeof HolidayType[keyof typeof HolidayType];

/**
 * Holiday type display labels
 */
export const HolidayTypeLabels: Record<HolidayTypeValue, string> = {
  [HolidayType.SUNDAY]: "Sunday",
  [HolidayType.SATURDAY]: "Saturday",
  [HolidayType.SECOND_SATURDAY]: "Second Saturday",
  [HolidayType.NATIONAL_HOLIDAY]: "National Holiday",
  [HolidayType.FESTIVAL]: "Festival Holiday",
  [HolidayType.ORGANIZATION_HOLIDAY]: "Organization Holiday",
  [HolidayType.OTHER]: "Other",
};

/**
 * Attendance preference types
 * Matches backend AttendancePreferenceType enum
 */
export const AttendancePreferenceType = {
  CLASS_TEACHER_ONLY: "CLASS_TEACHER_ONLY",
  ANY_TEACHER: "ANY_TEACHER",
} as const;

export type AttendancePreferenceTypeValue = typeof AttendancePreferenceType[keyof typeof AttendancePreferenceType];

/**
 * Attendance preference type display labels
 */
export const AttendancePreferenceTypeLabels: Record<AttendancePreferenceTypeValue, string> = {
  [AttendancePreferenceType.CLASS_TEACHER_ONLY]: "Class Teacher Only",
  [AttendancePreferenceType.ANY_TEACHER]: "Any Teacher from Organization",
};
