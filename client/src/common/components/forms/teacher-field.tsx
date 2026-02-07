/**
 * Teacher Field Component (Reusable)
 * Dropdown to select a teacher from organization teachers.
 * Auto-fetches teachers and formats them for display.
 * Used in Class forms and other forms requiring teacher selection.
 */

import { useQuery } from "@tanstack/react-query";
import { fetchTeachers } from "@/lib/api/teacher-api";
import { SelectField } from "./form-fields";
import type { Control, FieldValues } from "react-hook-form";

interface TeacherFieldProps {
  control: Control<FieldValues>;
  name: string;
  disabled?: boolean;
  description?: string;
  required?: boolean;
  label?: string;
}

/**
 * Reusable Teacher Field Component
 * Displays a dropdown of teachers formatted as "Full Name (email)"
 */
export function TeacherField({
  control,
  name,
  disabled = false,
  description,
  required = false,
  label = "Teacher",
}: TeacherFieldProps) {
  const { data: teachersData, isLoading } = useQuery({
    queryKey: ["teachers"],
    queryFn: () => fetchTeachers({ page_size: 100 }),
  });

  const teachers = teachersData?.data || [];

  return (
    <SelectField
      control={control}
      name={name}
      label={label}
      placeholder="Select teacher..."
      options={teachers.map((teacher) => ({
        value: teacher.public_id,
        label: `${teacher.full_name} (${teacher.email})`,
      }))}
      disabled={disabled || isLoading}
      description={description}
      required={required}
    />
  );
}
