/**
 * Multi-Row Class Form Component (Create Mode Only)
 * Allows creating multiple class sections at once with expandable rows
 * For view/edit of single sections, use SingleClassForm component
 */

import { Loader2, Plus, Save } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  addClassRow,
  removeClassRow,
  toggleClassExpand,
  updateClassField,
  validateClasses,
} from "../../helpers/class-form-helpers";
import { useCoreClasses, useTeachers, useCreateMultipleClasses } from "../../hooks/use-class-form";
import { getDefaultSectionRow, type ClassSectionRow } from "../../schemas/class-section-schema";
import { ClassSectionFormHeader } from "./class-section-form-header";
import { ClassSectionRow as ClassSectionRowComponent } from "./class-section-row";

interface MultiRowClassFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MultiRowClassForm({
  onSuccess,
  onCancel,
}: MultiRowClassFormProps) {
  const [sections, setSections] = useState<ClassSectionRow[]>([getDefaultSectionRow()]);

  const { toast } = useToast();

  // Fetch data using custom hooks
  const { data: coreClasses = [], isLoading: loadingCoreClasses } = useCoreClasses();
  const { data: teachers = [], isLoading: loadingTeachers } = useTeachers();

  // Create classes mutation
  const createClassesMutation = useCreateMultipleClasses(onSuccess);

  const handleSubmit = () => {
    const validation = validateClasses(sections);
    
    if (!validation.isValid) {
      toast({
        title: "Validation Error",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    createClassesMutation.mutate({ classes: sections, coreClasses });
  };

  const isLoading = createClassesMutation.isPending || loadingCoreClasses || loadingTeachers;

  return (
    <div className="mx-auto max-w-6xl">
      <ClassSectionFormHeader onCancel={onCancel} />

      {/* Form */}
      <div className="space-y-4">
        {sections.map((section, index) => (
          <ClassSectionRowComponent
            key={section.id}
            section={section}
            index={index}
            coreClasses={coreClasses}
            teachers={teachers}
            canDelete={sections.length > 1}
            onUpdate={(field, value) =>
              setSections(updateClassField(sections, section.id, field, value))
            }
            onToggleExpand={() => setSections(toggleClassExpand(sections, section.id))}
            onDelete={() => setSections(removeClassRow(sections, section.id))}
          />
        ))}

        {/* Add Section Button */}
        <Button
          type="button"
          variant="outline"
          onClick={() => setSections(addClassRow(sections))}
          className="w-full gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Another Section
        </Button>

        {/* Form Actions */}
        <Card>
          <CardContent className="flex justify-end gap-3 pt-6">
            <Button variant="outline" onClick={onCancel} disabled={isLoading} type="button">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading} className="gap-2" type="button">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save All Sections
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
