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
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="mb-3 text-3xl font-bold text-gray-900">
          Students Management
        </h1>
        <p className="text-base text-gray-600">
          Manage student information, enrollments, and guardian details
        </p>
      </div>
      <div className="flex gap-2 justify-end">
        <Button
          onClick={onAddStudent}
          disabled={!canAddStudent}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </div>
    </div>
  );
}
