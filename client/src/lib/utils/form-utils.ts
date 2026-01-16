/**
 * Form Utility Functions
 * Reusable utilities for form operations across different entities
 */

import { UseMutationResult } from "@tanstack/react-query";

/**
 * Generic API Response Types
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  code: number;
}

export interface PaginatedApiResponse<T> {
  success: boolean;
  message: string;
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
  };
  code: number;
}

/**
 * Form mode type
 */
export type FormMode = "create" | "view" | "edit";

/**
 * Common form configuration
 */
export interface FormConfig {
  mode: FormMode;
  title: string;
  description: string;
  submitButtonText: string;
  successMessage: string;
}

/**
 * Get form configuration based on mode
 */
export function getFormConfig(mode: FormMode, entityName: string): FormConfig {
  const configs: Record<FormMode, FormConfig> = {
    create: {
      mode: "create",
      title: `Add New ${entityName}`,
      description: `Fill in the ${entityName.toLowerCase()} information below`,
      submitButtonText: `Create ${entityName}`,
      successMessage: `${entityName} Created!`,
    },
    view: {
      mode: "view",
      title: `${entityName} Details`,
      description: `View ${entityName.toLowerCase()} information`,
      submitButtonText: "Back to List",
      successMessage: "",
    },
    edit: {
      mode: "edit",
      title: `Edit ${entityName}`,
      description: `Update ${entityName.toLowerCase()} information`,
      submitButtonText: `Update ${entityName}`,
      successMessage: `${entityName} Updated!`,
    },
  };

  return configs[mode];
}

/**
 * Check if form is in specific mode
 */
export function isFormMode(mode: FormMode, checkMode: FormMode | FormMode[]): boolean {
  if (Array.isArray(checkMode)) {
    return checkMode.includes(mode);
  }
  return mode === checkMode;
}

/**
 * Format date for input field (YYYY-MM-DD)
 */
export function formatDateForInput(date: string | Date | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}

/**
 * Parse local date string without timezone conversion
 */
export function parseLocalDate(dateString: string | undefined): Date | undefined {
  if (!dateString) return undefined;
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
}

/**
 * Handle form mutation success with optional callbacks
 */
export interface MutationSuccessOptions {
  onSuccess?: () => void;
  setShowSuccess?: (show: boolean) => void;
  successDuration?: number;
}

export function handleMutationSuccess(options: MutationSuccessOptions) {
  const { onSuccess, setShowSuccess, successDuration = 2000 } = options;

  if (setShowSuccess) {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onSuccess?.();
    }, successDuration);
  } else {
    onSuccess?.();
  }
}

/**
 * Extract validation errors from API error response
 */
export function extractValidationErrors(error: any): Record<string, string[]> {
  try {
    const errorText = error?.message || "";
    const jsonMatch = errorText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const errorData = JSON.parse(jsonMatch[0]);
      return errorData.errors || {};
    }
  } catch (e) {
    // Parsing failed
  }
  return {};
}

/**
 * Format validation error for display
 */
export function formatValidationError(errors: Record<string, string[]>): string {
  const errorMessages: string[] = [];
  Object.entries(errors).forEach(([field, messages]) => {
    if (Array.isArray(messages) && messages.length > 0) {
      errorMessages.push(`${field}: ${messages[0]}`);
    }
  });
  return errorMessages.join(", ") || "Validation error occurred";
}

/**
 * Clean empty strings from payload
 */
export function cleanPayload<T extends Record<string, any>>(payload: T): T {
  const cleaned: any = {};
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      cleaned[key] = value;
    }
  });
  return cleaned as T;
}

/**
 * Convert number fields to integers in payload
 */
export function convertNumberFields<T extends Record<string, any>>(
  payload: T,
  fields: string[]
): T {
  const converted = { ...payload };
  fields.forEach((field) => {
    if (converted[field] && typeof converted[field] === "string") {
      const num = parseInt(converted[field] as string, 10);
      if (!isNaN(num)) {
        converted[field] = num as any;
      }
    }
  });
  return converted;
}

/**
 * Generic CRUD state management
 */
export interface CrudState<T> {
  viewMode: "list" | "create" | "view" | "edit";
  selectedItem: T | null;
  showSuccess: boolean;
}

export function createInitialCrudState<T>(): CrudState<T> {
  return {
    viewMode: "list",
    selectedItem: null,
    showSuccess: false,
  };
}

/**
 * Generic CRUD actions
 */
export interface CrudActions<T> {
  handleCreate: () => void;
  handleView: (item: T) => void;
  handleEdit: (item: T) => void;
  handleDelete: (id: string) => void;
  handleCancel: () => void;
  handleSuccess: () => void;
}

export function createCrudActions<T>(
  setState: (state: Partial<CrudState<T>>) => void,
  deleteAction: (id: string) => void,
  setLocation?: (path: string) => void,
  basePath: string = ""
): CrudActions<T> {
  return {
    handleCreate: () => {
      setState({ viewMode: "create", selectedItem: null });
      if (setLocation) setLocation(`${basePath}/create`);
    },
    handleView: (item: T) => {
      setState({ viewMode: "view", selectedItem: item });
      const id = (item as any).public_id || (item as any).id;
      if (setLocation && id) setLocation(`${basePath}/${id}`);
    },
    handleEdit: (item: T) => {
      setState({ viewMode: "edit", selectedItem: item });
      const id = (item as any).public_id || (item as any).id;
      if (setLocation && id) setLocation(`${basePath}/${id}/edit`);
    },
    handleDelete: (id: string) => {
      deleteAction(id);
    },
    handleCancel: () => {
      setState({ viewMode: "list", selectedItem: null });
      if (setLocation) setLocation(basePath);
    },
    handleSuccess: () => {
      setState({ showSuccess: true });
      setTimeout(() => {
        setState({ showSuccess: false, viewMode: "list", selectedItem: null });
        if (setLocation) setLocation(basePath);
      }, 2000);
    },
  };
}
