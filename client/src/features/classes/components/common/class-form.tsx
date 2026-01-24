/**
 * Multi-Row Class Form Component (Create Mode Only)
 * Allows creating multiple class sections at once with expandable rows
 * For view/edit of single sections, use SingleClassForm component
 */

import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { useState } from "react";
import { DeletedDuplicateDialog } from "@/common/components/dialogs";
import { PageWrapper } from "@/common/components/layout";
import { useDeletedDuplicateHandler } from "@/common/hooks/use-deleted-duplicate-handler";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createClass, reactivateClass } from "@/lib/api/class-api";
import { isDeletedDuplicateError, getDeletedDuplicateMessage, getApiErrorMessage, getDeletedRecordId } from "@/lib/error-utils";
import type { ClassCreatePayload } from "@/lib/types/class";
import {
  updateClassField,
  validateClasses,
} from "../../helpers/class-form-helpers";
import { useCoreClasses, useTeachers } from "../../hooks/use-class-form";
import { getDefaultSectionRow, type ClassSectionRow } from "../../schemas/class-section-schema";
import { ClassSectionRow as ClassSectionRowComponent } from "./class-section-row";

interface MultiRowClassFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MultiRowClassForm({
  onSuccess,
  onCancel,
}: MultiRowClassFormProps) {
  const [section, setSection] = useState<ClassSectionRow>(getDefaultSectionRow());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data using custom hooks
  const { data: coreClasses = [], isLoading: loadingCoreClasses } = useCoreClasses();
  const { data: teachers = [], isLoading: loadingTeachers } = useTeachers();

  // Deleted duplicate handler - stores info about the failed section
  const duplicateHandler = useDeletedDuplicateHandler<{
    payload: ClassCreatePayload;
    sectionName: string;
    deletedRecordId: string | null;
  }>();

  const handleSubmit = async () => {
    const validation = validateClasses([section]);
    
    if (!validation.isValid) {
      toast({
        title: "Validation Error",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const coreClass = coreClasses.find((c) => c.id.toString() === section.core_class_id);
    
    if (!coreClass) {
      toast({
        title: "Validation Error",
        description: "Invalid class selected",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const sectionName = `${coreClass.name} - ${section.section_name.trim()}`;
    const payload: ClassCreatePayload = {
      class_master: coreClass.id,
      name: section.section_name.trim(),
      class_teacher: section.class_teacher_id || undefined,
      info: section.description || undefined,
      capacity: section.capacity || undefined,
    };

    try {
      await createClass(payload);
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast({
        title: "Success",
        description: `Created ${sectionName} successfully`,
      });
      setIsSubmitting(false);
      onSuccess?.();
    } catch (error: any) {
      setIsSubmitting(false);
      
      if (isDeletedDuplicateError(error)) {
        const message = getDeletedDuplicateMessage(error);
        const deletedRecordId = getDeletedRecordId(error);
        duplicateHandler.openDialog(message, {
          payload,
          sectionName,
          deletedRecordId
        });
      } else {
        // Use utility to extract error message
        const errorMsg = getApiErrorMessage(error);
        
        toast({
          title: "Error Creating Section",
          description: errorMsg,
          variant: "destructive",
        });
      }
    }
  };

  const handleReactivate = async () => {
    if (duplicateHandler.pendingData?.deletedRecordId) {
      try {
        await reactivateClass(duplicateHandler.pendingData.deletedRecordId);
        queryClient.invalidateQueries({ queryKey: ["classes"] });
        toast({
          title: "Success",
          description: `Reactivated ${duplicateHandler.pendingData.sectionName} successfully`,
        });
        duplicateHandler.closeDialog();
        onSuccess?.();
      } catch (error: any) {
        const errorMsg = getApiErrorMessage(error);
        toast({
          title: "Error Reactivating Section",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Error",
        description: "Cannot reactivate: Deleted record ID not found",
        variant: "destructive",
      });
    }
  };

  const handleCreateNew = async () => {
    // Retry the failed section with force_create=true
    if (duplicateHandler.pendingData) {
      const { payload, sectionName } = duplicateHandler.pendingData;
      
      try {
        await createClass(payload, true); // force_create = true
        queryClient.invalidateQueries({ queryKey: ["classes"] });
        toast({
          title: "Success",
          description: `Created ${sectionName} successfully`,
        });
        duplicateHandler.closeDialog();
        onSuccess?.();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to create section",
          variant: "destructive",
        });
        duplicateHandler.closeDialog();
      }
    }
  };

  const handleCancelDialog = () => {
    duplicateHandler.closeDialog();
  };

  const isLoading = isSubmitting || loadingCoreClasses || loadingTeachers;

  return (
    <>
      <PageWrapper
        title="Add Section"
        description="Create a new class section"
        onBack={onCancel}
      >
        {/* Form */}
        <div className="space-y-4">
          <ClassSectionRowComponent
            section={section}
            index={0}
            coreClasses={coreClasses}
            teachers={teachers}
            canDelete={false}
            onUpdate={(field, value) =>
              setSection(prev => updateClassField([prev], prev.id, field, value)[0])
            }
            onToggleExpand={() => 
              setSection(prev => ({ ...prev, isExpanded: !prev.isExpanded }))
            }
            onDelete={() => {}}
          />

          {/* Form Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={onCancel} disabled={isLoading} type="button">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading} 
              className="gap-2" 
              type="button"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Section
                </>
              )}
            </Button>
          </div>
        </div>
      </PageWrapper>

      {/* Deleted Duplicate Dialog */}
      <DeletedDuplicateDialog
        open={duplicateHandler.isOpen}
        onOpenChange={(open) => !open && duplicateHandler.closeDialog()}
        message={duplicateHandler.message}
        onReactivate={handleReactivate}
        onCreateNew={handleCreateNew}
        onCancel={handleCancelDialog}
      />
    </>
  );
}
