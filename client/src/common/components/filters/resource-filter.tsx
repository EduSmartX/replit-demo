/**
 * Generic Resource Filter Component
 * Reusable filter for any resource with dynamic filter fields
 * Supports text inputs, selects, and custom components
 */

import { Filter, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterField {
  name: string;
  label: string;
  type: "text" | "select" | "custom";
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  customComponent?: React.ReactNode;
  disabled?: boolean;
}

interface ResourceFilterProps {
  fields: FilterField[];
  onFilter: (filters: Record<string, string>) => void;
  onReset: () => void;
  defaultValues?: Record<string, string>;
  className?: string;
}

export function ResourceFilter({
  fields = [],
  onFilter,
  onReset,
  defaultValues = {},
  className = "",
}: ResourceFilterProps) {
  const [filters, setFilters] = useState<Record<string, string>>(defaultValues);

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value && value !== "all") {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>);
    onFilter(activeFilters);
  };

  const handleReset = () => {
    setFilters({});
    onReset();
  };

  const hasActiveFilters = Object.values(filters).some((value) => value && value !== "all");

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name} className="text-sm font-medium">
                  {field.label}
                </Label>
                
                {field.type === "text" && (
                  <Input
                    id={field.name}
                    placeholder={field.placeholder}
                    value={filters[field.name] || ""}
                    onChange={(e) => handleFilterChange(field.name, e.target.value)}
                  />
                )}

                {field.type === "select" && field.options && (
                  <Select
                    value={filters[field.name] || "all"}
                    onValueChange={(value) => handleFilterChange(field.name, value)}
                    disabled={field.disabled}
                  >
                    <SelectTrigger id={field.name}>
                      <SelectValue placeholder={field.placeholder || "Select..."} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {field.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {field.type === "custom" && field.customComponent}
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleApplyFilters} size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
            {hasActiveFilters && (
              <Button onClick={handleReset} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
