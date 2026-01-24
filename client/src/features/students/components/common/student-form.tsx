/**
 * Student Form Component (Common - Reusable)
 * Comprehensive form for creating, editing, and viewing student information.
 * Supports three modes: create, edit, and view with appropriate field states.
 * Includes address management, guardian information, and class assignment.
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Edit, Loader2, Save } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { DeletedDuplicateDialog } from "@/common/components/dialogs/deleted-duplicate-dialog";
import {
    BloodGroupField,
    DateInputField,
    OrganizationRoleField,
    SupervisorField,
    TextInputField
} from "@/common/components/forms";
import {
    AddressManagementForm,
    type AddressManagementFormRef,
} from "@/common/components/forms/address-management-form";
import { useDeletedDuplicateHandler } from "@/common/hooks/use-deleted-duplicate-handler";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { StudentCreatePayload, StudentDetail } from "@/lib/api/student-api";
import type { FormMode } from "@/lib/utils/form-utils";
import { getFormConfig } from "@/lib/utils/form-utils";
import { StudentMessages } from "../../constants/student-messages";
import {
    formValuesToCreatePayload,
    formValuesToUpdatePayload,
    getDefaultFormValues,
    getFormValuesFromStudent
} from "../../helpers/student-form-helpers";
import {
    useClasses,
    useCreateStudent,
    useReactivateStudent,
    useUpdateStudent,
} from "../../hooks/use-student-form";
import {
    studentFormSchema,
    type StudentFormValues,
} from "../../schemas/student-form-schema";
import { MinimalStudentFields } from "./minimal-student-fields";

interface StudentFormProps {
  mode?: FormMode;
  classId?: string; // Required for create mode
  initialData?: StudentDetail | null;
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
  const [minimalFields, setMinimalFields] = useState(false);
  const addressFormRef = useRef<AddressManagementFormRef>(null);

  const duplicateHandler = useDeletedDuplicateHandler<{
    payload: StudentCreatePayload;
    deletedRecordId: string | null;
  }>();

  const formConfig = getFormConfig(mode, "Student");
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  const { data: classes = [], isLoading: loadingClasses } = useClasses();

  const organizationRoleCode = useMemo(() => {
    if (!initialData?.user?.organization_role) {
      return "";
    }
    return initialData.user.organization_role.code || "";
  }, [initialData?.user?.organization_role]);

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: { ...getDefaultFormValues(), class_id: classId || "" },
  });

  useEffect(() => {
    if (initialData && initialData.user && !form.formState.isDirty) {
      const formValues = getFormValuesFromStudent(initialData, organizationRoleCode);
      form.reset(formValues);
    }
  }, [initialData, organizationRoleCode]);

  // Auto-select supervisor when class is selected
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "class_id" && value.class_id) {
        const selectedClass = classes.find((cls: any) => cls.public_id === value.class_id);
        if (selectedClass?.class_teacher?.email) {
          form.setValue("supervisor_email", selectedClass.class_teacher.email);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, classes]);

  const selectedClassId = form.watch("class_id") || classId || "";
  
  const handleDeletedDuplicate = (message: string, payload: StudentCreatePayload, deletedRecordId: string | null) => {
    duplicateHandler.openDialog(message, { payload, deletedRecordId });
  };

  const createMutation = useCreateStudent(
    selectedClassId,
    form.setError,
    () => {
      toast.success('Student created successfully');
      onSuccess?.();
    },
    handleDeletedDuplicate
  );
  
  const reactivateMutation = useReactivateStudent(selectedClassId, () => {
    duplicateHandler.closeDialog();
    toast.success("Student reactivated successfully");
    onSuccess?.();
  });
  
  const updateMutation = useUpdateStudent(
    selectedClassId,
    initialData?.public_id,
    form.setError,
    () => {
      toast.success("Student updated successfully");
      onSuccess?.();
    }
  );

  const onSubmit = async (values: StudentFormValues) => {
    if (isEditMode) {
      const updatePayload = formValuesToUpdatePayload(values);
      
      try {
        await updateMutation.mutateAsync(updatePayload);

        if (addressFormRef.current && initialData) {
          try {
            await addressFormRef.current.submitAddress();
          } catch (addressError) {
            console.error("Address update failed:", addressError);
            toast.error(`${StudentMessages.error.addressUpdate.title}: ${StudentMessages.error.addressUpdate.description}`);
          }
        }
      } catch (error) {
        // Error already handled by mutation onError
      }
    } else {
      const createPayload = formValuesToCreatePayload(values);
      createMutation.mutate({ payload: createPayload, forceCreate: false });
    }
  };

  const handleReactivate = () => {
    const deletedRecordId = duplicateHandler.pendingData?.deletedRecordId;
    if (deletedRecordId) {
      reactivateMutation.mutate(deletedRecordId);
    }
  };

  const handleCreateNew = () => {
    if (duplicateHandler.pendingData?.payload) {
      createMutation.mutate({ payload: duplicateHandler.pendingData.payload, forceCreate: true });
      duplicateHandler.closeDialog();
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || reactivateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onCancel} title="Back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="mb-3 text-3xl font-bold text-gray-900">
              {formConfig.title}
            </h1>
            <p className="text-base text-gray-600">{formConfig.description}</p>
          </div>
        </div>
        {isViewMode && (
          <Button onClick={onEdit} className="gap-2">
            <Edit className="h-4 w-4" />
            Edit Student
          </Button>
        )}
      </div>

      {/* Minimal Fields Toggle */}
      {isCreateMode && (
        <div className="flex items-center space-x-2 bg-blue-50 px-4 py-3 rounded-lg border border-blue-200">
          <Checkbox
            id="minimalFields"
            checked={minimalFields}
            onCheckedChange={(checked) => setMinimalFields(checked as boolean)}
          />
          <Label
            htmlFor="minimalFields"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Minimum Required Fields Only
          </Label>
        </div>
      )}

      {/* Form */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <CardTitle className="text-blue-900">Student Information</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Conditional Rendering: Minimal or Full Fields */}
              {isCreateMode && minimalFields ? (
                <MinimalStudentFields 
                  control={form.control}
                  classes={classes}
                  loadingClasses={loadingClasses}
                  isCreateMode={isCreateMode}
                />
              ) : (
                <>
              {/* Reuse Minimal Fields Component */}
              <MinimalStudentFields
                control={form.control}
                classes={classes}
                loadingClasses={loadingClasses}
                isCreateMode={isCreateMode}
                isViewMode={isViewMode}
                showAsCard={false}
                initialData={initialData}
                showClassNote={true}
              />

              {/* Additional Basic Information Fields */}
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <TextInputField
                    control={form.control}
                    name="admission_number"
                    label="Admission Number"
                    placeholder="ADM2024001"
                    disabled={isViewMode}
                  />

                  <DateInputField
                    control={form.control}
                    name="admission_date"
                    label="Admission Date"
                    max={new Date()}
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
                  <BloodGroupField
                    control={form.control}
                    name="blood_group"
                    disabled={isViewMode}
                  />

                  <DateInputField
                    control={form.control}
                    name="date_of_birth"
                    label="Date of Birth"
                    max={new Date()}
                    disabled={isViewMode}
                  />
                </div>
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

              {/* Previous School Information */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900">Previous School Information</h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <TextInputField
                    control={form.control}
                    name="previous_school_name"
                    label="Previous School Name"
                    placeholder="ABC School"
                    disabled={isViewMode}
                  />

                  <TextInputField
                    control={form.control}
                    name="previous_school_class"
                    label="Previous School Class"
                    placeholder="Grade 5"
                    disabled={isViewMode}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="previous_school_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Previous School Address</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter previous school address..."
                          rows={2}
                          disabled={isViewMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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

              </>
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

      <DeletedDuplicateDialog
        open={duplicateHandler.isOpen}
        onOpenChange={duplicateHandler.closeDialog}
        message={duplicateHandler.message}
        onReactivate={handleReactivate}
        onCreateNew={handleCreateNew}
        onCancel={duplicateHandler.closeDialog}
      />
    </div>
  );
}
