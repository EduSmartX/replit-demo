/**
 * Error Handling Utilities
 * Provides user-friendly error messages and error parsing
 */

import type { UseFormSetError, FieldValues, Path } from "react-hook-form";

// ============================================================================
// Types
// ============================================================================

export interface ParsedError {
  title: string;
  message: string;
  details?: string;
}

// ============================================================================
// Error Parsing Functions
// ============================================================================

/**
 * Parse API error response into user-friendly message
 */
export function parseApiError(error: any): ParsedError {
  const defaultError: ParsedError = {
    title: "Something went wrong",
    message: "An unexpected error occurred. Please try again later.",
  };

  if (!error) {
    return defaultError;
  }

  if (typeof error === "string") {
    try {
      const parsed = JSON.parse(error);
      return parseErrorObject(parsed);
    } catch {
      return {
        title: "Error",
        message: error || defaultError.message,
      };
    }
  }

  if (error instanceof Error) {
    return {
      title: "Error",
      message: getUserFriendlyMessage(error.message),
    };
  }

  if (typeof error === "object") {
    return parseErrorObject(error);
  }

  return defaultError;
}

/**
 * Parse error object from API response
 */
function parseErrorObject(errorObj: any): ParsedError {
  const result: ParsedError = {
    title: "Error",
    message: "An error occurred. Please try again.",
  };

  if (errorObj.message) {
    result.message = getUserFriendlyMessage(errorObj.message);
  }

  if (errorObj.errors) {
    const errors = errorObj.errors;
    
    if (typeof errors === "object" && !Array.isArray(errors)) {
      const errorFields = Object.keys(errors);
      if (errorFields.length > 0) {
        const firstField = errorFields[0];
        const firstError = errors[firstField];
        
        if (Array.isArray(firstError) && firstError.length > 0) {
          result.message = `${formatFieldName(firstField)}: ${firstError[0]}`;
        } else if (typeof firstError === "string") {
          result.message = getUserFriendlyMessage(firstError);
        } else {
          result.details = JSON.stringify(errors, null, 2);
        }
      }
    } else if (typeof errors === "string") {
      result.message = getUserFriendlyMessage(errors);
    }
  }

  if (errorObj.detail) {
    result.message = getUserFriendlyMessage(errorObj.detail);
  }

  if (errorObj.code || errorObj.status) {
    const code = errorObj.code || errorObj.status;
    result.title = getErrorTitleByCode(code);
  }

  return result;
}

/**
 * Convert technical error messages to user-friendly ones
 */
function getUserFriendlyMessage(message: string): string {
  if (!message) {
    return "An unexpected error occurred. Please try again.";
  }

  const patterns: Record<string, string> = {
    "NoneType": "Data is missing or unavailable. Please refresh and try again.",
    "object has no attribute": "System configuration error. Please contact support.",
    "Internal server error": "The server encountered an error. Please try again later.",
    "Network request failed": "Unable to connect to the server. Please check your internet connection.",
    "Failed to fetch": "Unable to load data. Please check your connection and try again.",
    "Authentication required": "Please log in to continue.",
    "Unauthorized": "You don't have permission to perform this action.",
    "Forbidden": "Access denied. Please contact your administrator.",
    "Not found": "The requested information could not be found.",
    "Timeout": "The request took too long. Please try again.",
    "Invalid": "The information provided is not valid. Please check and try again.",
  };

  for (const [pattern, friendly] of Object.entries(patterns)) {
    if (message.toLowerCase().includes(pattern.toLowerCase())) {
      return friendly;
    }
  }

  if (message.includes("'") || message.includes('"') || message.includes("{")) {
    return "A technical error occurred. Please try again or contact support if the problem persists.";
  }

  return message;
}

/**
 * Get error title based on HTTP status code
 */
function getErrorTitleByCode(code: number): string {
  if (code >= 500) {
    return "Server Error";
  } else if (code === 404) {
    return "Not Found";
  } else if (code === 403) {
    return "Access Denied";
  } else if (code === 401) {
    return "Authentication Required";
  } else if (code >= 400) {
    return "Request Error";
  }
  return "Error";
}

/**
 * Format field name from snake_case to Title Case
 */
function formatFieldName(fieldName: string): string {
  return fieldName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: any): boolean {
  if (!error) {return false;}
  
  const message = error.message || error.toString();
  return (
    message.includes("Network") ||
    message.includes("fetch") ||
    message.includes("ERR_CONNECTION") ||
    message.includes("ERR_NETWORK")
  );
}

/**
 * Get a short error message suitable for toasts
 */
export function getShortErrorMessage(error: any): string {
  const parsed = parseApiError(error);
  
  if (parsed.message.length > 100) {
    return `${parsed.message.substring(0, 97)  }...`;
  }
  
  return parsed.message;
}

/**
 * Check if error indicates a deleted duplicate record exists
 */
export function isDeletedDuplicateError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {return false;}
  
  const err = error as any;
  
  let errors = err.errors;
  
  if (!errors && err.response?.errors) {
    errors = err.response.errors;
  }
  
  if (!errors) {return false;}
  
  if (errors.has_deleted_duplicate === true ||
      errors.has_deleted_duplicate?.[0] === "True") {
    return true;
  }
  
  if (Array.isArray(errors.detail) && errors.detail.length > 0) {
    const firstDetail = errors.detail[0];
    return firstDetail?.has_deleted_duplicate === true ||
           firstDetail?.has_deleted_duplicate?.[0] === "True";
  }
  
  return false;
}

/**
 * Extract user-friendly message from deleted duplicate error
 */
export function getDeletedDuplicateMessage(error: unknown): string {
  const err = error as any;
  let errors = err.errors;
  
  if (!errors && err.response?.errors) {
    errors = err.response.errors;
  }
  
  if (!errors) {
    return "A deleted record with the same details already exists.";
  }
  
  if (errors.non_field_errors?.[0]) {
    return errors.non_field_errors[0];
  }
  
  if (Array.isArray(errors.detail) && errors.detail.length > 0) {
    const firstDetail = errors.detail[0];
    if (firstDetail?.non_field_errors?.[0]) {
      return firstDetail.non_field_errors[0];
    }
  }
  
  return "A deleted record with the same details already exists.";
}

/**
 * Extract deleted record ID from deleted duplicate error
 */
export function getDeletedRecordId(error: unknown): string | null {
  const err = error as any;  
  let errors = err.errors;
    
  if (!errors && err.response?.errors) {
    errors = err.response.errors;
  }
  
  if (!errors) {return null;}

  if (errors.deleted_record_id) {
    return errors.deleted_record_id;
  }

  if (Array.isArray(errors.detail) && errors.detail.length > 0) {
    const firstDetail = errors.detail[0];
    if (firstDetail?.deleted_record_id) {
      return firstDetail.deleted_record_id;
    }
  }
  
  return null;
}

/**
 * Extract user-friendly error message from any API error
 * Handles validation errors, non-field errors, and general errors
 */
export function getApiErrorMessage(error: unknown): string {
  const err = error as any;
  const errors = err.errors || err.response?.errors;
  
  if (!errors) {
    return err.message || "An unexpected error occurred";
  }

  // Check for non-field errors
  if (errors.non_field_errors?.[0]) {
    return errors.non_field_errors[0];
  }
  
  if (Array.isArray(errors.detail)) {
    if (errors.detail.length > 0) {
      const firstDetail = errors.detail[0];
      
      if (typeof firstDetail === 'string') {
        return firstDetail;
      }
      
      if (firstDetail?.non_field_errors?.[0]) {
        return firstDetail.non_field_errors[0];
      }
    }
  }
  
  const errorKeys = Object.keys(errors).filter(key => 
    key !== 'has_deleted_duplicate' && key !== 'detail'
  );
  
  if (errorKeys.length > 0) {
    const firstKey = errorKeys[0];
    const fieldError = errors[firstKey];
    
    if (Array.isArray(fieldError) && fieldError.length > 0) {
      const fieldName = firstKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      return `${fieldName}: ${fieldError[0]}`;
    }
  }
  
  return err.message || "An unexpected error occurred";
}

/**
 * Extract and set field validation errors from API response to react-hook-form
 * Returns true if field errors were found and set, false otherwise
 */
export function setFormFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>
): boolean {
  const err = error as any;
  const errors = err?.errors || err?.response?.errors;

  if (!errors || typeof errors !== "object") {
    return false;
  }

  let hasFieldErrors = false;

  Object.keys(errors).forEach((field) => {
    // Skip non-field error keys
    if (field === "has_deleted_duplicate" || field === "detail" || field === "non_field_errors") {
      return;
    }

    const errorMessages = errors[field];
    const message = Array.isArray(errorMessages) ? errorMessages[0] : errorMessages;

    if (message && typeof message === "string") {
      setError(field as Path<T>, {
        type: "manual",
        message,
      });
      hasFieldErrors = true;
    }
  });

  return hasFieldErrors;
}