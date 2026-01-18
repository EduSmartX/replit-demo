/**
 * Students Header Component
 * Page header with title and actions
 */

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StudentsHeaderProps {
  onAddStudent: () => void;
  canAddStudent: boolean;
}

export function StudentsHeader({ onAddStudent, canAddStudent }: StudentsHeaderProps) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-3xl font-bold text-transparent">
          Students Management
        </h1>
        <p className="mt-2 text-gray-600">
          Manage student information, enrollments, and guardian details
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={onAddStudent}
          disabled={!canAddStudent}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Student
        </Button>
      </div>
    </div>
  );
}
