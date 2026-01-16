import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useForm, Control } from "react-hook-form";
import * as z from "zod";
import { DateRangeFields } from "./shared/DateRangeFields";
import { LeaveTypeField } from "./shared/LeaveTypeField";
import { PolicyFormHeader } from "./shared/PolicyFormHeader";
import { PolicySummaryCard } from "./shared/PolicySummaryCard";
import { RolesCheckboxField } from "./shared/RolesCheckboxField";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  createLeaveAllocation,
  updateLeaveAllocation,
  fetchLeaveTypes,
  fetchOrganizationRoles,
  type LeaveAllocationPayload,
  type LeaveAllocation,
} from "@/lib/api/leave-api";
import { parseApiError } from "@/lib/error-parser";

const createLeaveAllocationSchema = (mode: "create" | "view" | "edit") => {
  return z.object({
    leave_type:
      mode === "edit"
        ? z.number().optional() // Optional in edit mode since it can't be changed
        : z
            .number({
              required_error: "Please select a leave type",
            })
            .min(1, "Please select a valid leave type"),
    name: z.string().optional(),
    description: z.string().optional(),
    total_days: z
      .string()
      .min(1, "Total days is required")
      .refine((val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0;
      }, "Must be a positive number"),
    max_carry_forward_days: z
      .string()
      .min(1, "Carry forward days is required")
      .refine((val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0;
      }, "Must be a positive number"),
    roles: z.array(z.number()).min(1, "Please select at least one role"),
    effective_from: z.date({
      required_error: "Effective from date is required",
    }),
    effective_to: z.date().optional(),
  });
};

type LeaveAllocationFormValues = z.infer<ReturnType<typeof createLeaveAllocationSchema>>;

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
  const queryClient = useQueryClient();
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";

  // Helper function to parse date strings without timezone conversion
  const parseLocalDate = (dateString: string | null | undefined): Date | undefined => {
    if (!dateString) return undefined;
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed
  };

  // Fetch leave types
  const { data: leaveTypesData, isLoading: loadingLeaveTypes } = useQuery({
    queryKey: ["leave-types"],
    queryFn: fetchLeaveTypes,
  });

  // Fetch organization roles
  const { data: rolesData, isLoading: loadingRoles } = useQuery({
    queryKey: ["organization-roles"],
    queryFn: fetchOrganizationRoles,
  });

  const leaveTypes = useMemo(() => leaveTypesData?.data || [], [leaveTypesData]);

  // Handle roles data - it might be direct array or wrapped in data property
  const roles = useMemo(
    () => (Array.isArray(rolesData) ? rolesData : rolesData?.data || []),
    [rolesData]
  );

  // Parse roles from initialData if available - convert role names to IDs
  const initialRoleNames = initialData?.roles
    ? initialData.roles
        .split(",")
        .map((r) => r.trim())
        .filter((r) => r.length > 0)
    : [];
  const initialRoleIds = roles
    .filter((role) => initialRoleNames.includes(role.name))
    .map((role) => role.id);

  const form = useForm<LeaveAllocationFormValues>({
    resolver: zodResolver(createLeaveAllocationSchema(mode)),
    defaultValues: initialData
      ? {
          leave_type: initialData.leave_type_id || 0,
          name: initialData.name || "",
          description: initialData.description || "",
          total_days: initialData.total_days.toString(),
          max_carry_forward_days: initialData.max_carry_forward_days.toString(),
          roles: initialRoleIds,
          effective_from: parseLocalDate(initialData.effective_from) || new Date(),
          effective_to: parseLocalDate(initialData.effective_to),
        }
      : {
          leave_type: 0,
          name: "",
          description: "",
          total_days: "",
          max_carry_forward_days: "0",
          roles: [],
          effective_from: new Date(),
        },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData && roles.length > 0 && leaveTypes.length > 0) {
      const roleNames = initialData.roles
        ? initialData.roles
            .split(",")
            .map((r) => r.trim())
            .filter((r) => r.length > 0)
        : [];
      const roleIds = roles.filter((role) => roleNames.includes(role.name)).map((role) => role.id);

      form.reset({
        leave_type: initialData.leave_type_id || 0,
        name: initialData.name || "",
        description: initialData.description || "",
        total_days: initialData.total_days.toString(),
        max_carry_forward_days: initialData.max_carry_forward_days.toString(),
        roles: roleIds,
        effective_from: parseLocalDate(initialData.effective_from) || new Date(),
        effective_to: parseLocalDate(initialData.effective_to),
      });
    }
  }, [initialData, roles, leaveTypes, form]);

  const createMutation = useMutation({
    mutationFn: (data: LeaveAllocationPayload) => createLeaveAllocation(data),
    onSuccess: (response) => {
      // Invalidate and refetch allocations
      queryClient.invalidateQueries({ queryKey: ["leave-allocations"] });

      setShowSuccess(true);
      toast({
        title: "Success",
        description: response.message || "Leave allocation created successfully",
      });
      form.reset();
      setTimeout(() => setShowSuccess(false), 3000);
      onSuccess?.();
    },
    onError: (error: unknown) => {
      const errorMessage = parseApiError(error, "Failed to create leave allocation");
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ publicId, data }: { publicId: string; data: Partial<LeaveAllocationPayload> }) =>
      updateLeaveAllocation(publicId, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["leave-allocations"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["leave-allocation-detail", variables.publicId] });

      setShowSuccess(true);
      toast({
        title: "Success",
        description: response.message || "Leave allocation updated successfully",
      });
      setTimeout(() => setShowSuccess(false), 3000);
      onSuccess?.();
    },
    onError: (error: unknown) => {
      const errorMessage = parseApiError(error, "Failed to update leave allocation");
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LeaveAllocationFormValues) => {
    if (isEditMode && initialData?.public_id) {
      // Update existing allocation - leave_type cannot be changed
      const updatePayload: Partial<LeaveAllocationPayload> = {
        name: data.name || "",
        description: data.description || "",
        total_days: data.total_days,
        max_carry_forward_days: data.max_carry_forward_days,
        roles: data.roles,
        effective_from: data.effective_from.toISOString().split("T")[0],
        effective_to: data.effective_to ? data.effective_to.toISOString().split("T")[0] : undefined,
      };
      updateMutation.mutate({ publicId: initialData.public_id, data: updatePayload });
    } else {
      // Create new allocation - include leave_type
      if (!data.leave_type) {
        toast({
          title: "Error",
          description: "Leave type is required",
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
        effective_from: data.effective_from.toISOString().split("T")[0],
        effective_to: data.effective_to ? data.effective_to.toISOString().split("T")[0] : undefined,
      };
      createMutation.mutate(createPayload);
    }
  };

  // Helper functions and computed values
  const selectedLeaveType = leaveTypes.find((type) => type.id === form.watch("leave_type"));
  const selectedRoles = roles.filter((role) => form.watch("roles").includes(role.id));

  const formatDate = (date: Date | undefined) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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
    <div className="mx-auto max-w-7xl">
      <PolicyFormHeader mode={mode} />

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
          effectiveFrom={formatDate(form.watch("effective_from"))}
          effectiveTo={
            form.watch("effective_to") ? formatDate(form.watch("effective_to")) : undefined
          }
          selectedRoles={selectedRoles}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onSubmit={form.handleSubmit(onSubmit)}
          onEdit={onEdit}
          onCancel={() => {
            if (!isViewMode) form.reset();
            onCancel?.();
          }}
        />
      </div>
    </div>
  );
}
