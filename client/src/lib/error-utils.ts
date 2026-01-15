/**
 * Error Handling Utilities
 * Provides user-friendly error messages and error parsing
 */

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
  // Default error
  const defaultError: ParsedError = {
    title: "Something went wrong",
    message: "An unexpected error occurred. Please try again later.",
  };

  // If error is null or undefined
  if (!error) {
    return defaultError;
  }

  // If error is a string
  if (typeof error === "string") {
    try {
      // Try to parse if it's a JSON string
      const parsed = JSON.parse(error);
      return parseErrorObject(parsed);
    } catch {
      // If not JSON, return as is
      return {
        title: "Error",
        message: error || defaultError.message,
      };
    }
  }

  // If error is an Error object
  if (error instanceof Error) {
    return {
      title: "Error",
      message: getUserFriendlyMessage(error.message),
    };
  }

  // If error is an object
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

  // Extract message from various formats
  if (errorObj.message) {
    result.message = getUserFriendlyMessage(errorObj.message);
  }

  // Check for specific error details
  if (errorObj.errors) {
    const errors = errorObj.errors;
    
    // If errors is an object with field-specific errors
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
    }
    // If errors is a string (like detail)
    else if (typeof errors === "string") {
      result.message = getUserFriendlyMessage(errors);
    }
  }

  // Check for detail field
  if (errorObj.detail) {
    result.message = getUserFriendlyMessage(errorObj.detail);
  }

  // Check status code for specific messages
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

  // Common error patterns and their user-friendly versions
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

  // Check for pattern matches
  for (const [pattern, friendly] of Object.entries(patterns)) {
    if (message.toLowerCase().includes(pattern.toLowerCase())) {
      return friendly;
    }
  }

  // If message looks technical (has quotes, brackets, etc.), provide generic message
  if (message.includes("'") || message.includes('"') || message.includes("{")) {
    return "A technical error occurred. Please try again or contact support if the problem persists.";
  }

  // Return original message if it seems user-friendly
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
  if (!error) return false;
  
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
  
  // For toasts, keep it concise
  if (parsed.message.length > 100) {
    return parsed.message.substring(0, 97) + "...";
  }
  
  return parsed.message;
}
