/**
 * Teacher Form Component (Common - Reusable)
 * TODO: Complete implementation - missing components and logic hook
 */

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Teacher } from "@/lib/api/teacher-api";
import type { FormMode } from "@/lib/utils/form-utils";

interface TeacherFormProps {
  mode?: FormMode;
  initialData?: Teacher | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  onEdit?: () => void;
}

export function TeacherForm(_props: TeacherFormProps) {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
        <CardTitle className="text-purple-900">Teacher Form</CardTitle>
        <CardDescription className="text-purple-700">
          This form is not yet fully implemented. Missing components: MultiTeacherFormSection,
          SingleTeacherFormSection, TeacherFormActions, TeacherFormHeader, and useTeacherFormLogic
          hook.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
