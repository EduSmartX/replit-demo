/**
 * Single Class Form Component (View/Edit Modes)
 * Reusable form for viewing and editing individual class sections.
 * Supports three modes: create, edit, and view with appropriate field states.
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Loader2, Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm, type Control, type FieldValues, type UseFormSetError } from "react-hook-form";
import { TeacherField } from "@/common/components/forms";
import { PageWrapper } from "@/common/components/layout";
import { useScrollToError } from "@/common/hooks/use-scroll-to-error";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { MasterClass } from "@/lib/api/class-api";
import {
  getDefaultSingleFormValues,
  getSingleFormValuesFromClass,
} from "../../helpers/class-form-helpers";
import { useCoreClasses, useCreateClass, useUpdateClass } from "../../hooks/use-class-form";
import {
  classSingleFormSchema,
  type ClassSingleFormValues,
} from "../../schemas/class-section-schema";

interface SingleClassFormProps {
  mode?: "create" | "view" | "edit";
  initialData?: MasterClass | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  onEdit?: () => void;
}

export function SingleClassForm({
  mode = "create",
  initialData,
  onSuccess,
  onCancel,
  onEdit,
}: SingleClassFormProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const previousModeRef = useRef(mode);
  const isTransitioningToEdit = useRef(false);

  // Fetch data
  const { data: coreClasses = [], isLoading: loadingCoreClasses } = useCoreClasses();

  // Initialize form
  const form = useForm<ClassSingleFormValues>({
    resolver: zodResolver(classSingleFormSchema),
    defaultValues: initialData
      ? getSingleFormValuesFromClass(initialData)
      : getDefaultSingleFormValues(),
    shouldFocusError: true,
  });

  // Reset form when initialData changes (only if form is not dirty)
  useEffect(() => {
    if (initialData && !form.formState.isDirty) {
      const formValues = getSingleFormValuesFromClass(initialData);
      form.reset(formValues, {
        keepDefaultValues: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData?.public_id]); // Only reset when the actual data ID changes, not on mode change

  // Track mode changes to prevent auto-submission
  useEffect(() => {
    if (previousModeRef.current === "view" && mode === "edit") {
      isTransitioningToEdit.current = true;
      // Clear the flag after a short delay to allow the transition to complete
      const timer = setTimeout(() => {
        isTransitioningToEdit.current = false;
      }, 100);
      return () => clearTimeout(timer);
    }
    previousModeRef.current = mode;
  }, [mode]);

  // Auto-scroll to first error field
  useScrollToError(form.formState.errors);

  // Handle successful mutation
  const handleMutationSuccess = () => {
    setShowSuccess(true);
    if (!isEditMode) {
      form.reset();
    }
    setTimeout(() => setShowSuccess(false), 3000);
    onSuccess?.();
  };

  // Setup mutations
  const createMutation = useCreateClass(
    handleMutationSuccess,
    form.setError as unknown as UseFormSetError<FieldValues>
  );
  const updateMutation = useUpdateClass(
    handleMutationSuccess,
    form.setError as unknown as UseFormSetError<FieldValues>
  );

  // Form submission handler - MUST check mode first
  const onSubmit = (data: ClassSingleFormValues) => {
    if (isViewMode) {
      return;
    }
    if (isTransitioningToEdit.current) {
      return;
    }

    if (isEditMode && initialData?.public_id) {
      updateMutation.mutate({
        publicId: initialData.public_id,
        data: {
          class_master: data.class_master || 0,
          name: data.name || "",
          class_teacher: data.class_teacher || undefined,
          info: data.info || undefined,
          capacity: data.capacity || undefined,
        },
      });
    } else {
      createMutation.mutate({
        class_master: data.class_master || 0,
        name: data.name || "",
        class_teacher: data.class_teacher || undefined,
        info: data.info || undefined,
        capacity: data.capacity || undefined,
      });
    }
  };

  // Get form configuration based on mode
  let formTitle = "Add Section";
  let formDescription = "Create a new section";
  if (isViewMode) {
    formTitle = "View Section";
    formDescription = "Review section details";
  } else if (isEditMode) {
    formTitle = "Edit Section";
    formDescription = "Update section information";
  }

  const formConfig = {
    title: formTitle,
    description: formDescription,
  };

  if (loadingCoreClasses) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <PageWrapper title={formConfig.title} description={formConfig.description} onBack={onCancel}>
      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="font-medium text-green-800">
            Section {isEditMode ? "updated" : "created"} successfully!
          </p>
        </div>
      )}

      {/* Form */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Section Details</CardTitle>
          <CardDescription>
            {isViewMode ? "Section information" : "Enter the section information below"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <fieldset disabled={isViewMode} className="space-y-6">
                {/* Class Master (Read-only in edit/view modes) */}
                {isViewMode || isEditMode ? (
                  <div className="space-y-2">
                    <Label>Class</Label>
                    <div className="border-input rounded-md border bg-gray-50 px-3 py-2 text-sm">
                      {initialData?.class_master.name || "Not selected"}
                    </div>
                  </div>
                ) : (
                  <FormField
                    control={form.control}
                    name="class_master"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class *</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={
                            field.value && field.value > 0 ? field.value.toString() : undefined
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select class..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {coreClasses.map((coreClass) => (
                              <SelectItem key={coreClass.id} value={coreClass.id.toString()}>
                                {coreClass.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Section Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Section Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., A, B, C" {...field} />
                      </FormControl>
                      <FormDescription>
                        Single character or short name for the section
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Class Teacher */}
                <TeacherField
                  control={form.control as unknown as Control<FieldValues>}
                  name="class_teacher"
                  label="Class Teacher"
                  disabled={isViewMode}
                />

                {/* Capacity */}
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 40"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value ? parseInt(value) : null);
                          }}
                        />
                      </FormControl>
                      <FormDescription>Maximum number of students (1-200)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="info"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional information about this section..."
                          className="resize-none"
                          rows={3}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </fieldset>

              {/* Form Actions */}
              {isViewMode ? (
                <div className="flex justify-end gap-3 border-t pt-6">
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={onEdit} className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Section
                  </Button>
                </div>
              ) : (
                <div className="flex justify-end gap-3 border-t pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="gap-2"
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {isEditMode ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {isEditMode ? "Update Section" : "Create Section"}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
