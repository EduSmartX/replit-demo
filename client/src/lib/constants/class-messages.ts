/**
 * Class/Section Messages Constants
 * Centralized messages for class-related features
 */

/**
 * Class Validation Messages
 */
export const ClassValidationMessages = {
  // Name validation
  NAME_REQUIRED: "Section name is required",
  NAME_MIN_LENGTH: "Section name must be at least 2 characters",
  NAME_MAX_LENGTH: "Section name must not exceed 100 characters",
  
  // Capacity validation
  CAPACITY_POSITIVE: "Capacity must be a positive number",
  CAPACITY_MAX: "Capacity must not exceed 200 students",
  
  // Display order validation
  DISPLAY_ORDER_POSITIVE: "Display order must be a positive number",
} as const;

/**
 * Class Success Messages
 */
export const ClassSuccessMessages = {
  CREATED: "Section has been created successfully",
  UPDATED: "Section has been updated successfully",
  DELETED: "Section has been deleted successfully",
} as const;

/**
 * Class Error Messages
 */
export const ClassErrorMessages = {
  CREATE_FAILED: "Failed to create section",
  UPDATE_FAILED: "Failed to update section",
  DELETE_FAILED: "Failed to delete section",
  FETCH_FAILED: "Failed to fetch section details",
  LIST_FETCH_FAILED: "Failed to fetch sections list",
} as const;

/**
 * Combined Class Messages Export
 */
export const ClassMessages = {
  Validation: ClassValidationMessages,
  Success: ClassSuccessMessages,
  Error: ClassErrorMessages,
} as const;
