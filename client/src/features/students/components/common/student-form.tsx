/**
 * Student Form Component (Common - Reusable)
 * Comprehensive form for creating, editing, and viewing student information.
 * Supports three modes: create, edit, and view with appropriate field states.
 * Includes address management, guardian information, and class assignment.
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Save, Edit } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { SuccessMessage } from "@/common/components/dialogs";
import {
  TextInputField,
  BloodGroupField,
  GenderField,
  SelectField,
} from "@/common/components/forms";
import {
  AddressManagementForm,
  type AddressManagementFormRef,
} from "@/common/components/forms/address-management-form";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Student } from "@/lib/api/student-api";
import { getFormConfig } from "@/lib/utils/form-utils";
import type { FormMode } from "@/lib/utils/form-utils";
import {
  studentFormSchema,
  type StudentFormValues,
} from "../../schemas/student-form-schema";
import {
  getDefaultFormValues,
  getFormValuesFromStudent,
  getOrganizationRoleCode,
  formValuesToCreatePayload,
  formValuesToUpdatePayload,
} from "../../helpers/student-form-helpers";
import {
  useClasses,
  useOrganizationRoles,
  useOrganizationUsers,
  useCreateStudent,
  useUpdateStudent,
} from "../../hooks/use-student-form";
import { StudentMessages } from "../../constants/student-messages";

interface StudentFormProps {
  mode?: FormMode;
  classId?: string; // Required for create mode
  initialData?: Student | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  onEdit?: () => void;
}

export function StudentForm({
  mode = "create",
  classId,
  initialData,
  onSuccess,
  onCancel,
  onEdit,
}: StudentFormProps) {
  const { toast } = useToast();
  const [showSuccess, setShowSuccess] = useState(false);
  const addressFormRef = useRef<AddressManagementFormRef>(null);

  const formConfig = getFormConfig(mode, "Student");
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  // Parallel data fetching: Load classes, roles, and users simultaneously for faster form init
  const { data: classes = [], isLoading: loadingClasses } = useClasses();
  const { data: orgRoles = [], isLoading: loadingOrgRoles } = useOrganizationRoles();
  const { data: users = [], isLoading: loadingUsers } = useOrganizationUsers();

  // Reverse lookup: Map organization_role display name back to code for form initialization
  const organizationRoleCode = useMemo(() => {
    if (!initialData?.user?.organization_role || orgRoles.length === 0) {
      return "";
    }
    return getOrganizationRoleCode(initialData.user.organization_role, orgRoles);
  }, [initialData?.user?.organization_role, orgRoles]);

  // Initialize form
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: getDefaultFormValues(),
  });

  // Form rehydration: Populate form fields when editing/viewing, skip if user has started editing
  useEffect(() => {
    if (initialData && initialData.user && !form.formState.isDirty) {
      const formValues = getFormValuesFromStudent(initialData, organizationRoleCode);
      form.reset(formValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, organizationRoleCode]);

  // Success flow: Show toast message briefly then trigger parent callback
  const handleSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onSuccess?.();
    }, 2000);
  };

  // Create and update mutations using custom hooks
  const createMutation = useCreateStudent(
    classId || initialData?.class_assigned?.public_id || "",
    form.setError,
    handleSuccess
  );
  const updateMutation = useUpdateStudent(initialData?.public_id, form.setError, handleSuccess);

  const onSubmit = async (values: StudentFormValues) => {
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
              title: StudentMessages.error.addressUpdate.title,
              description: StudentMessages.error.addressUpdate.description,
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
            ? "The student information has been updated successfully."
            : "A new student has been added to your organization successfully."
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
            <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">
              {formConfig.title}
            </h1>
            <p className="mt-2 text-gray-600">{formConfig.description}</p>
          </div>
        </div>
        {isViewMode && (
          <Button onClick={onEdit} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Student
          </Button>
        )}
      </div>

      {/* Form */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <CardTitle className="text-blue-900">Student Information</CardTitle>
          <CardDescription className="text-blue-700">
            {isViewMode
              ? "Student details are displayed below"
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
                    name="roll_number"
                    label="Roll Number"
                    placeholder="001"
                    required
                    disabled={isViewMode}
                  />

                  <TextInputField
                    control={form.control}
                    name="admission_number"
                    label="Admission Number"
                    placeholder="ADM2024001"
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
                    name="email"
                    label="Email"
                    type="email"
                    placeholder="student@example.com"
                    disabled={isViewMode}
                  />

                  <TextInputField
                    control={form.control}
                    name="phone"
                    label="Phone"
                    type="tel"
                    placeholder="+1234567890"
                    disabled={isViewMode}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <GenderField control={form.control} name="gender" disabled={isViewMode} />

                  <BloodGroupField
                    control={form.control}
                    name="blood_group"
                    disabled={isViewMode}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <TextInputField
                    control={form.control}
                    name="date_of_birth"
                    label="Date of Birth"
                    type="date"
                    max={new Date().toISOString().split("T")[0]}
                    disabled={isViewMode}
                  />

                  <TextInputField
                    control={form.control}
                    name="admission_date"
                    label="Admission Date"
                    type="date"
                    max={new Date().toISOString().split("T")[0]}
                    disabled={isViewMode}
                  />
                </div>

                {isCreateMode && classId && (
                  <div className="rounded-md bg-blue-50 p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Student will be assigned to the selected class.
                    </p>
                  </div>
                )}

                {!isCreateMode && initialData?.class_assigned && (
                  <div className="rounded-md bg-gray-50 p-4">
                    <p className="text-sm text-gray-700">
                      <strong>Current Class:</strong> {initialData.class_assigned.class_master?.name || ""}{" "}
                      - {initialData.class_assigned.name}
                    </p>
                  </div>
                )}
              </div>

              {/* Guardian Information */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900">Guardian Information</h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <TextInputField
                    control={form.control}
                    name="guardian_name"
                    label="Guardian Name"
                    placeholder="Jane Doe"
                    disabled={isViewMode}
                  />

                  <TextInputField
                    control={form.control}
                    name="guardian_relationship"
                    label="Relationship"
                    placeholder="Mother, Father, etc."
                    disabled={isViewMode}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <TextInputField
                    control={form.control}
                    name="guardian_phone"
                    label="Guardian Phone"
                    type="tel"
                    placeholder="+1234567890"
                    disabled={isViewMode}
                  />

                  <TextInputField
                    control={form.control}
                    name="guardian_email"
                    label="Guardian Email"
                    type="email"
                    placeholder="guardian@example.com"
                    disabled={isViewMode}
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
                    label="Contact Name"
                    placeholder="Emergency Contact Name"
                    disabled={isViewMode}
                  />

                  <TextInputField
                    control={form.control}
                    name="emergency_contact_phone"
                    label="Contact Phone"
                    type="tel"
                    placeholder="+1234567890"
                    disabled={isViewMode}
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>

                <FormField
                  control={form.control}
                  name="medical_conditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical Conditions</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Any medical conditions or allergies..."
                          rows={3}
                          disabled={isViewMode}
                        />
                      </FormControl>
                      <FormDescription>
                        Important medical information to be aware of
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Any additional information..."
                          rows={3}
                          disabled={isViewMode}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional notes or comments about the student
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Advanced Settings */}
              {!isViewMode && (
                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900">Advanced Settings</h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <SelectField
                      control={form.control}
                      name="organization_role"
                      label="Organization Role"
                      placeholder="Select role"
                      options={orgRoles.map((role: { code: string; name: string }) => ({
                        value: role.code,
                        label: role.name,
                      }))}
                      disabled={isViewMode || loadingOrgRoles}
                      description="Optional: Specify a custom role for this student"
                    />

                    <SelectField
                      control={form.control}
                      name="supervisor_email"
                      label="Supervisor"
                      placeholder="Select supervisor"
                      options={users.map((user: { email: string; full_name: string; public_id: string }) => ({
                        value: user.email,
                        label: `${user.full_name} (${user.email})`,
                      }))}
                      disabled={isViewMode || loadingUsers}
                      description="Optional: Assign a supervisor for this student"
                    />
                  </div>
                </div>
              )}

              {/* Form Actions */}
              {!isViewMode && (
                <div className="flex justify-end gap-3 border-t pt-6">
                  <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading} className="gap-2">
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {isEditMode ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {isEditMode ? "Update Student" : "Create Student"}
                      </>
                    )}
                  </Button>
                </div>
              )}
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
      {isViewMode && (
        <div className="flex justify-start gap-3">
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
        </div>
      )}
    </div>
  );
}
