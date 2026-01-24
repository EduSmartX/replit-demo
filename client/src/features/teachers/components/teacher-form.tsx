import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Edit, Loader2, Save } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { DeletedDuplicateDialog } from "@/common/components/dialogs/deleted-duplicate-dialog";
import { useDeletedDuplicateHandler } from "@/common/hooks/use-deleted-duplicate-handler";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { createTeacher, reactivateTeacher, updateTeacher } from "@/lib/api/teacher-api";
import {
    getApiErrorMessage,
    getDeletedDuplicateMessage,
    getDeletedRecordId,
    isDeletedDuplicateError,
    setFormFieldErrors,
} from "@/lib/error-utils";
import { getFormConfig } from "@/lib/utils/form-utils";
import {
    teacherFormSchema,
    type TeacherFormValues,
} from "../schemas/teacher-form-schema";
import {
    getFormValuesFromTeacher,
    getTeacherPayloadFromForm,
} from "../utils/form-utils";
import { FullTeacherFields } from "./full-teacher-fields";
import { MinimalTeacherFields } from "./minimal-teacher-fields";
import type { TeacherFormProps } from "../types";


function TeacherFormComponent({
  mode = "create",
  initialData,
  onSuccess,
  onCancel,
  onEdit,
}: TeacherFormProps) {
  const [minimalFields, setMinimalFields] = useState(false);
  const queryClient = useQueryClient();

  const formConfig = getFormConfig(mode, "Teacher");
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";

  const duplicateHandler = useDeletedDuplicateHandler<{
    payload: ReturnType<typeof getTeacherPayloadFromForm>;
    deletedRecordId: string | null;
  }>();

  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: getFormValuesFromTeacher(initialData),
  });

  const handleAddressSelect = useCallback((address: any) => {
    if (address.streetAddress) {form.setValue("street_address", address.streetAddress);}
    if (address.city) {form.setValue("city", address.city);}
    if (address.state) {form.setValue("state", address.state);}
    if (address.zipCode) {form.setValue("postal_code", address.zipCode);}
    if (address.country) {form.setValue("country", address.country);}
  }, [form]);

  const createMutation = useMutation({
    mutationFn: ({ payload, forceCreate }: { payload: ReturnType<typeof getTeacherPayloadFromForm>; forceCreate?: boolean }) =>
      createTeacher(payload, forceCreate),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast.success("Teacher created successfully");
      onSuccess?.();
    },
    onError: (error: Error) => {
      if (isDeletedDuplicateError(error)) {
        const message = getDeletedDuplicateMessage(error);
        const deletedRecordId = getDeletedRecordId(error);
        const payload = getTeacherPayloadFromForm(form.getValues());
        duplicateHandler.openDialog(message, { payload, deletedRecordId });
      } else {
        // Set field-specific errors if available
        const hasFieldErrors = setFormFieldErrors(error, form.setError);
        
        // Show general toast if no field errors or as a summary
        if (!hasFieldErrors) {
          const errorMessage = getApiErrorMessage(error);
          toast.error(errorMessage);
        }
      }
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: reactivateTeacher,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["teachers"] });
      duplicateHandler.closeDialog();
      toast.success("Teacher reactivated successfully");
      onSuccess?.();
    },
    onError: (error: Error) => {
      const errorMessage = getApiErrorMessage(error);
      toast.error(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ publicId, payload }: { publicId: string; payload: ReturnType<typeof getTeacherPayloadFromForm> }) =>
      updateTeacher(publicId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["teachers"] });
      await queryClient.invalidateQueries({ queryKey: ["teacher-detail", initialData?.public_id] });
      toast.success("Teacher updated successfully");
      onSuccess?.();
    },
    onError: (error: Error) => {      
      const hasFieldErrors = setFormFieldErrors(error, form.setError);
            
      if (!hasFieldErrors) {
        const errorMessage = getApiErrorMessage(error);
        toast.error(errorMessage);
      }
    },
  });

  const handleSubmit = useCallback(
    async (values: TeacherFormValues) => {
      const payload = getTeacherPayloadFromForm(values);
      
      if (isEditMode && initialData?.public_id) {
        updateMutation.mutate({ publicId: initialData.public_id, payload });
      } else {
        createMutation.mutate({ payload, forceCreate: false });
      }
    },
    [isEditMode, initialData, createMutation, updateMutation]
  );

  const handleReactivate = useCallback(() => {
    const deletedRecordId = duplicateHandler.pendingData?.deletedRecordId;
    if (deletedRecordId) {
      reactivateMutation.mutate(deletedRecordId);
    }
  }, [duplicateHandler.pendingData, reactivateMutation]);

  const handleCreateNew = useCallback(() => {
    if (duplicateHandler.pendingData?.payload) {
      createMutation.mutate({ payload: duplicateHandler.pendingData.payload, forceCreate: true });
      duplicateHandler.closeDialog();
    }
  }, [duplicateHandler.pendingData, duplicateHandler.closeDialog, createMutation]);

  const isLoading = createMutation.isPending || updateMutation.isPending || reactivateMutation.isPending;

  return (
    <div className="space-y-6">
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
            Edit Teacher
          </Button>
        )}
      </div>

      {mode === "create" && (
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
            Minimum Required Fields
          </Label>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {mode === "create" && minimalFields ? (
            <MinimalTeacherFields control={form.control} />
          ) : (
            <FullTeacherFields 
              isViewMode={isViewMode} 
              control={form.control} 
              onAddressSelect={handleAddressSelect}
            />
          )}

          {!isViewMode && (
            <div className="flex gap-4 justify-end">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                {formConfig.submitButtonText}
              </Button>
            </div>
          )}
        </form>
      </Form>

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

export const TeacherForm = memo(TeacherFormComponent);
TeacherForm.displayName = "TeacherForm";
