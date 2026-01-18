/**
 * Preference Field Component
 * Dynamically renders form fields based on preference type (string, number, radio, select, multi-choice, etc.)
 * Supports various field types with proper validation and user interaction patterns.
 */

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { Preference } from "@/lib/api/preferences-api";
import { cn } from "@/lib/utils";

interface PreferenceFieldProps {
  preference: Preference;
  value: string | string[];
  onChange: (value: string | string[], hasError?: boolean) => void;
  disabled?: boolean;
}

// Validation helper functions
const validateTimeFormat = (value: string): string | null => {
  if (!value) {
    return null;
  }
  
  // Check if format is HH:MM
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
  if (!timeRegex.test(value)) {
    return "Invalid time format. Please use HH:MM format (e.g., 14:30)";
  }
  
  return null;
};

const validateDeadlineDay = (value: string): string | null => {
  if (!value) {
    return null;
  }
  
  const numValue = parseInt(value, 10);
  if (isNaN(numValue)) {
    return "Please enter a valid number";
  }
  
  if (numValue < 1 || numValue > 31) {
    return "Deadline day must be between 1 and 31";
  }
  
  return null;
};

export function PreferenceField({
  preference,
  value,
  onChange,
  disabled = false,
}: PreferenceFieldProps) {
  const [multiSelectInput, setMultiSelectInput] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleMultiSelectAdd = (selectedValue: string) => {
    const currentValues = Array.isArray(value) ? value : [];
    if (selectedValue && !currentValues.includes(selectedValue)) {
      onChange([...currentValues, selectedValue]);
    }
  };

  const handleMultiSelectRemove = (valueToRemove: string) => {
    const currentValues = Array.isArray(value) ? value : [];
    onChange(currentValues.filter((v) => v !== valueToRemove));
  };

  // Parse multi-choice values that come as ["['email']"]
  const parseMultiChoiceValue = (val: string | string[]): string[] => {
    if (Array.isArray(val)) {
      return val.flatMap((v) => {
        if (typeof v === "string" && v.startsWith("['") && v.endsWith("']")) {
          return v
            .slice(2, -2)
            .split("', '")
            .map((item) => item.trim());
        }
        return v;
      });
    }
    return [];
  };

  const currentMultiValues =
    preference.field_type === "multi-choice" ? parseMultiChoiceValue(value) : [];

  switch (preference.field_type) {
    case "string":
      // Check if this is the time field for student absence notification
      const isTimeField = preference.display_name.includes("Preferred Time") && 
                         preference.display_name.includes("Student Absence");
      
      const handleStringChange = (newValue: string) => {
        if (isTimeField) {
          const error = validateTimeFormat(newValue);
          setValidationError(error);
          onChange(newValue, !!error);
        } else {
          onChange(newValue, false);
        }
      };
      
      return (
        <div className="space-y-1.5">
          <Label htmlFor={preference.key}>{preference.display_name}</Label>
          <Input
            id={preference.key}
            type="text"
            value={value as string}
            onChange={(e) => handleStringChange(e.target.value)}
            disabled={disabled}
            placeholder={isTimeField ? "HH:MM (e.g., 14:30)" : preference.default_value}
            className={cn(validationError && "border-red-500 focus-visible:ring-red-500")}
          />
          {validationError && (
            <p className="text-sm font-medium text-red-500">{validationError}</p>
          )}
        </div>
      );

    case "number":
      // Check if this is the deadline day field
      const isDeadlineField = preference.display_name.includes("Teacher Timesheet Deadline") &&
                             preference.display_name.includes("Day");
      
      const handleNumberChange = (newValue: string) => {
        if (isDeadlineField) {
          const error = validateDeadlineDay(newValue);
          setValidationError(error);
          onChange(newValue, !!error);
        } else {
          setValidationError(null);
          onChange(newValue, false);
        }
      };
      
      return (
        <div className="space-y-1.5">
          <Label htmlFor={preference.key}>{preference.display_name}</Label>
          <Input
            id={preference.key}
            type="number"
            value={value as string}
            onChange={(e) => handleNumberChange(e.target.value)}
            disabled={disabled}
            placeholder={preference.default_value}
            min={isDeadlineField ? "1" : undefined}
            max={isDeadlineField ? "31" : undefined}
            className={cn(validationError && "border-red-500 focus-visible:ring-red-500")}
          />
          {validationError && (
            <p className="text-sm font-medium text-red-500">{validationError}</p>
          )}
          {isDeadlineField && !validationError && (
            <p className="text-xs text-muted-foreground">Enter a day between 1 and 31</p>
          )}
        </div>
      );

    case "radio":
      return (
        <div className="space-y-1.5">
          <Label>{preference.display_name}</Label>
          <RadioGroup
            value={value as string}
            onValueChange={onChange}
            disabled={disabled}
          >
            {preference.applicable_values?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${preference.key}-${option}`} />
                <Label
                  htmlFor={`${preference.key}-${option}`}
                  className="font-normal cursor-pointer"
                >
                  {option === "TRUE" ? "Yes" : option === "FALSE" ? "No" : option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      );

    case "choice":
      return (
        <div className="space-y-1.5">
          <Label htmlFor={preference.key}>{preference.display_name}</Label>
          <Select value={value as string} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger id={preference.key}>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {preference.applicable_values?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case "multi-choice":
      return (
        <div className="space-y-1.5">
          <Label htmlFor={preference.key}>{preference.display_name}</Label>
          <div className="space-y-2">
            <Select
              value={multiSelectInput}
              onValueChange={(val) => {
                handleMultiSelectAdd(val);
                setMultiSelectInput("");
              }}
              disabled={disabled}
            >
              <SelectTrigger id={preference.key}>
                <SelectValue placeholder="Select options" />
              </SelectTrigger>
              <SelectContent>
                {preference.applicable_values
                  ?.filter((option) => !currentMultiValues.includes(option))
                  .map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {currentMultiValues.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {currentMultiValues.map((val) => (
                  <Badge
                    key={val}
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-1"
                  >
                    {val}
                    <button
                      type="button"
                      onClick={() => handleMultiSelectRemove(val)}
                      disabled={disabled}
                      className="hover:bg-gray-300 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      );

    default:
      return null;
  }
}
