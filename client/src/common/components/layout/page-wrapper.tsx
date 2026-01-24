/**
 * Page Wrapper Component
 * Provides consistent layout and styling across all pages
 */

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

interface PageWrapperProps {
  title: string;
  description: string;
  onBack?: () => void;
  actions?: ReactNode;
  children: ReactNode;
}

export function PageWrapper({
  title,
  description,
  onBack,
  actions,
  children,
}: PageWrapperProps) {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} title="Back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {title}
            </h1>
            <p className="mt-2 text-gray-600">{description}</p>
          </div>
        </div>
        {actions && <div className="flex items-center gap-4">{actions}</div>}
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
