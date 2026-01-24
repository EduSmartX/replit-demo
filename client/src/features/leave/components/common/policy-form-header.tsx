import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PolicyFormHeaderProps {
  mode: "create" | "view" | "edit";
  onCancel?: () => void;
  onEdit?: () => void;
}

export function PolicyFormHeader({ mode, onCancel, onEdit }: PolicyFormHeaderProps) {
  const titles = {
    view: "View Leave Allocation Policy",
    edit: "Edit Leave Allocation Policy",
    create: "Create Leave Allocation Policy",
  };

  const descriptions = {
    view: "Review leave policy details",
    edit: "Update leave policy for your organization",
    create: "Set up leave policies for your organization with role-specific allocations",
  };

  const isViewMode = mode === "view";

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onCancel} title="Back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {titles[mode]}
            </h1>
            <p className="text-gray-600 text-base">
              {descriptions[mode]}
            </p>
          </div>
        </div>
        {isViewMode && (
          <Button onClick={onEdit} className="gap-2">
            <Pencil className="h-4 w-4" />
            Edit Policy
          </Button>
        )}
      </div>
    </div>
  );
}
