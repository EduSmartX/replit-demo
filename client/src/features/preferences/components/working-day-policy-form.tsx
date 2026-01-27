/**
 * Working Day Policy Form Component
 * Allows organization admins to configure Sunday and Saturday off patterns.
 * Displays at the top of the Organization Preferences page.
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { SuccessDialog } from "@/common/components/dialogs/success-dialog";
import { useScrollToError } from "@/common/hooks/use-scroll-to-error";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
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
import { Switch } from "@/components/ui/switch";
import { SaturdayOffPattern, SaturdayOffPatternLabels, type SaturdayOffPatternType } from "@/constants/attendance";
import {
  createWorkingDayPolicy,
  fetchWorkingDayPolicy,
  updateWorkingDayPolicy,
  type CreateWorkingDayPolicyPayload,
} from "@/lib/api/holiday-api";
import { WorkingDayPolicyMessages } from "@/lib/constants/leave-messages";
import { getShortErrorMessage } from "@/lib/error-utils";
import { workingDayPolicySchema, type WorkingDayPolicyFormValues } from "../schemas/working-day-policy-schema";

export function WorkingDayPolicyForm() {
  const queryClient = useQueryClient();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: "", description: "" });

  // Initialize form with react-hook-form and zod validation
  const form = useForm<WorkingDayPolicyFormValues>({
    resolver: zodResolver(workingDayPolicySchema),
    shouldFocusError: true,
    defaultValues: {
      sunday_off: true,
      saturday_off_pattern: SaturdayOffPattern.SECOND_ONLY,
      effective_from: new Date(),
      effective_to: null,
    },
  });

  // Auto-scroll to first error field
  useScrollToError(form.formState.errors);

  // Fetch current policy
  const {
    data: policyData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["working-day-policy"],
    queryFn: fetchWorkingDayPolicy,
    retry: 1,
  });

  // Set initial values when data loads
  useEffect(() => {
    if (policyData?.data && policyData.data.length > 0) {
      const policy = policyData.data[0]; // Get the most recent policy
      form.reset({
        sunday_off: policy.sunday_off,
        saturday_off_pattern: policy.saturday_off_pattern,
        effective_from: policy.effective_from ? new Date(policy.effective_from) : new Date(),
        effective_to: policy.effective_to ? new Date(policy.effective_to) : null,
      });
    }
  }, [policyData, form]);

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (payload: CreateWorkingDayPolicyPayload) => {
      const existingPolicy = policyData?.data && policyData.data.length > 0 ? policyData.data[0] : null;
      
      if (existingPolicy) {
        return updateWorkingDayPolicy(existingPolicy.public_id, payload);
      } else {
        return createWorkingDayPolicy(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["working-day-policy"] });
      queryClient.invalidateQueries({ queryKey: ["holiday-calendar"] });
      form.reset(form.getValues()); // Reset form dirty state
      setSuccessMessage({
        title: "Policy Updated!",
        description: WorkingDayPolicyMessages.Success.UPDATED,
      });
      setShowSuccessDialog(true);
    },
    onError: (error: unknown) => {
      const errorMessage = getShortErrorMessage(error);
      console.error(WorkingDayPolicyMessages.Error.UPDATE_FAILED, errorMessage);
    },
  });

  // Form submission handler
  const onSubmit = (data: WorkingDayPolicyFormValues) => {
    const payload: CreateWorkingDayPolicyPayload = {
      sunday_off: data.sunday_off,
      saturday_off_pattern: data.saturday_off_pattern as SaturdayOffPatternType,
      effective_from: data.effective_from.toISOString().split("T")[0],
      effective_to: data.effective_to ? data.effective_to.toISOString().split("T")[0] : null,
    };

    saveMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
          <span className="text-gray-600">Loading policy...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 border-b py-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📅</span>
          <div>
            <CardTitle className="text-lg">Working Day Policy</CardTitle>
            <CardDescription className="mt-0.5 text-xs">
              Configure Sunday and Saturday off patterns for your organization
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {isError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{getShortErrorMessage(error)}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Sunday Off Toggle */}
            <FormField
              control={form.control}
              name="sunday_off"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <FormLabel className="text-base font-medium">
                      Sunday Off
                    </FormLabel>
                    <FormDescription>
                      Mark all Sundays as holidays
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Saturday Off Pattern Select */}
            <FormField
              control={form.control}
              name="saturday_off_pattern"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Saturday Off Pattern
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select Saturday pattern" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(SaturdayOffPatternLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose which Saturdays should be marked as holidays
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Effective Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="effective_from"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Effective From <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ? field.value.toISOString().split("T")[0] : ""}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : new Date())}
                        className="h-12"
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="effective_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">
                      Effective To <span className="text-sm text-gray-500">(Optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ? field.value.toISOString().split("T")[0] : ""}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                        className="h-12"
                        min={form.watch("effective_from")?.toISOString().split("T")[0]}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Changes to the working day policy will affect the holiday calendar.
                Weekends will be automatically marked as holidays based on this configuration.
              </p>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={!form.formState.isDirty || saveMutation.isPending}
                className="gap-2 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>

      <SuccessDialog
        open={showSuccessDialog}
        title={successMessage.title}
        description={successMessage.description}
        onClose={() => setShowSuccessDialog(false)}
      />
    </Card>
  );
}
