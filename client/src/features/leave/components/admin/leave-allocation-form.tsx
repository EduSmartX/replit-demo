/**
 * Leave Allocation Policy Form
 * 
 * Comprehensive form for creating and editing leave allocation policies.
 * Supports custom leave types, date ranges, carryover rules, and role-based policies.
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useScrollToError } from "@/common/hooks/use-scroll-to-error";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { LeaveAllocation, LeaveAllocationPayload } from "@/lib/api/leave-api";
import { LeaveMessages } from "@/lib/constants";
import { formatDateForDisplay } from "@/lib/utils/date-utils";
import {
    formatDateForApi,
    getDefaultFormValues,
    getFormValuesFromAllocation,
} from "../../helpers/leave-allocation-helpers";
import {
    useCreateLeaveAllocation,
    useLeaveTypes,
    useOrganizationRoles,
    useUpdateLeaveAllocation,
} from "../../hooks/use-leave-allocation-form";
import { createLeaveAllocationSchema, type LeaveAllocationFormValues } from "../../schemas/leave-allocation-schema";
import { DateRangeFields } from "../common/date-range-fields";
import { LeaveTypeField } from "../common/leave-type-field";
import { PolicyFormHeader } from "../common/policy-form-header";
import { PolicySummaryCard } from "../common/policy-summary-card";
import { RolesCheckboxField } from "../common/roles-checkbox-field";
import type { Control} from "react-hook-form";

interface LeaveAllocationFormProps {
  mode?: "create" | "view" | "edit";
  initialData?: LeaveAllocation | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  onEdit?: () => void;
}

export function LeaveAllocationForm({
  mode = "create",
  initialData,
  onSuccess,
  onCancel,
  onEdit,
}: LeaveAllocationFormProps) {
  const { toast } = useToast();
  const [showSuccess, setShowSuccess] = useState(false);
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";

  // Fetch data using custom hooks
  const { leaveTypes, isLoading: loadingLeaveTypes } = useLeaveTypes();
  const { roles, isLoading: loadingRoles } = useOrganizationRoles();

  // Initialize form
  const form = useForm<LeaveAllocationFormValues>({
    resolver: zodResolver(createLeaveAllocationSchema(mode)),
    shouldFocusError: true,
    defaultValues: initialData
      ? getFormValuesFromAllocation(initialData, roles)
      : getDefaultFormValues(),
  });

  // Auto-scroll to first error field
  useScrollToError(form.formState.errors);

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData && roles.length > 0 && leaveTypes.length > 0) {
      form.reset(getFormValuesFromAllocation(initialData, roles));
    }
  }, [initialData, roles, leaveTypes, form]);

  // Handle successful mutation
  const handleMutationSuccess = () => {
    setShowSuccess(true);
    form.reset();
    setTimeout(() => setShowSuccess(false), 3000);
    onSuccess?.();
  };

  // Setup mutations
  const createMutation = useCreateLeaveAllocation(form.setError, handleMutationSuccess);
  const updateMutation = useUpdateLeaveAllocation(form.setError, handleMutationSuccess);

  // Form submission handler
  const onSubmit = (data: LeaveAllocationFormValues) => {
    if (isEditMode && initialData?.public_id) {
      // Update existing allocation
      const updatePayload: Partial<LeaveAllocationPayload> = {
        name: data.name || "",
        description: data.description || "",
        total_days: data.total_days,
        max_carry_forward_days: data.max_carry_forward_days,
        roles: data.roles,
        effective_from: formatDateForApi(data.effective_from),
        effective_to: data.effective_to ? formatDateForApi(data.effective_to) : undefined,
      };
      updateMutation.mutate({ publicId: initialData.public_id, data: updatePayload });
    } else {
      // Create new allocation
      if (!data.leave_type) {
        toast({
          title: "Error",
          description: LeaveMessages.Error.LEAVE_TYPE_REQUIRED_ERROR,
          variant: "destructive",
        });
        return;
      }

      const createPayload: LeaveAllocationPayload = {
        leave_type: data.leave_type,
        name: data.name || "",
        description: data.description || "",
        total_days: data.total_days,
        max_carry_forward_days: data.max_carry_forward_days,
        roles: data.roles,
        effective_from: formatDateForApi(data.effective_from),
        effective_to: data.effective_to ? formatDateForApi(data.effective_to) : undefined,
      };
      createMutation.mutate(createPayload);
    }
  };

  // Helper functions and computed values
  const selectedLeaveType = leaveTypes.find((type) => type.id === form.watch("leave_type"));
  const selectedRoles = roles.filter((role) => form.watch("roles").includes(role.id));

  const getLeaveTypeName = () => {
    if ((isViewMode || isEditMode) && initialData?.leave_type_name) {
      return initialData.leave_type_name;
    }
    return selectedLeaveType
      ? `${selectedLeaveType.name} (${selectedLeaveType.code})`
      : "Not selected";
  };

  if (loadingLeaveTypes || loadingRoles) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PolicyFormHeader mode={mode} onCancel={onCancel} onEdit={onEdit} />

      {showSuccess && (
        <div className="animate-in slide-in-from-top mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <p className="font-medium text-green-800">
            Leave allocation policy {mode === "edit" ? "updated" : "created"} successfully!
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Form Section */}
        <Card className="shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-green-900">Leave Policy Details</CardTitle>
            <CardDescription>
              {isViewMode
                ? "Review the leave allocation details"
                : "Configure the leave allocation parameters and applicable roles"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-6">
                <fieldset disabled={isViewMode} className="space-y-6">
                  <LeaveTypeField
                    control={form.control}
                    leaveTypes={leaveTypes}
                    mode={mode}
                    initialLeaveTypeName={initialData?.leave_type_name}
                  />

                  {/* Optional Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Name (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Annual Leave 2026" {...field} />
                        </FormControl>
                        <FormDescription>
                          Provide a custom name if different from leave type
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter additional details about this leave policy..."
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Total Days */}
                    <FormField
                      control={form.control}
                      name="total_days"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Days *</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.5" min="0" placeholder="20" {...field} />
                          </FormControl>
                          <FormDescription>Number of days allocated</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Carry Forward Days */}
                    <FormField
                      control={form.control}
                      name="max_carry_forward_days"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Carry Forward to Next Year (Days) *</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.5" min="0" placeholder="5" {...field} />
                          </FormControl>
                          <FormDescription>Max days that can be carried forward</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DateRangeFields
                    control={
                      form.control as unknown as Control<{
                        effective_from: Date;
                        effective_to?: Date;
                      }>
                    }
                    effectiveFrom={form.watch("effective_from")}
                    disabled={isViewMode}
                  />

                  <RolesCheckboxField control={form.control} roles={roles} />
                </fieldset>
              </form>
            </Form>
          </CardContent>
        </Card>

        <PolicySummaryCard
          mode={mode}
          leaveTypeName={getLeaveTypeName()}
          totalDays={form.watch("total_days")}
          carryForwardDays={form.watch("max_carry_forward_days")}
          effectiveFrom={formatDateForDisplay(form.watch("effective_from"))}
          effectiveTo={
            form.watch("effective_to")
              ? formatDateForDisplay(form.watch("effective_to"))
              : undefined
          }
          selectedRoles={selectedRoles}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onSubmit={form.handleSubmit(onSubmit)}
          onEdit={onEdit}
          onCancel={() => {
            if (!isViewMode) {
              form.reset();
            }
            onCancel?.();
          }}
        />
      </div>
    </div>
  );
}
