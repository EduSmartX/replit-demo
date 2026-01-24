/**
 * Form Section Card Component
 * Provides consistent card styling for collapsible sections in forms
 */

import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { ReactNode } from "react";

interface FormSectionCardProps {
  title: string;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onRemove?: () => void;
  showRemove?: boolean;
  children: ReactNode;
}

export function FormSectionCard({
  title,
  index: _index,
  isExpanded,
  onToggle,
  onRemove,
  showRemove = true,
  children,
}: FormSectionCardProps) {
  return (
    <Card className="border border-blue-200">
      <CardHeader
        className="cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <div className="flex items-center gap-2">
            {showRemove && onRemove && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="h-8 w-8 text-red-600 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-600" />
            )}
          </div>
        </div>
      </CardHeader>
      {isExpanded && <CardContent className="pt-6">{children}</CardContent>}
    </Card>
  );
}
