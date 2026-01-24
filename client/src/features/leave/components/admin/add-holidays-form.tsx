/**
 * Add Holidays Form Component
 * Allows adding single or multiple holidays at once
 */

import { Plus, Trash2, Calendar, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateHoliday, useCreateHolidaysBulk } from "@/hooks/use-holiday-mutations";
import { useToast } from "@/hooks/use-toast";
import type { CreateHolidayPayload } from "@/lib/api/holiday-api";
import { getDefaultHolidayFormData } from "@/lib/utils/holiday-utils";
import { HolidayFormRow, validateHolidayData } from "./holiday-form-fields";

interface HolidayFormData extends CreateHolidayPayload {
  id: string;
  isExpanded?: boolean;
}

export function AddHolidaysForm() {
  const [open, setOpen] = useState(false);
  const [holidays, setHolidays] = useState<HolidayFormData[]>([
    {
      id: crypto.randomUUID(),
      isExpanded: true,
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
        isExpanded: true,
        ...getDefaultHolidayFormData(),
      },
    ]);
  };

  const addHolidayRow = () => {
    setHolidays([
      ...holidays,
      {
        id: crypto.randomUUID(),
        isExpanded: true,
        ...getDefaultHolidayFormData(),
      },
    ]);
  };

  const removeHolidayRow = (id: string) => {
    if (holidays.length > 1) {
      setHolidays(holidays.filter((h) => h.id !== id));
    }
  };

  const toggleExpand = (id: string) => {
    setHolidays(
      holidays.map((h) =>
        h.id === id ? { ...h, isExpanded: !h.isExpanded } : h
      )
    );
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
    if (!validateHolidays()) {return;}

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
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            <Calendar className="h-5 w-5 text-purple-600" />
            Add Organization Holidays
          </DialogTitle>
          <DialogDescription>
            Add single or multiple holidays. You can specify a date range for continuous holidays.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Holiday Sections */}
          <div className="space-y-3">
            {holidays.map((holiday, index) => (
              <Card key={holiday.id} className="border border-purple-200">
                <CardHeader
                  className="cursor-pointer bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-colors py-3"
                  onClick={() => toggleExpand(holiday.id)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-purple-900">
                      Holiday {index + 1}
                      {holiday.description && ` - ${holiday.description}`}
                    </h3>
                    <div className="flex items-center gap-2">
                      {holidays.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeHolidayRow(holiday.id);
                          }}
                          className="h-8 w-8 text-red-600 hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      {holiday.isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-purple-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-purple-600" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                {holiday.isExpanded && (
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <HolidayFormRow
                        formData={holiday}
                        onUpdate={(field, value) => updateHoliday(holiday.id, field, value)}
                      />
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* Add Row Button */}
          <Button
            type="button"
            variant="outline"
            onClick={addHolidayRow}
            className="w-full border-2 border-dashed border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 py-3"
            disabled={isLoading}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Another Holiday
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading} 
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {holidays.length === 1 ? "Create Holiday" : `Create ${holidays.length} Holidays`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
