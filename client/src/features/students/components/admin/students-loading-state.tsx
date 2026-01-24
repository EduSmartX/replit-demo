/**
 * Students Loading State Component
 * Displays loading spinner with message
 */

import { Card, CardContent } from "@/components/ui/card";

interface StudentsLoadingStateProps {
  message?: string;
}

export function StudentsLoadingState({ message = "Loading classes..." }: StudentsLoadingStateProps) {
  return (
    <div>
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="text-gray-600">{message}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
