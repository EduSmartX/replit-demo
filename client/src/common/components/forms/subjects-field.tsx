/**
 * Subjects Multi-Select Field Component
 * Reusable multi-select dropdown for selecting subjects
 * Fetches subjects from API with chips display
 */

import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest, type ApiResponse } from "@/lib/api";
import type { Control, FieldValues, Path } from "react-hook-form";

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export interface Subject {
  id: number;
  name: string;
  code: string;
  description?: string;
}

/**
 * Fetch subjects from API
 */
async function fetchSubjects(): Promise<Subject[]> {
  try {
    const response = await apiRequest<ApiResponse<Subject[]>>(
      `${API_BASE_URL}/api/core/subjects/`,
      {
        method: "GET",
      }
    );

    if (!response || typeof response !== "object") {
      return [];
    }

    if ("success" in response && "data" in response) {
      if (!response.success || response.code < 200 || response.code >= 300) {
        console.error("Subjects API Error:", response.message);
        throw new Error(response.message || "Failed to fetch subjects");
      }

      if (Array.isArray(response.data)) {
        return response.data;
      }
    }

    if (Array.isArray(response)) {
      return response as Subject[];
    }

    return [];
  } catch (error) {
    console.error("Fetch subjects error:", error);
    return [];
  }
}

/**
 * Custom hook to fetch subjects
 */
export function useSubjects() {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: fetchSubjects,
    select: (data) => (Array.isArray(data) ? data : []),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

interface SubjectsFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  description?: string;
}

/**
 * Subjects Multi-Select Field
 * Displays subjects as chips with ability to add/remove
 */
export function SubjectsField<T extends FieldValues>({
  control,
  name,
  label = "Subjects",
  placeholder = "Select subjects...",
  disabled = false,
  description,
}: SubjectsFieldProps<T>) {
  const { data: subjects = [], isLoading } = useSubjects();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selectedIds = (field.value as Array<string | number>) || [];
        const selectedSubjects = subjects.filter((subject) =>
          selectedIds.includes(subject.id)
        );

        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <div className="space-y-2">
              <Select
                disabled={disabled || isLoading}
                onValueChange={(value) => {
                  const numValue = parseInt(value);
                  if (!selectedIds.includes(numValue)) {
                    field.onChange([...selectedIds, numValue]);
                  }
                }}
              >
                <FormControl>
                  <SelectTrigger className="disabled:cursor-default disabled:opacity-100">
                    <SelectValue
                      placeholder={isLoading ? "Loading..." : placeholder}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  {subjects
                    .filter((subject) => !selectedIds.includes(subject.id))
                    .map((subject) => (
                      <SelectItem key={subject.id} value={subject.id.toString()}>
                        {subject.name} {subject.code && `(${subject.code})`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {/* Selected subjects as chips */}
              {selectedSubjects.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedSubjects.map((subject) => (
                    <div
                      key={subject.id}
                      className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
                    >
                      <span>{subject.name}</span>
                      {!disabled && (
                        <button
                          type="button"
                          onClick={() => {
                            field.onChange(
                              selectedIds.filter((id) => id !== subject.id)
                            );
                          }}
                          className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
