/**
 * Common Delete Confirmation Dialog Utility Component
 * Displays a centered modal dialog for delete confirmations
 */

import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteConfirmationDialogProps {
  open: boolean;
  title?: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelText?: string;
  isDeleting?: boolean;
  variant?: "destructive" | "default";
}

export function DeleteConfirmationDialog({
  open,
  title = "Are you sure?",
  description,
  onConfirm,
  onCancel,
  confirmLabel = "Delete",
  cancelText = "Cancel",
  isDeleting = false,
  variant = "destructive",
}: DeleteConfirmationDialogProps) {
  const iconBgClass = variant === "destructive" ? "bg-red-100" : "bg-blue-100";
  const iconColorClass = variant === "destructive" ? "text-red-600" : "text-blue-600";
  const buttonClass = variant === "destructive" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700";
  
  return (
    <AlertDialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${iconBgClass}`}>
            <AlertTriangle className={`h-10 w-10 ${iconColorClass}`} />
          </div>
          <AlertDialogTitle className="text-center text-xl">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-center text-base">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:justify-center">
          <AlertDialogCancel onClick={onCancel} disabled={isDeleting}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className={buttonClass}
          >
            {isDeleting ? "Processing..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
