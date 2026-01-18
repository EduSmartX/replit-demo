/**
 * Add Holidays Form Component
 * Allows adding single or multiple holidays at once
 */

import { useState } from "react";
import { Plus, Trash2, Calendar, Loader2 } from "lucide-react";
import type { CreateHolidayPayload } from "@/lib/api/holiday-api";
import { Button } from "@/components/ui/button";
import { HolidayFormRow, validateHolidayData } from "./holiday-form-fields";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useCreateHoliday, useCreateHolidaysBulk } from "@/hooks/use-holiday-mutations";
import { getDefaultHolidayFormData } from "@/lib/utils/holiday-utils";

interface HolidayFormData extends CreateHolidayPayload {
  id: string;
}

export function AddHolidaysForm() {
  const [open, setOpen] = useState(false);
  const [holidays, setHolidays] = useState<HolidayFormData[]>([
    {
      id: crypto.randomUUID(),
      ...getDefaultHolidayFormData(),
    },
  ]);
  const { toast } = useToast();

  // Mutations with reusable hooks
  const createSingleMutation = useCreateHoliday({
    onSuccess: () => {
      setOpen(false);
      resetForm();
    },
  });

  const createBulkMutation = useCreateHolidaysBulk({
    onSuccess: () => {
      setOpen(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setHolidays([
      {
        id: crypto.randomUUID(),
        ...getDefaultHolidayFormData(),
      },
    ]);
  };

  const addHolidayRow = () => {
    setHolidays([
      ...holidays,
      {
        id: crypto.randomUUID(),
        ...getDefaultHolidayFormData(),
      },
    ]);
  };

  const removeHolidayRow = (id: string) => {
    if (holidays.length > 1) {
      setHolidays(holidays.filter((h) => h.id !== id));
    }
  };

  const updateHoliday = (id: string, field: keyof CreateHolidayPayload, value: any) => {
    setHolidays(
      holidays.map((h) =>
        h.id === id
          ? {
              ...h,
              [field]: value,
              // If end_date is empty string, set to undefined
              ...(field === "end_date" && value === "" ? { end_date: undefined } : {}),
            }
          : h
      )
    );
  };

  const validateHolidays = () => {
    for (const holiday of holidays) {
      if (!validateHolidayData(holiday, toast)) {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateHolidays()) return;

    // Prepare payloads
    const payloads: CreateHolidayPayload[] = holidays.map((h) => ({
      start_date: h.start_date,
      end_date: h.end_date || h.start_date, // If no end_date, use start_date
      holiday_type: h.holiday_type,
      description: h.description.trim(),
    }));

    // If single holiday, use single mutation, otherwise use bulk
    if (payloads.length === 1) {
      createSingleMutation.mutate(payloads[0]);
    } else {
      createBulkMutation.mutate(payloads);
    }
  };

  const isLoading = createSingleMutation.isPending || createBulkMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Holidays
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Add Organization Holidays
          </DialogTitle>
          <DialogDescription>
            Add single or multiple holidays. You can specify a date range for continuous holidays.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-3 px-3 py-2 bg-muted/50 rounded-lg text-xs font-semibold">
            <div className="col-span-3">Start Date *</div>
            <div className="col-span-3">End Date (Optional)</div>
            <div className="col-span-2">Type *</div>
            <div className="col-span-3">Description *</div>
            <div className="col-span-1 text-center">Action</div>
          </div>

          {/* Holiday Rows */}
          <div className="space-y-3">
            {holidays.map((holiday, index) => (
              <div
                key={holiday.id}
                className="grid grid-cols-12 gap-3 items-start p-3 border rounded-lg"
              >
                <HolidayFormRow
                  formData={holiday}
                  onUpdate={(field, value) => updateHoliday(holiday.id, field, value)}
                />

                {/* Remove Button */}
                <div className="col-span-1 flex justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeHolidayRow(holiday.id)}
                    disabled={holidays.length === 1}
                    className="h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Row Button */}
          <Button
            type="button"
            variant="outline"
            onClick={addHolidayRow}
            className="w-full gap-2"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4" />
            Add Another Holiday
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="gap-2">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {holidays.length === 1 ? "Create Holiday" : `Create ${holidays.length} Holidays`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
