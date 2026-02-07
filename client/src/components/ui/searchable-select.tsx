"use client";

import { Search } from "lucide-react";
import * as React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchableSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  searchThreshold?: number; // Auto-enable search if children count > threshold (default: 10)
  searchPlaceholder?: string;
  className?: string;
  id?: string;
}

/**
 * Enhanced Select component that automatically adds search functionality
 * when the number of options exceeds a threshold (default: 10)
 */
export function SearchableSelect({
  value,
  onValueChange,
  placeholder,
  children,
  disabled,
  searchThreshold = 10,
  searchPlaceholder = "Search...",
  className,
  id,
}: SearchableSelectProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [open, setOpen] = React.useState(false);

  // Count SelectItem children
  const itemCount = React.useMemo(() => {
    let count = 0;
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type === SelectItem) {
        count++;
      }
    });
    return count;
  }, [children]);

  const shouldShowSearch = itemCount > searchThreshold;

  // Filter children based on search term
  const filteredChildren = React.useMemo(() => {
    if (!shouldShowSearch || !searchTerm) {
      return children;
    }

    return React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) {
        return child;
      }

      // For SelectItem, check if the text content matches
      if (child.type === SelectItem) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const childText =
          typeof (child.props as any).children === "string"
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (child.props as any).children
            : "";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const childValue = (child.props as any).value || "";

        const matches =
          childText.toLowerCase().includes(searchTerm.toLowerCase()) ||
          childValue.toLowerCase().includes(searchTerm.toLowerCase());

        return matches ? child : null;
      }

      return child;
    });
  }, [children, searchTerm, shouldShowSearch]);

  // Clear search when dropdown closes
  React.useEffect(() => {
    if (!open) {
      setSearchTerm("");
    }
  }, [open]);

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      open={open}
      onOpenChange={setOpen}
    >
      <SelectTrigger className={className} id={id}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {shouldShowSearch && (
          <div className="flex items-center border-b px-3 pb-2">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
        )}
        <div className="max-h-[300px] overflow-y-auto">{filteredChildren}</div>
        {shouldShowSearch && searchTerm && React.Children.count(filteredChildren) === 0 && (
          <div className="text-muted-foreground py-6 text-center text-sm">No results found.</div>
        )}
      </SelectContent>
    </Select>
  );
}

// Re-export other Select components for convenience
export {
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select";
