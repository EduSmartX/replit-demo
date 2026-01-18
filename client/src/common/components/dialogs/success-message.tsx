/**
 * Reusable Success Message Component
 */

import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SuccessMessageProps {
  title: string;
  description: string;
}

export function SuccessMessage({ title, description }: SuccessMessageProps) {
  return (
    <Card className="mx-auto max-w-2xl border-0 shadow-lg">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-center text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
}
