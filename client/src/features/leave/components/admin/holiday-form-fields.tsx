/**
 * Holiday Form Fields Component
 * Reusable form fields for creating and editing holidays
 */

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HOLIDAY_TYPE_OPTIONS } from "@/lib/api/holiday-api";
import type { CreateHolidayPayload } from "@/lib/api/holiday-api";


interface HolidayFormFieldsProps {
  formData: CreateHolidayPayload;
  onUpdate: (field: keyof CreateHolidayPayload, value: any) => void;
  showLabels?: boolean;
  compact?: boolean;
}

export function HolidayFormFields({
  formData,
  onUpdate,
  showLabels = true,
  compact = false,
}: HolidayFormFieldsProps) {
  return (
    <>
      {/* Start Date */}
      <div className={showLabels ? "space-y-2" : ""}>
        {showLabels && <Label htmlFor="start_date">Start Date *</Label>}
        <Input
          id="start_date"
          type="date"
          value={formData.start_date}
          onChange={(e) => onUpdate("start_date", e.target.value)}
          className={compact ? "text-sm" : ""}
          required
        />
      </div>

      {/* End Date */}
      <div className={showLabels ? "space-y-2" : ""}>
        {showLabels && <Label htmlFor="end_date">End Date (Optional)</Label>}
        <Input
          id="end_date"
          type="date"
          value={formData.end_date || ""}
          onChange={(e) => onUpdate("end_date", e.target.value || undefined)}
          min={formData.start_date}
          placeholder="Same as start"
          className={compact ? "text-sm" : ""}
        />
      </div>

      {/* Holiday Type */}
      <div className={showLabels ? "space-y-2" : ""}>
        {showLabels && <Label htmlFor="holiday_type">Type *</Label>}
        <Select
          value={formData.holiday_type}
          onValueChange={(value) => onUpdate("holiday_type", value)}
        >
          <SelectTrigger className={compact ? "text-sm" : ""}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HOLIDAY_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className={showLabels ? "space-y-2" : ""}>
        {showLabels && <Label htmlFor="description">Description *</Label>}
        <Input
          id="description"
          type="text"
          value={formData.description}
          onChange={(e) => onUpdate("description", e.target.value)}
          placeholder="e.g., Diwali"
          className={compact ? "text-sm" : ""}
          required
        />
      </div>
    </>
  );
}

/**
 * Holiday Form Row for Grid Layouts (e.g., bulk add form)
 */
interface HolidayFormRowProps {
  formData: CreateHolidayPayload;
  onUpdate: (field: keyof CreateHolidayPayload, value: any) => void;
}

export function HolidayFormRow({ formData, onUpdate }: HolidayFormRowProps) {
  return (
    <>
      {/* Start Date */}
      <div className="space-y-2">
        <Label>Start Date *</Label>
        <Input
          type="date"
          value={formData.start_date}
          onChange={(e) => onUpdate("start_date", e.target.value)}
          required
        />
      </div>

      {/* End Date */}
      <div className="space-y-2">
        <Label>End Date (Optional)</Label>
        <Input
          type="date"
          value={formData.end_date || ""}
          onChange={(e) => onUpdate("end_date", e.target.value || undefined)}
          min={formData.start_date}
          placeholder="Same as start"
        />
      </div>

      {/* Holiday Type */}
      <div className="space-y-2">
        <Label>Type *</Label>
        <Select
          value={formData.holiday_type}
          onValueChange={(value) => onUpdate("holiday_type", value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HOLIDAY_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label>Description *</Label>
        <Input
          type="text"
          value={formData.description}
          onChange={(e) => onUpdate("description", e.target.value)}
          placeholder="e.g., Diwali"
          required
        />
      </div>
    </>
  );
}

/**
 * Validate holiday form data
 */
export function validateHolidayData(
  formData: CreateHolidayPayload,
  showToast: (options: { title: string; description: string; variant?: "destructive" }) => void
): boolean {
  if (!formData.start_date) {
    showToast({
      title: "Validation Error",
      description: "Start date is required",
      variant: "destructive",
    });
    return false;
  }

  if (!formData.description.trim()) {
    showToast({
      title: "Validation Error",
      description: "Description is required",
      variant: "destructive",
    });
    return false;
  }

  if (formData.end_date && new Date(formData.end_date) < new Date(formData.start_date)) {
    showToast({
      title: "Validation Error",
      description: "End date must be after start date",
      variant: "destructive",
    });
    return false;
  }

  return true;
}


