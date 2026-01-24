/**
 * Loading Spinner Component
 * Reusable loading state with spinner and optional message
 */

import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

interface LoadingSpinnerProps {
  message?: string;
  fullPage?: boolean;
}

export function LoadingSpinner({ 
  message = "Loading...", 
  fullPage = false 
}: LoadingSpinnerProps) {
  const content = (
    <div className="flex items-center justify-center p-12">
      <div className="text-center">
        <Spinner className="mx-auto h-12 w-12 text-purple-600 mb-4" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="mx-auto max-w-7xl">
        <Card>
          <CardContent>
            {content}
          </CardContent>
        </Card>
      </div>
    );
  }

  return content;
}
