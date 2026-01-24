/**
 * Subject Form Dialog
 * Form for creating/editing subject assignments
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast as sonnerToast } from "sonner";
import * as z from "zod";
import { DeletedDuplicateDialog } from "@/common/components/dialogs/deleted-duplicate-dialog";
import { useDeletedDuplicateHandler } from "@/common/hooks/use-deleted-duplicate-handler";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";
import { api, API_ENDPOINTS } from "@/lib/api";
import { fetchClasses } from "@/lib/api/class-api";
import {
    createSubject,
    updateSubject,
    reactivateSubject,
    type CoreSubject,
    type Subject,
    type SubjectCreatePayload
} from "@/lib/api/subject-api";
import { fetchTeachers } from "@/lib/api/teacher-api";
import {
    isDeletedDuplicateError,
    getDeletedDuplicateMessage,
    getDeletedRecordId,
    getApiErrorMessage,
} from "@/lib/error-utils";


const subjectFormSchema = z.object({
  class_id: z.string().min(1, "Class is required"),
  subject_id: z.string().min(1, "Subject is required"),
  teacher_id: z.string().optional(),
  description: z.string().optional(),
});

type SubjectFormValues = z.infer<typeof subjectFormSchema>;

interface SubjectFormDialogProps {
  open: boolean;
  onClose: () => void;
  subject?: Subject | null;
}

export function SubjectFormDialog({ open, onClose, subject }: SubjectFormDialogProps) {
  const { toast: _toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!subject;

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

  const createMutation = useMutation({
    mutationFn: ({ payload, forceCreate }: { payload: SubjectCreatePayload; forceCreate?: boolean }) =>
      createSubject(payload, forceCreate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      sonnerToast.success("Subject assigned successfully");
      onClose();
    },
    onError: (error: Error) => {
      if (isDeletedDuplicateError(error)) {
        const message = getDeletedDuplicateMessage(error);
        const deletedRecordId = getDeletedRecordId(error);
        const values = form.getValues();
        const payload: SubjectCreatePayload = {
          class_id: values.class_id,
          subject_id: Number(values.subject_id),
          teacher_id: values.teacher_id,
          description: values.description,
        };
        duplicateHandler.openDialog(message, { payload, deletedRecordId });
      } else {
        const errorMessage = getApiErrorMessage(error);
        sonnerToast.error(errorMessage);
      }
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: reactivateSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      duplicateHandler.closeDialog();
      sonnerToast.success("Subject reactivated successfully");
      onClose();
    },
    onError: (error: Error) => {
      const errorMessage = getApiErrorMessage(error);
      sonnerToast.error(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { teacher_id?: string; description?: string }) =>
      updateSubject(subject?.public_id || "", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      sonnerToast.success("Subject updated successfully");
      onClose();
    },
    onError: (error: Error) => {
      const errorMessage = getApiErrorMessage(error);
      sonnerToast.error(errorMessage);
    },
  });

  const classes = classesData?.data || [];
  // Handle both direct array and wrapped response
  const coreSubjects = Array.isArray(coreSubjectsData) 
    ? coreSubjectsData 
    : (coreSubjectsData as any)?.data || [];
  const teachers = teachersData?.data || [];

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: {
      class_id: "",
      subject_id: "",
      teacher_id: "",
      description: "",
    },
  });

  // Reset form when subject changes or dialog opens
  useEffect(() => {
    if (subject && open) {
      // subject_info now includes the numeric id directly
      const subjectId = subject.subject_info?.id?.toString() || "";
      
      const formData = {
        class_id: subject.class_info.public_id,
        subject_id: subjectId,
        teacher_id: subject.teacher_info.public_id,
        description: subject.description || "",
      };
      
      form.reset(formData);
    } else if (!subject && open) {
      form.reset({
        class_id: "",
        subject_id: "",
        teacher_id: "",
        description: "",
      });
    }
  }, [subject, open, form]);

  const onSubmit = (data: SubjectFormValues) => {
    if (isEditMode) {
      updateMutation.mutate({
        teacher_id: data.teacher_id,
        description: data.description,
      });
    } else {
      const payload: SubjectCreatePayload = {
        class_id: data.class_id,
        subject_id: Number(data.subject_id),
        teacher_id: data.teacher_id,
        description: data.description,
      };
      createMutation.mutate({ payload, forceCreate: false });
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit Subject Assignment" : "Assign Subject"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the teacher or description for this subject"
              : "Assign a subject to a class with a teacher"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Class Selection - Disabled in edit mode */}
            <FormField
              control={form.control}
              name="class_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isEditMode || loadingClasses}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classes.map((classItem: any) => (
                        <SelectItem key={classItem.public_id} value={classItem.public_id}>
                          {classItem.class_master?.name || classItem.class_master_name} - {classItem.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Subject Selection - Disabled in edit mode */}
            <FormField
              control={form.control}
              name="subject_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isEditMode || loadingSubjects}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {coreSubjects.map((subject: any) => (
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

            {/* Teacher Selection */}
            <FormField
              control={form.control}
              name="teacher_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teacher (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={loadingTeachers}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a teacher" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teachers.map((teacher: any) => (
                        <SelectItem key={teacher.public_id} value={teacher.public_id}>
                          {teacher.full_name} ({teacher.employee_id})
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
                      placeholder="Additional notes about this assignment..."
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditMode ? "Update" : "Assign"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>

      <DeletedDuplicateDialog
        open={duplicateHandler.isOpen}
        onOpenChange={duplicateHandler.closeDialog}
        message={duplicateHandler.message}
        onReactivate={handleReactivate}
        onCreateNew={handleCreateNew}
        onCancel={duplicateHandler.closeDialog}
      />
    </Dialog>
  );
}
