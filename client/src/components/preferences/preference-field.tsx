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

interface PreferenceFieldProps {
  preference: Preference;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  disabled?: boolean;
}

export function PreferenceField({
  preference,
  value,
  onChange,
  disabled = false,
}: PreferenceFieldProps) {
  const [multiSelectInput, setMultiSelectInput] = useState("");

  const handleMultiSelectAdd = (val: string) => {
    const currentValues = Array.isArray(value) ? value : [];
    if (val && !currentValues.includes(val)) {
      onChange([...currentValues, val]);
    }
  };

  const handleMultiSelectRemove = (val: string) => {
    const currentValues = Array.isArray(value) ? value : [];
    onChange(currentValues.filter((v) => v !== val));
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
      return (
        <div className="space-y-1.5">
          <Label htmlFor={preference.key}>{preference.display_name}</Label>
          <Input
            id={preference.key}
            type="text"
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={preference.default_value}
          />
        </div>
      );

    case "number":
      return (
        <div className="space-y-1.5">
          <Label htmlFor={preference.key}>{preference.display_name}</Label>
          <Input
            id={preference.key}
            type="number"
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            placeholder={preference.default_value}
          />
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
