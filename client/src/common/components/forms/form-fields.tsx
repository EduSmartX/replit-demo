/**
 * Reusable Form Field Components
 * Common form field patterns used across different forms
 */

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BLOOD_GROUP_OPTIONS, GENDER_OPTIONS } from "@/lib/constants/choices";
import type { Control, FieldValues, Path } from "react-hook-form";

/**
 * Text Input Field Props
 */
interface TextInputFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  description?: string;
  type?: "text" | "email" | "tel" | "number" | "date" | "password";
  max?: string;
  min?: string;
  readOnly?: boolean;
}

export function TextInputField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
  description,
  type = "text",
  max,
  min,
  readOnly = false,
}: TextInputFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label} {required && <span className="text-red-500">*</span>}
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              type={type}
              disabled={disabled}
              readOnly={readOnly}
              placeholder={placeholder}
              max={max}
              min={min}
              className={
                readOnly
                  ? "cursor-not-allowed bg-gray-50 text-gray-700"
                  : "disabled:cursor-default disabled:opacity-100"
              }
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/**
 * Select Field Props
 */
interface SelectFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  description?: string;
  options: Array<{ value: string; label: string }>;
}

export function SelectField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = "Select an option",
  required = false,
  disabled = false,
  description,
  options,
}: SelectFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        return (
          <FormItem>
            <FormLabel>
              {label} {required && <span className="text-red-500">*</span>}
            </FormLabel>
            <Select
              key={field.value as string}
              onValueChange={field.onChange}
              value={field.value as string}
              defaultValue={field.value as string}
              disabled={disabled}
            >
              <FormControl>
                <SelectTrigger className="disabled:cursor-default disabled:opacity-100">
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="max-h-[300px] overflow-y-auto">
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

/**
 * Blood Group Field
 */
interface BloodGroupFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  disabled?: boolean;
}

export function BloodGroupField<T extends FieldValues>({
  control,
  name,
  disabled = false,
}: BloodGroupFieldProps<T>) {
  return (
    <SelectField
      control={control}
      name={name}
      label="Blood Group"
      placeholder="Select blood group"
      disabled={disabled}
      options={BLOOD_GROUP_OPTIONS}
    />
  );
}

/**
 * Gender Field
 */
interface GenderFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  disabled?: boolean;
  required?: boolean;
}

export function GenderField<T extends FieldValues>({
  control,
  name,
  disabled = false,
  required = false,
}: GenderFieldProps<T>) {
  return (
    <SelectField
      control={control}
      name={name}
      label="Gender"
      placeholder="Select gender"
      disabled={disabled}
      required={required}
      options={[...GENDER_OPTIONS] as { value: string; label: string }[]}
    />
  );
}

/**
 * Multi-Select Field Props (Dropdown with chips)
 */
interface MultiSelectFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  description?: string;
  disabled?: boolean;
  options: Array<{ id: number | string; name: string; code?: string }>;
  loading?: boolean;
  placeholder?: string;
}

export function MultiSelectField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled = false,
  options,
  loading = false,
  placeholder = "Select options...",
}: MultiSelectFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selectedIds = (field.value as Array<string | number>) || [];
        const selectedOptions = options.filter((opt) => selectedIds.includes(opt.id));

        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <div className="space-y-2">
                <Select
                  disabled={disabled || loading}
                  onValueChange={(value) => {
                    const numValue = parseInt(value);
                    if (!selectedIds.includes(numValue)) {
                      field.onChange([...selectedIds, numValue]);
                    }
                  }}
                >
                  <SelectTrigger className="disabled:cursor-default disabled:opacity-100">
                    <SelectValue placeholder={loading ? "Loading..." : placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {options
                      .filter((opt) => !selectedIds.includes(opt.id))
                      .map((option) => (
                        <SelectItem key={option.id} value={option.id.toString()}>
                          {option.name} {option.code && `(${option.code})`}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                {/* Selected items as chips */}
                {selectedOptions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedOptions.map((option) => (
                      <div
                        key={option.id}
                        className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700"
                      >
                        <span>
                          {option.name} {option.code && `(${option.code})`}
                        </span>
                        {!disabled && (
                          <button
                            type="button"
                            onClick={() => {
                              field.onChange(selectedIds.filter((id) => id !== option.id));
                            }}
                            className="ml-1 rounded-full hover:bg-purple-200"
                          >
                            <span className="sr-only">Remove {option.name}</span>
                            <svg
                              className="h-3 w-3"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

/**
 * Date Input Field
 * Standardized date input field for consistent date handling across the application
 */
interface DateInputFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  required?: boolean;
  disabled?: boolean;
  description?: string;
  max?: Date;
  min?: Date;
}

export function DateInputField<T extends FieldValues>({
  control,
  name,
  label,
  required = false,
  disabled = false,
  description,
  max,
  min,
}: DateInputFieldProps<T>) {
  return (
    <TextInputField
      control={control}
      name={name}
      label={label}
      type="date"
      required={required}
      disabled={disabled}
      description={description}
      max={max ? max.toISOString().split("T")[0] : undefined}
      min={min ? min.toISOString().split("T")[0] : undefined}
    />
  );
}
