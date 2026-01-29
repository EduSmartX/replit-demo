// Centralized React Query cache keys
export const QUERY_KEYS = {
  // Classes
  CLASSES: 'classes',
  CORE_CLASSES: 'coreClasses',
  CLASS_DETAILS: 'classDetails',
  
  // Students
  STUDENTS: 'students',
  STUDENT_DETAILS: 'studentDetails',
  
  // Teachers
  TEACHERS: 'teachers',
  TEACHER_DETAILS: 'teacherDetails',
  
  // Subjects
  SUBJECTS: 'subjects',
  SUBJECT_DETAILS: 'subjectDetails',
  
  // Attendance
  ATTENDANCE: 'attendance',
  ATTENDANCE_DETAILS: 'attendanceDetails',
  
  // Calendar Exceptions
  CALENDAR_EXCEPTIONS: 'calendarExceptions',
  CALENDAR_EXCEPTION_DETAILS: 'calendarExceptionDetails',
  
  // Leave
  LEAVE_REQUESTS: 'leaveRequests',
  LEAVE_REQUEST_DETAILS: 'leaveRequestDetails',
  
  // Organization
  ORGANIZATION: 'organization',
  ORGANIZATION_DETAILS: 'organizationDetails',
  
  // Preferences
  PREFERENCES: 'preferences',
  HOLIDAYS: 'holidays',
  HOLIDAY_CALENDAR: 'holidayCalendar',
  WORKING_DAY_POLICY: 'workingDayPolicy',
  
  // Functional query keys
  CALENDAR_EXCEPTION_DETAIL: (id: string) => ['calendarExceptionDetails', id] as const,
} as const;

// Helper function to create filtered query keys
export const createFilteredQueryKey = (baseKey: string, filters: Record<string, unknown>) => {
  return [baseKey, { filters }];
};
