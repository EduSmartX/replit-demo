// Standardized pagination configuration
export const PAGE_SIZES = {
  SMALL: 10,
  MEDIUM: 25,
  LARGE: 100,
  EXTRA_LARGE: 500,
} as const;

// Stale time constants for React Query (in milliseconds)
export const STALE_TIMES = {
  SHORT: 1000 * 60, // 1 minute
  MODERATE: 1000 * 60 * 2, // 2 minutes
  MEDIUM: 1000 * 60 * 3, // 3 minutes
  STATIC: 1000 * 60 * 5, // 5 minutes - for relatively static data like classes, subjects
  LONG: 1000 * 60 * 10, // 10 minutes
} as const;
