/**
 * Single Subject Form
 * Form for creating subject assignments with deleted duplicate handling
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { DeletedDuplicateDialog } from "@/common/components/dialogs/deleted-duplicate-dialog";
import { useDeletedDuplicateHandler } from "@/common/hooks/use-deleted-duplicate-handler";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api, API_ENDPOINTS } from "@/lib/api";
import { fetchClasses } from "@/lib/api/class-api";
import {
  createSubject,
  reactivateSubject,
  updateSubject,
  type CoreSubject,
  type Subject,
  type SubjectCreatePayload,
  type SubjectUpdatePayload,
} from "@/lib/api/subject-api";
import { fetchTeachers } from "@/lib/api/teacher-api";
import {
  getDeletedDuplicateMessage,
  getDeletedRecordId,
  isDeletedDuplicateError,
  setFormFieldErrors
} from "@/lib/error-utils";

const subjectFormSchema = z.object({
  class_id: z.string().min(1, "Class is required"),
  subject_id: z.string().min(1, "Subject is required"),
  teacher_id: z.string().optional(),
  description: z.string().optional(),
});

type SubjectFormValues = z.infer<typeof subjectFormSchema>;

interface SingleSubjectFormProps {
  subject?: Subject | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SingleSubjectForm({ subject, onSuccess, onCancel }: SingleSubjectFormProps) {
  const isEditMode = !!subject;
  const queryClient = useQueryClient();


  // Extract actual subject data if it's wrapped in API response
  const subjectData = subject && 'data' in subject ? subject.data : subject;

  const duplicateHandler = useDeletedDuplicateHandler<{
    payload: SubjectCreatePayload;
    deletedRecordId: string | null;
  }>();

  const { data: classesData, isLoading: loadingClasses } = useQuery({
    queryKey: ["classes"],
    queryFn: () => fetchClasses(),
  });

  const { data: coreSubjectsData, isLoading: loadingSubjects } = useQuery({
    queryKey: ["core", "subjects"],
    queryFn: async () => {
      const response = await api.get<CoreSubject[]>(API_ENDPOINTS.core.subjects);
      return response;
    },
  });

  const { data: teachersData, isLoading: loadingTeachers } = useQuery({
    queryKey: ["teachers"],
    queryFn: () => fetchTeachers(),
  });

  const classes = classesData?.data || [];
  const coreSubjects = Array.isArray(coreSubjectsData)
    ? coreSubjectsData
    : (coreSubjectsData as any)?.data || [];
  const teachers = teachersData?.data || [];

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: subjectData ? {
      class_id: subjectData.class_info?.public_id || "",
      subject_id: subjectData.subject_info?.id?.toString() || "",
      teacher_id: subjectData.teacher_info?.public_id || "",
      description: subjectData.description || "",
    } : {
      class_id: "",
      subject_id: "",
      teacher_id: "",
      description: "",
    },
  });

  useEffect(() => {
    if (subjectData && subjectData.class_info && subjectData.subject_info) {
      form.reset({
        class_id: subjectData.class_info.public_id || "",
        subject_id: subjectData.subject_info.id.toString() || "",
        teacher_id: subjectData.teacher_info?.public_id || "",
        description: subjectData.description || "",
      });
    } else {
      form.reset({
        class_id: "",
        subject_id: "",
        teacher_id: "",
        description: "",
      });
    }
  }, [subject, form]);

  const createMutation = useMutation({
    mutationFn: ({ payload, forceCreate }: { payload: SubjectCreatePayload; forceCreate?: boolean }) =>
      createSubject(payload, forceCreate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      duplicateHandler.closeDialog();
      form.reset();
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: any) => {
      if (isDeletedDuplicateError(error)) {
        const message = getDeletedDuplicateMessage(error);
        const deletedRecordId = getDeletedRecordId(error);
        const formValues = form.getValues();
        const payload: SubjectCreatePayload = {
          class_id: formValues.class_id,
          subject_id: parseInt(formValues.subject_id),
          teacher_id: formValues.teacher_id || "",
          description: formValues.description || "",
        };

        duplicateHandler.openDialog(message, {
          payload,
          deletedRecordId
        });
        return;
      }

      // Use centralized error utility to set field errors
      setFormFieldErrors(error, form.setError);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: SubjectUpdatePayload) => {
      const publicId = subjectData?.public_id || "";
      return updateSubject(publicId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      onSuccess?.();
    },
    onError: (error: any) => {
      // Use centralized error utility to set field errors
      setFormFieldErrors(error, form.setError);
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: (publicId: string) => reactivateSubject(publicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      duplicateHandler.closeDialog();
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      // Error is displayed in dialog
    },
  });

  const onSubmit = (values: SubjectFormValues) => {
    if (isEditMode) {
      const updatePayload: SubjectUpdatePayload = {
        teacher_id: values.teacher_id,
        description: values.description || "",
      };
      updateMutation.mutate(updatePayload);
    } else {
      const payload: SubjectCreatePayload = {
        class_id: values.class_id,
        subject_id: parseInt(values.subject_id),
        teacher_id: values.teacher_id,
        description: values.description || "",
      };
      createMutation.mutate({ payload });
    }
  };

  const isLoading =
    createMutation.isPending || updateMutation.isPending || reactivateMutation.isPending || loadingClasses || loadingSubjects || loadingTeachers;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onCancel} title="Back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="mb-3 text-3xl font-bold text-gray-900">
              {isEditMode ? "Edit Subject" : "Assign Subject"}
            </h1>
            <p className="text-base text-gray-600">
              {isEditMode 
                ? "Update teacher or description for this subject assignment" 
                : "Assign a subject to a class with a teacher"}
            </p>
          </div>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Class Selection */}
                  <FormField
                    control={form.control}
                    name="class_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoading || isEditMode}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select class..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {classes.map((cls) => (
                              <SelectItem key={cls.public_id} value={cls.public_id}>
                                {cls.class_master.name} - {cls.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Subject Selection */}
                  <FormField
                    control={form.control}
                    name="subject_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoading || isEditMode}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select subject..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {coreSubjects.map((subject: CoreSubject) => (
                              <SelectItem key={subject.id} value={subject.id.toString()}>
                                {subject.name} ({subject.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Teacher Selection */}
                  <FormField
                    control={form.control}
                    name="teacher_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teacher (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select teacher..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {teachers.map((teacher) => (
                              <SelectItem key={teacher.public_id} value={teacher.public_id}>
                                {teacher.full_name} ({teacher.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                            placeholder="Optional notes about this assignment..."
                            {...field}
                            disabled={isLoading}
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <Card>
              <CardContent className="flex justify-end gap-3 pt-6">
                <Button variant="outline" onClick={onCancel} disabled={isLoading} type="button">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {isEditMode ? "Update Subject" : "Save Subject"}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>

      {!isEditMode && (
        <DeletedDuplicateDialog
          open={duplicateHandler.isOpen}
          onOpenChange={duplicateHandler.closeDialog}
          message={duplicateHandler.message}
          onReactivate={() => {
            if (duplicateHandler.pendingData?.deletedRecordId) {
              reactivateMutation.mutate(duplicateHandler.pendingData.deletedRecordId);
            }
          }}
          onCreateNew={() => {
            if (duplicateHandler.pendingData?.payload) {
              createMutation.mutate({ payload: duplicateHandler.pendingData.payload, forceCreate: true });
            }
          }}
          onCancel={duplicateHandler.closeDialog}
        />
      )}
    </>
  );
}
