/**
 * Edit Holiday Dialog Component
 * Allows editing a single holiday
 */

import { useState, useEffect } from "react";
import { Calendar, Loader2 } from "lucide-react";
import type { CreateHolidayPayload, Holiday } from "@/lib/api/holiday-api";
import { Button } from "@/components/ui/button";
import { HolidayFormFields, validateHolidayData } from "./holiday-form-fields";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useUpdateHoliday } from "@/hooks/use-holiday-mutations";

interface EditHolidayDialogProps {
  holiday: Holiday | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditHolidayDialog({ holiday, open, onOpenChange }: EditHolidayDialogProps) {
  const [formData, setFormData] = useState<CreateHolidayPayload>({
    start_date: "",
    end_date: "",
    holiday_type: "NATIONAL_HOLIDAY",
    description: "",
  });
  const { toast } = useToast();

  const updateMutation = useUpdateHoliday({
    onSuccess: () => {
      onOpenChange(false);
    },
  });

  // Update form when holiday changes
  useEffect(() => {
    if (holiday) {
      setFormData({
        start_date: holiday.start_date,
        end_date: holiday.end_date,
        holiday_type: holiday.holiday_type as any,
        description: holiday.description,
      });
    }
  }, [holiday]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateHolidayData(formData, toast)) {
      return;
    }

    if (!holiday) {
      toast({
        title: "Error",
        description: "No holiday selected",
        variant: "destructive",
      });
      return;
    }

    updateMutation.mutate({
      publicId: holiday.public_id,
      payload: {
        ...formData,
        end_date: formData.end_date || formData.start_date,
      },
    });
  };

  const updateField = (field: keyof CreateHolidayPayload, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  if (!holiday) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Edit Holiday
          </DialogTitle>
          <DialogDescription>
            Update the holiday details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <HolidayFormFields formData={formData} onUpdate={updateField} />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending} className="gap-2">
              {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Update Holiday
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
