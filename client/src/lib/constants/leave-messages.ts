/**
 * Leave Management Messages Constants
 * Centralized messages for leave-related features
 */

/**
 * Leave Allocation Validation Messages
 */
export const LeaveAllocationValidationMessages = {
  // Leave type validation
  LEAVE_TYPE_REQUIRED: "Please select a leave type",
  LEAVE_TYPE_INVALID: "Please select a valid leave type",
  
  // Days validation
  TOTAL_DAYS_REQUIRED: "Total days is required",
  TOTAL_DAYS_POSITIVE: "Must be a positive number",
  CARRY_FORWARD_DAYS_REQUIRED: "Carry forward days is required",
  CARRY_FORWARD_DAYS_POSITIVE: "Must be a positive number",
  CARRY_FORWARD_EXCEEDS_TOTAL: "Carry forward days cannot be greater than Total days",
  
  // Roles validation
  ROLES_REQUIRED: "Please select at least one role",
  
  // Date validation
  EFFECTIVE_FROM_REQUIRED: "Effective from date is required",
  EFFECTIVE_TO_BEFORE_FROM: "Effective to date must be after Effective from date",
} as const;

/**
 * Working Day Policy Validation Messages
 */
export const WorkingDayPolicyValidationMessages = {
  EFFECTIVE_FROM_REQUIRED: "Effective from date is required",
  EFFECTIVE_TO_BEFORE_FROM: "Effective to date must be on or after the effective from date",
  SATURDAY_PATTERN_REQUIRED: "Saturday off pattern is required",
} as const;

/**
 * Leave Allocation Success Messages
 */
export const LeaveAllocationSuccessMessages = {
  CREATED: "Leave allocation created successfully",
  UPDATED: "Leave allocation updated successfully",
  DELETED: "Leave allocation deleted successfully",
  POLICY_CREATED: "Leave allocation policy has been created successfully",
  POLICY_UPDATED: "Leave allocation policy has been updated successfully",
} as const;

/**
 * Leave Allocation Error Messages
 */
export const LeaveAllocationErrorMessages = {
  CREATE_FAILED: "Failed to create leave allocation",
  UPDATE_FAILED: "Failed to update leave allocation",
  DELETE_FAILED: "Failed to delete leave allocation",
  FETCH_FAILED: "Failed to fetch leave allocation details",
  LEAVE_TYPE_REQUIRED_ERROR: "Leave type is required",
} as const;

/**
 * Working Day Policy Success Messages
 */
export const WorkingDayPolicySuccessMessages = {
  CREATED: "Working day policy created successfully",
  UPDATED: "Working day policy updated successfully",
} as const;

/**
 * Working Day Policy Error Messages
 */
export const WorkingDayPolicyErrorMessages = {
  CREATE_FAILED: "Failed to create working day policy",
  UPDATE_FAILED: "Failed to update working day policy",
  FETCH_FAILED: "Failed to fetch working day policy",
} as const;

/**
 * Combined Leave Messages Export
 */
export const LeaveMessages = {
  Validation: LeaveAllocationValidationMessages,
  Success: LeaveAllocationSuccessMessages,
  Error: LeaveAllocationErrorMessages,
} as const;

/**
 * Combined Working Day Policy Messages Export
 */
export const WorkingDayPolicyMessages = {
  Validation: WorkingDayPolicyValidationMessages,
  Success: WorkingDayPolicySuccessMessages,
  Error: WorkingDayPolicyErrorMessages,
} as const;
