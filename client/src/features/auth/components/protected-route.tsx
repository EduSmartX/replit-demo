import { Redirect, useLocation } from "wouter";
import { useUser } from "@/core/contexts";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * ProtectedRoute component that redirects to /auth if user is not authenticated
 * Stores the attempted URL to redirect back after login
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useUser();
  const [location] = useLocation();

  if (!user) {
    // Store the attempted URL for redirect after login
    sessionStorage.setItem("redirectAfterLogin", location);
    return <Redirect to="/auth" />;
  }

  return <>{children}</>;
}
