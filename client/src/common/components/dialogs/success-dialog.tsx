/**
 * Common Success Dialog Utility Component
 * Displays a centered modal dialog for success messages
 * Auto-redirects after showing success message
 */

import { CheckCircle2 } from "lucide-react";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SuccessDialogProps {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  /** Auto close delay in milliseconds (default: 2000) */
  autoCloseDelay?: number;
}

export function SuccessDialog({
  open,
  title,
  description,
  onClose,
  autoCloseDelay = 2000,
}: SuccessDialogProps) {
  useEffect(() => {
    if (open && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [open, autoCloseDelay, onClose]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold text-green-900">
            {title}
          </DialogTitle>
          <DialogDescription className="text-center text-base text-gray-600">
            {description}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
