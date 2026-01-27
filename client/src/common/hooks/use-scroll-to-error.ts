/**
 * Custom hook to automatically scroll to the first form field with a validation error
 * Handles fixed headers and properly scrolls select/dropdown fields into view
 * Usage: useScrollToError(form.formState.errors);
 */

import { useEffect } from "react";
import type { FieldErrors } from "react-hook-form";

export function useScrollToError(errors: FieldErrors) {
  useEffect(() => {
    const firstError = Object.keys(errors)[0];
    if (firstError) {
      // Small delay to ensure DOM is updated with error messages
      setTimeout(() => {
        // Try multiple selectors to find the error field
        // This handles both input fields and select/dropdown fields
        let errorElement = 
          document.querySelector(`[name="${firstError}"]`) ||
          document.querySelector(`#${firstError}`) ||
          document.querySelector(`[id*="${firstError}"]`);
        
        // If not found, look for the form field container
        if (!errorElement) {
          const formField = document.querySelector(`[data-field-name="${firstError}"]`);
          if (formField) {
            errorElement = formField;
          }
        }
        
        if (errorElement) {
          // Calculate offset for fixed header (adjust this value based on your header height)
          const headerOffset = 100; // pixels
          const elementPosition = errorElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          
          // Focus the element if it's focusable
          if (errorElement instanceof HTMLElement && typeof errorElement.focus === 'function') {
            setTimeout(() => {
              errorElement.focus();
            }, 300);
          }
        }
      }, 100);
    }
  }, [errors]);
}
