import { ErrorMessages } from "./constants";

/**
 * Parse API error response and extract meaningful error message
 * 
 * Multi-level error extraction strategy:
 * 1. Extract JSON from error.message string
 * 2. Prefer specific field validation error over generic message
 * 3. Fallback to error.message or defaultMessage
 * 
 * @param error - The error object from API call
 * @param defaultMessage - Default message if parsing fails
 * @returns Extracted error message
 */
export function parseApiError(
  error: unknown,
  defaultMessage: string = ErrorMessages.Network.SERVER_ERROR
): string {
  let errorMessage = defaultMessage;

  try {
    const errorText = (error as { message?: string })?.message || "";

    // Try to extract JSON from error message
    const jsonMatch = errorText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const errorData = JSON.parse(jsonMatch[0]);

      if (errorData.message) {
        errorMessage = errorData.message;

        // Handle specific validation errors
        if (errorData.errors) {
          const errorFields = Object.keys(errorData.errors);
          if (errorFields.length > 0) {
            const firstError = errorData.errors[errorFields[0]];
            if (Array.isArray(firstError) && firstError.length > 0) {
              errorMessage = firstError[0];
            }
          }
        }
      }
    }
  } catch (parseError) {
    // If parsing fails, use the original error message or default
    errorMessage = (error as { message?: string })?.message || defaultMessage;
  }

  return errorMessage;
}
