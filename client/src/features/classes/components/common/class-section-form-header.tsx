/**
 * Class Section Form Header
 * Header component with back button for class section forms
 */

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ClassSectionFormHeaderProps {
  onCancel?: () => void;
}

export function ClassSectionFormHeader({ onCancel }: ClassSectionFormHeaderProps) {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Sections</h1>
          <p className="mt-1 text-gray-600">Create one or more sections for your classes</p>
        </div>
      </div>
    </div>
  );
}
