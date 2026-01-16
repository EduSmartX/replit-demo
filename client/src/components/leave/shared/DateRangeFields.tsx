import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangeFieldsProps {
  control: Control<{
    effective_from: Date;
    effective_to?: Date;
  }>;
  effectiveFrom: Date | undefined;
  disabled?: boolean;
}

const formatDate = (date: Date | undefined) => {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function DateRangeFields({
  control,
  effectiveFrom,
  disabled = false,
}: DateRangeFieldsProps) {
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Effective From */}
      <FormField
        control={control}
        name="effective_from"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Effective From *</FormLabel>
            <Popover open={fromOpen} onOpenChange={setFromOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    disabled={disabled}
                    type="button"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? formatDate(field.value) : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="z-[100] w-auto p-0" align="start" sideOffset={8}>
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => {
                    field.onChange(date);
                    setFromOpen(false);
                  }}
                  disabled={disabled}
                  initialFocus
                  defaultMonth={field.value}
                />
              </PopoverContent>
            </Popover>
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
            <Popover open={toOpen} onOpenChange={setToOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    disabled={disabled}
                    type="button"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? formatDate(field.value) : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="z-[100] w-auto p-0" align="start" sideOffset={8}>
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => {
                    field.onChange(date);
                    setToOpen(false);
                  }}
                  disabled={(date) => {
                    if (disabled) return true;
                    return effectiveFrom ? date < effectiveFrom : false;
                  }}
                  initialFocus
                  defaultMonth={field.value || effectiveFrom}
                />
              </PopoverContent>
            </Popover>
            <FormDescription>Leave blank for no expiry</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
