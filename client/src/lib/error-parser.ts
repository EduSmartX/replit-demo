import { ErrorMessages } from "./constants";

/**
 * Parse API error response and extract meaningful error message
 * 
 * Multi-level error extraction strategy:
 * 1. Extract JSON from error.message string
 * 2. Handle nested error structures (errors.detail, non_field_errors)
 * 3. Prefer specific field validation error over generic message
 * 4. Fallback to error.message or defaultMessage
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
          if (Array.isArray(errorData.errors.detail)) {
            for (const detailError of errorData.errors.detail) {              
              if (detailError.non_field_errors && Array.isArray(detailError.non_field_errors)) {
                if (detailError.non_field_errors.length > 0) {
                  return detailError.non_field_errors[0];
                }
              }              
              const fieldKeys = Object.keys(detailError);
              if (fieldKeys.length > 0) {
                const firstField = detailError[fieldKeys[0]];
                if (Array.isArray(firstField) && firstField.length > 0) {
                  return firstField[0];
                }
              }
            }
          }
          
          // Handle direct field errors
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
