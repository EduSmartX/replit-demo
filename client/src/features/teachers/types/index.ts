import type { Teacher } from "@/lib/api/teacher-api";

export type TeacherFormMode = "create" | "edit" | "view";

export interface TeacherFormProps {
  mode: TeacherFormMode;
  initialData?: Teacher | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  onEdit?: () => void;
}

export type { Teacher } from "@/lib/api/teacher-api";
