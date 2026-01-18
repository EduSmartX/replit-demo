/**
 * Students Empty State Component
 * Displays message when no classes are available
 */

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function StudentsEmptyState() {
  return (
    <div className="mx-auto max-w-7xl">
      <Card>
        <CardHeader>
          <CardTitle>No Classes Available</CardTitle>
          <CardDescription>
            Please create a class first before adding students.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
