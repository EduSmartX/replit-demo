import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { ReactNode } from "react";

interface AuthFormCardProps {
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Shared wrapper component for authentication forms
 * Provides consistent styling for login, signup, and password reset forms
 */
export function AuthFormCard({ children, footer }: AuthFormCardProps) {
  return (
    <Card className="mx-auto w-full border-0 shadow-none sm:border sm:shadow-sm">
      <CardContent className="space-y-6 pt-8">
        {children}
      </CardContent>
      {footer && (
        <CardFooter className="pt-6">
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}
