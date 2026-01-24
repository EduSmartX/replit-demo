import { Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeletedViewToggleProps {
  showDeleted: boolean;
  onToggle: () => void;
  resourceName?: string;
  className?: string;
}

export function DeletedViewToggle({
  showDeleted,
  onToggle,
  resourceName: _resourceName = "items",
  className,
}: DeletedViewToggleProps) {
  return (
    <Button
      onClick={onToggle}
      variant={showDeleted ? "default" : "outline"}
      className={className}
    >
      {showDeleted ? (
        <>
          <RotateCcw className="h-4 w-4 mr-2" />
          View Active
        </>
      ) : (
        <>
          <Trash2 className="h-4 w-4 mr-2" />
          View Deleted
        </>
      )}
    </Button>
  );
}
