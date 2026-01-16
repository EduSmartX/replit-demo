import { Control } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { formatDateForInput } from "@/lib/utils/date-utils";

interface DateRangeFieldsProps {
  control: Control<{
    effective_from: Date;
    effective_to?: Date;
  }>;
  effectiveFrom: Date | undefined;
  disabled?: boolean;
}

export function DateRangeFields({
  control,
  effectiveFrom,
  disabled = false,
}: DateRangeFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Effective From */}
      <FormField
        control={control}
        name="effective_from"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Effective From *</FormLabel>
            <FormControl>
              <Input
                type="date"
                disabled={disabled}
                value={field.value ? formatDateForInput(field.value) : ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value) {
                    field.onChange(new Date(value + "T00:00:00"));
                  } else {
                    field.onChange(undefined);
                  }
                }}
                className="w-full"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Effective To */}
      <FormField
        control={control}
        name="effective_to"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Effective To (Optional)</FormLabel>
            <FormControl>
              <Input
                type="date"
                disabled={disabled}
                value={field.value ? formatDateForInput(field.value) : ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value) {
                    field.onChange(new Date(value + "T00:00:00"));
                  } else {
                    field.onChange(undefined);
                  }
                }}
                min={effectiveFrom ? formatDateForInput(effectiveFrom) : undefined}
                className="w-full"
              />
            </FormControl>
            <FormDescription>Leave blank for no expiry</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
