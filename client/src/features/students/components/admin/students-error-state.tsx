/**
 * Students Error State Component
 * Displays error message with retry option
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StudentsErrorStateProps {
  onRetry: () => void;
}

export function StudentsErrorState({ onRetry }: StudentsErrorStateProps) {
  return (
    <div className="mx-auto max-w-7xl">
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-700">Error Loading Students</CardTitle>
          <CardDescription className="text-red-600">
            Failed to load student data. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onRetry}>Retry</Button>
        </CardContent>
      </Card>
    </div>
  );
}
