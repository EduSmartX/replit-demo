/**
 * Page Wrapper Component
 * Provides consistent spacing and layout for all page content
 * Ensures uniform padding and max-width across the application
 */

import type { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
  /** Optional className for additional styling */
  className?: string;
  /** Whether to apply max-width constraint (default: true) */
  maxWidth?: boolean;
  /** Custom max-width class (default: max-w-7xl) */
  maxWidthClass?: string;
}

export function PageWrapper({ 
  children, 
  className = "", 
  maxWidth = true,
  maxWidthClass = "max-w-7xl"
}: PageWrapperProps) {
  return (
    <div className={`pt-6 space-y-6 ${maxWidth ? `mx-auto ${maxWidthClass}` : 'w-full'} ${className}`}>
      {children}
    </div>
  );
}
