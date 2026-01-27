/**
 * Add Calendar Exception Dialog
 * Dialog for creating a new calendar exception
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createCalendarException } from "@/lib/api/calendar-exception-api";
import type { CalendarExceptionCreate } from "@/lib/api/calendar-exception-types";
import { fetchClasses, type MasterClass } from "@/lib/api/class-api";
import { getShortErrorMessage } from "@/lib/error-utils";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  date: z.date({
    required_error: "Date is required",
  }),
  override_type: z.enum(["FORCE_WORKING", "FORCE_HOLIDAY"], {
    required_error: "Override type is required",
  }),
  is_applicable_to_all_classes: z.boolean().default(false),
  classes: z.array(z.string()).default([]),
  reason: z.string().min(1, "Reason is required").max(500, "Reason too long"),
});

type FormValues = z.infer<typeof formSchema>;

interface AddCalendarExceptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddCalendarExceptionDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddCalendarExceptionDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      is_applicable_to_all_classes: false,
      classes: [],
      override_type: "FORCE_WORKING",
      reason: "",
    },
  });

  // Fetch classes
  const { data: classesResponse } = useQuery({
    queryKey: ["classes"],
    queryFn: () => fetchClasses({ page_size: 100 }),
    enabled: open,
  });

  const classes = classesResponse?.data || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createCalendarException,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-exceptions"] });
      toast({
        title: "Success",
        description: "Calendar exception created successfully",
      });
      form.reset();
      setSelectedClasses([]);
      onSuccess?.();
    },
    onError: (error: unknown) => {
      const errorMessage = getShortErrorMessage(error);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    const payload: CalendarExceptionCreate = {
      date: format(values.date, "yyyy-MM-dd"),
      override_type: values.override_type,
      is_applicable_to_all_classes: values.is_applicable_to_all_classes,
      classes: values.is_applicable_to_all_classes ? [] : selectedClasses,
      reason: values.reason,
    };

    // Validation
    if (!payload.is_applicable_to_all_classes && payload.classes.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one class or apply to all classes",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate(payload);
  };

  const handleClassToggle = (classId: string) => {
    setSelectedClasses((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
    );
  };

  const isApplicableToAll = form.watch("is_applicable_to_all_classes");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            Add Calendar Exception
          </DialogTitle>
          <DialogDescription>
            Create a new exceptional work policy for specific dates and classes
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>Select the date for this exception</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Override Type */}
            <FormField
              control={form.control}
              name="override_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exception Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select exception type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="FORCE_WORKING">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          <span>Force Working - Make holiday a working day</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="FORCE_HOLIDAY">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-red-500" />
                          <span>Force Holiday - Give holiday on working day</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose whether to make a holiday working or a working day non-working
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Apply to All Classes */}
            <FormField
              control={form.control}
              name="is_applicable_to_all_classes"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Apply to all classes</FormLabel>
                    <FormDescription>
                      This exception will apply to all classes in the organization
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Class Selection */}
            {!isApplicableToAll && (
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Select Classes</label>
                <div className="max-h-48 overflow-y-auto rounded-md border p-4 space-y-2">
                  {classes.length > 0 ? (
                    classes.map((cls: MasterClass) => (
                      <div key={cls.public_id} className="flex items-center space-x-2">
                        <Checkbox
                          checked={selectedClasses.includes(cls.public_id)}
                          onCheckedChange={() => handleClassToggle(cls.public_id)}
                        />
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {cls.class_master.name} - {cls.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No classes available</p>
                  )}
                </div>
                {!isApplicableToAll && selectedClasses.length === 0 && (
                  <p className="text-sm text-red-600">Please select at least one class</p>
                )}
              </div>
            )}

            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter reason for this exception..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Provide a clear reason for this exception</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setSelectedClasses([]);
                  onOpenChange(false);
                }}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Exception"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
