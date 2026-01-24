/**
 * Deleted Duplicate Dialog Component
 * Reusable dialog for handling deleted duplicate record scenarios
 * Shows options to Reactivate, Create New, or Cancel
 */

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export interface DeletedDuplicateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
  onReactivate: () => void;
  onCreateNew: () => void;
  onCancel?: () => void;
  reactivateLabel?: string;
  createNewLabel?: string;
  cancelLabel?: string;
  title?: string;
}

export function DeletedDuplicateDialog({
  open,
  onOpenChange,
  message,
  onReactivate,
  onCreateNew,
  onCancel,
  reactivateLabel = "Reactivate Existing",
  createNewLabel = "Create New Anyway",
  cancelLabel = "Cancel",
  title = "Duplicate Record Found",
}: DeletedDuplicateDialogProps) {
  const handleReactivate = () => {
    onOpenChange(false);
    onReactivate();
  };

  const handleCreateNew = () => {
    onOpenChange(false);
    onCreateNew();
  };

  const handleCancel = () => {
    onOpenChange(false);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-orange-600">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-base text-gray-700">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            onClick={handleReactivate}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {reactivateLabel}
          </Button>
          <Button
            onClick={handleCreateNew}
            variant="outline"
            className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            {createNewLabel}
          </Button>
          <AlertDialogCancel onClick={handleCancel} className="w-full mt-0">
            {cancelLabel}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
