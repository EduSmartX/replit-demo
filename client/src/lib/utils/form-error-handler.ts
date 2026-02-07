/**
 * Form Error Handling Utilities
 *
 * Provides reusable functions for handling backend validation errors
 * and mapping them to form fields using React Hook Form.
 */

import { toast } from "@/hooks/use-toast";
import type { UseFormSetError, FieldValues, Path } from "react-hook-form";

/**
 * Backend validation error response structure
 */
interface BackendValidationError {
  status?: string;
  message?: string;
  data?: unknown;
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
    // Check if error has response.data structure (from axios)
    if (error && typeof error === "object" && "response" in error) {
      const responseError = error as { response?: { data?: BackendValidationError } };
      if (responseError.response?.data?.errors) {
        return responseError.response.data;
      }
    }

    // Check if error directly has errors property
    if (error && typeof error === "object" && "errors" in error) {
      const errorObj = error as BackendValidationError;
      if (errorObj.errors && typeof errorObj.errors === "object") {
        return errorObj;
      }
    }

    const errorText = (error as { message?: string })?.message || "";
    const jsonMatch = errorText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const errorData = JSON.parse(jsonMatch[0]) as BackendValidationError;

      if (errorData.errors && typeof errorData.errors === "object") {
        return errorData;
      }
    }
  } catch (parseError) {
    return null;
  }

  return null;
}

/**
 * Set form field errors from backend validation response
 *
 * Core error mapping strategy: Extract backend validation errors from API response,
 * then map to form fields using optional fieldMap (backend_name -> form_name).
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
  const errorMessages: string[] = [];

  Object.entries(errorData.errors).forEach(([field, messages]) => {
    if (Array.isArray(messages) && messages.length > 0) {
      const formField = fieldMap?.[field] || (field as Path<TFieldValues>);
      const displayFieldName = formatFieldName(field);

      setError(formField, {
        type: "manual",
        message: messages[0],
      });
      errorMessages.push(`${displayFieldName}: ${messages[0]}`);

      hasFieldError = true;
    }
  });

  // Show toast with all validation errors
  if (hasFieldError && errorMessages.length > 0) {
    toast({
      title: "Validation Error",
      description: errorMessages.join("\n• "),
      variant: "destructive",
    });
  }

  return hasFieldError;
}

/**
 * Format field name from snake_case to Title Case
 */
function formatFieldName(fieldName: string): string {
  // Remove array indices and nested paths
  const cleanField = fieldName.replace(/\.\d+\./g, " ").replace(/\./g, " ");

  return cleanField
    .split(/[_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Get a user-friendly error message from backend error
 * @param error - The error object from API call
 * @param defaultMessage - Default message if parsing fails
 * @returns Error message string
 */
export function getErrorMessage(
  error: unknown,
  defaultMessage: string = "An error occurred"
): string {
  const errorData = parseBackendValidationError(error);

  if (errorData?.message) {
    return errorData.message;
  }

  return (error as { message?: string })?.message || defaultMessage;
}
