/**
 * Students Filters Component
 * Filter controls for class, section, and search
 */

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ClassMaster, Class } from "@/lib/api/student-api";

interface StudentsFiltersProps {
  selectedClassMaster: number | string;
  selectedSection: string;
  searchInput: string;
  classMasters: ClassMaster[];
  sections: Class[];
  loadingSections: boolean;
  onClassMasterChange: (value: string) => void;
  onSectionChange: (value: string) => void;
  onSearchInputChange: (value: string) => void;
  onSearch: () => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
}

export function StudentsFilters({
  selectedClassMaster,
  selectedSection,
  searchInput,
  classMasters,
  sections,
  loadingSections,
  onClassMasterChange,
  onSectionChange,
  onSearchInputChange,
  onSearch,
  onClearFilters,
  hasActiveFilters,
  pageSize,
  onPageSizeChange,
}: StudentsFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Search</label>
          <Input
            placeholder="Search by name, roll number..."
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSearch();
              }
            }}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Select Class/Grade</label>
          <Select value={selectedClassMaster.toString()} onValueChange={onClassMasterChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {classMasters.map((classMaster) => (
                <SelectItem key={classMaster.id} value={classMaster.id.toString()}>
                  {classMaster.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Select Section</label>
          <Select 
            value={selectedSection} 
            onValueChange={onSectionChange}
            disabled={loadingSections || sections.length === 0}
          >
            <SelectTrigger>
              <SelectValue 
                placeholder={
                  loadingSections 
                    ? "Loading..." 
                    : sections.length === 0 
                    ? "No sections" 
                    : "All sections"
                } 
              />
            </SelectTrigger>
            <SelectContent>
              {sections.map((section) => (
                <SelectItem key={section.public_id} value={section.public_id}>
                  {section.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button onClick={onSearch} className="w-full gap-2">
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Items per page</label>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="25">25 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
              <SelectItem value="100">100 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <div className="flex items-end md:col-start-4">
            <Button 
              variant="outline" 
              onClick={onClearFilters} 
              className="w-full gap-2"
            >
              <X className="h-4 w-4" />
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
