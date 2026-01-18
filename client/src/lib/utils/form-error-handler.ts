/**
 * Form Error Handling Utilities
 * 
 * Provides reusable functions for handling backend validation errors
 * and mapping them to form fields using React Hook Form.
 */

import { UseFormSetError, FieldValues, Path } from "react-hook-form";

/**
 * Backend validation error response structure
 */
interface BackendValidationError {
  status?: string;
  message?: string;
  data?: any;
  errors?: Record<string, string[]>;
  code?: number;
}

/**
 * Parse backend error and extract validation errors
 * @param error - The error object from API call
 * @returns Parsed error data or null if not a validation error
 */
export function parseBackendValidationError(error: unknown): BackendValidationError | null {
  try {
    const errorText = (error as { message?: string })?.message || "";
    const jsonMatch = errorText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const errorData = JSON.parse(jsonMatch[0]) as BackendValidationError;
      
      if (errorData.errors && typeof errorData.errors === 'object') {
        return errorData;
      }
    }
  } catch (parseError) {
    // If parsing fails, return null
    return null;
  }
  
  return null;
}

/**
 * Set form field errors from backend validation response
 * 
 * Core error mapping strategy: Extract backend validation errors from API response,
 * then map to form fields using optional fieldMap (backend_name -> form_name).
 * Returns true if any field errors were set, allowing callers to skip generic error toast.
 * 
 * @param error - The error object from API call
 * @param setError - React Hook Form's setError function
 * @param fieldMap - Optional mapping from backend field names to form field names
 * @returns true if field errors were set, false otherwise
 */
export function setFormFieldErrors<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
  fieldMap?: Record<string, Path<TFieldValues>>
): boolean {
  const errorData = parseBackendValidationError(error);
  
  if (!errorData || !errorData.errors) {
    return false;
  }
  
  let hasFieldError = false;
  
  Object.entries(errorData.errors).forEach(([field, messages]) => {
    if (Array.isArray(messages) && messages.length > 0) {
      // Use field map if provided, otherwise use field name directly
      const formField = fieldMap?.[field] || (field as Path<TFieldValues>);
      
      setError(formField, {
        type: 'manual',
        message: messages[0],
      });
      
      hasFieldError = true;
    }
  });
  
  return hasFieldError;
}

/**
 * Get a user-friendly error message from backend error
 * @param error - The error object from API call
 * @param defaultMessage - Default message if parsing fails
 * @returns Error message string
 */
export function getErrorMessage(error: unknown, defaultMessage: string = "An error occurred"): string {
  const errorData = parseBackendValidationError(error);
  
  if (errorData?.message) {
    return errorData.message;
  }
  
  return (error as { message?: string })?.message || defaultMessage;
}
