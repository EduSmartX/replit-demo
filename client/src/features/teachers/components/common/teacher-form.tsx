/**
 * Teacher Form Component (Common - Reusable)
 * Comprehensive form for creating, editing, and viewing teacher information.
 * Supports three modes: create, edit, and view with appropriate field states.
 * Includes address management, subject assignments, and supervisor linking.
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Save, Edit } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  AddressManagementForm,
  type AddressManagementFormRef,
} from "@/common/components/forms/address-management-form";
import {
  TextInputField,
  BloodGroupField,
  GenderField,
  MultiSelectField,
  SelectField,
} from "@/common/components/forms";
import { SuccessMessage } from "@/common/components/dialogs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import type { Teacher } from "@/lib/api/teacher-api";
import { getFormConfig } from "@/lib/utils/form-utils";
import type { FormMode } from "@/lib/utils/form-utils";
import {
  teacherFormSchema,
  type TeacherFormValues,
  getDefaultFormValues,
  getFormValuesFromTeacher,
  getOrganizationRoleCode,
  formValuesToCreatePayload,
  formValuesToUpdatePayload,
  useSubjects,
  useOrganizationRoles,
  useOrganizationUsers,
  useCreateTeacher,
  useUpdateTeacher,
  TeacherMessages,
} from "@/features/teachers";

interface TeacherFormProps {
  mode?: FormMode;
  initialData?: Teacher | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  onEdit?: () => void;
}

export function TeacherForm({
  mode = "create",
  initialData,
  onSuccess,
  onCancel,
  onEdit,
}: TeacherFormProps) {
  const { toast } = useToast();
  const [showSuccess, setShowSuccess] = useState(false);
  const addressFormRef = useRef<AddressManagementFormRef>(null);

  const formConfig = getFormConfig(mode, "Teacher");
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  // Fetch data using custom hooks
  const { data: subjects = [], isLoading: loadingSubjects } = useSubjects();
  const { data: orgRoles = [], isLoading: loadingOrgRoles } = useOrganizationRoles();
  const { data: users = [], isLoading: loadingUsers } = useOrganizationUsers();

  // Map organization_role name to code
  const organizationRoleCode = useMemo(() => {
    if (!initialData?.user?.organization_role || orgRoles.length === 0) {
      return "";
    }
    return getOrganizationRoleCode(initialData.user.organization_role, orgRoles);
  }, [initialData?.user?.organization_role, orgRoles]);

  // Initialize form
  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: getDefaultFormValues(),
  });

  // Update form when initialData changes
  useEffect(() => {
    if (initialData && initialData.user && !form.formState.isDirty) {
      const formValues = getFormValuesFromTeacher(initialData, organizationRoleCode);
      form.reset(formValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, organizationRoleCode]);

  // Handle success callback
  const handleSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onSuccess?.();
    }, 2000);
  };

  // Create and update mutations using custom hooks
  const createMutation = useCreateTeacher(form.setError, handleSuccess);
  const updateMutation = useUpdateTeacher(initialData?.public_id, form.setError, handleSuccess);

  const onSubmit = async (values: TeacherFormValues) => {
    if (isEditMode) {
      const updatePayload = formValuesToUpdatePayload(values);
      
      try {
        await updateMutation.mutateAsync(updatePayload);

        // Also submit address if address form exists
        if (addressFormRef.current && initialData) {
          try {
            await addressFormRef.current.submitAddress();
          } catch (addressError) {
            console.error("Address update failed:", addressError);
            toast({
              title: TeacherMessages.error.addressUpdate.title,
              description: TeacherMessages.error.addressUpdate.description,
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        // Error already handled by mutation onError
      }
    } else {
      const createPayload = formValuesToCreatePayload(values);
      createMutation.mutate(createPayload);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  // Success message
  if (showSuccess) {
    return (
      <SuccessMessage
        title={formConfig.successMessage}
        description={
          isEditMode
            ? "The teacher information has been updated successfully."
            : "A new teacher has been added to your organization successfully."
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-3xl font-bold text-transparent">
              {formConfig.title}
            </h1>
            <p className="mt-2 text-gray-600">{formConfig.description}</p>
          </div>
        </div>
        {isViewMode && (
          <Button onClick={onEdit} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Teacher
          </Button>
        )}
      </div>

      {/* Form */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
          <CardTitle className="text-purple-900">Teacher Information</CardTitle>
          <CardDescription className="text-purple-700">
            {isViewMode
              ? "Teacher details are displayed below"
              : isEditMode
                ? "Update the fields you want to change"
                : "All fields marked with * are required"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <TextInputField
                    control={form.control}
                    name="employee_id"
                    label="Employee ID"
                    placeholder="EMP001"
                    required
                    disabled={isViewMode}
                  />

                  <TextInputField
                    control={form.control}
                    name="email"
                    label="Email"
                    type="email"
                    placeholder="teacher@example.com"
                    required
                    disabled={isViewMode}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <TextInputField
                    control={form.control}
                    name="first_name"
                    label="First Name"
                    placeholder="John"
                    required
                    disabled={isViewMode}
                  />

                  <TextInputField
                    control={form.control}
                    name="last_name"
                    label="Last Name"
                    placeholder="Doe"
                    required
                    disabled={isViewMode}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <TextInputField
                    control={form.control}
                    name="phone"
                    label="Phone"
                    type="tel"
                    placeholder="+1234567890"
                    disabled={isViewMode}
                  />

                  <GenderField control={form.control} name="gender" disabled={isViewMode} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <BloodGroupField
                    control={form.control}
                    name="blood_group"
                    disabled={isViewMode}
                  />

                  <TextInputField
                    control={form.control}
                    name="joining_date"
                    label="Joining Date"
                    type="date"
                    max={new Date().toISOString().split("T")[0]}
                    disabled={isViewMode}
                  />
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900">Professional Information</h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <TextInputField
                    control={form.control}
                    name="designation"
                    label="Designation"
                    placeholder="Senior Teacher"
                    disabled={isViewMode}
                    description="Current position or job title"
                  />

                  <TextInputField
                    control={form.control}
                    name="highest_qualification"
                    label="Highest Qualification"
                    placeholder="M.Ed., B.Ed."
                    disabled={isViewMode}
                    description="Highest degree or certification earned"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <TextInputField
                    control={form.control}
                    name="experience_years"
                    label="Experience (Years)"
                    type="number"
                    placeholder="5"
                    disabled={isViewMode}
                    description="Total years of teaching experience"
                  />

                  <TextInputField
                    control={form.control}
                    name="specialization"
                    label="Specialization"
                    placeholder="Mathematics, Science, etc."
                    disabled={isViewMode}
                    description="Area of expertise or specialization"
                  />
                </div>

                {!isCreateMode && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <SelectField
                      control={form.control}
                      name="organization_role"
                      label="Organization Role"
                      placeholder="Select organization role"
                      disabled={isViewMode || loadingOrgRoles}
                      description="Select the role for this teacher"
                      options={orgRoles.map((role) => ({
                        value: role.code,
                        label: role.name,
                      }))}
                    />
                    <SelectField
                      control={form.control}
                      name="supervisor_email"
                      label="Supervisor"
                      placeholder="Select supervisor"
                      disabled={isViewMode || loadingUsers}
                      description="Select a supervisor from existing users"
                      options={users.map((user) => ({
                        value: user.email,
                        label: `${user.full_name} (${user.email})`,
                      }))}
                    />
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  {isCreateMode && (
                    <SelectField
                      control={form.control}
                      name="organization_role"
                      label="Organization Role"
                      placeholder="Select organization role"
                      disabled={isViewMode || loadingOrgRoles}
                      description="Leave empty to use default (Teacher)"
                      options={orgRoles.map((role) => ({
                        value: role.code,
                        label: role.name,
                      }))}
                    />
                  )}

                  {isCreateMode && (
                    <SelectField
                      control={form.control}
                      name="supervisor_email"
                      label="Supervisor"
                      placeholder="Select supervisor"
                      disabled={isViewMode || loadingUsers}
                      description="Optional - Select a supervisor from existing users"
                      options={users.map((user) => ({
                        value: user.email,
                        label: `${user.full_name} (${user.email})`,
                      }))}
                    />
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <MultiSelectField
                    control={form.control}
                    name="subjects"
                    label="Subjects"
                    description="Select the subjects this teacher can teach"
                    disabled={isViewMode}
                    options={subjects}
                    loading={loadingSubjects}
                    placeholder="Select subjects..."
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900">Emergency Contact</h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <TextInputField
                    control={form.control}
                    name="emergency_contact_name"
                    label="Emergency Contact Name"
                    placeholder="Jane Doe"
                    disabled={isViewMode}
                  />

                  <TextInputField
                    control={form.control}
                    name="emergency_contact_number"
                    label="Emergency Contact Number"
                    type="tel"
                    placeholder="+1234567890"
                    disabled={isViewMode}
                  />
                </div>
              </div>

              {/* Back to List button removed from here - moved to bottom */}
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Address Management Section - Show in Edit and View modes */}
      {(isEditMode || isViewMode) && initialData && (
        <div className="mt-6">
          <AddressManagementForm
            ref={addressFormRef}
            userPublicId={initialData.user?.public_id || initialData.public_id}
            resourceName={initialData.full_name}
            currentAddress={initialData.user?.address || initialData.addresses?.[0] || null}
            mode={mode}
            onEditMode={onEdit}
            hideActions={isEditMode}
          />
        </div>
      )}

      {/* Action buttons at the bottom of the page */}
      <div className="mt-6 flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {isViewMode ? "Back to List" : "Cancel"}
        </Button>
        {isViewMode ? (
          <Button
            onClick={onEdit}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Teacher
          </Button>
        ) : (
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditMode ? "Update Teacher" : "Create Teacher"}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
