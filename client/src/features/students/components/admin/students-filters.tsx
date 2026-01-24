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
import type { Class, ClassMaster } from "@/lib/api/student-api";

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
}: StudentsFiltersProps) {
  return (
    <div className="space-y-4">
      {/* All filters in one row */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="student-search" className="text-sm font-medium text-gray-700">Search</label>
          <Input
            id="student-search"
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
          <label htmlFor="student-class-master" className="text-sm font-medium text-gray-700">Select Class/Grade</label>
          <Select value={selectedClassMaster.toString()} onValueChange={onClassMasterChange}>
            <SelectTrigger id="student-class-master">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classMasters.map((classMaster) => (
                <SelectItem key={classMaster.id} value={classMaster.id.toString()}>
                  {classMaster.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="student-section" className="text-sm font-medium text-gray-700">Select Section</label>
          <Select 
            value={selectedSection} 
            onValueChange={onSectionChange}
            disabled={loadingSections || sections.length === 0}
          >
            <SelectTrigger id="student-section">
              <SelectValue 
                placeholder={
                  loadingSections 
                    ? "Loading..." 
                    : sections.length === 0 
                    ? "No sections" 
                    : "Select section"
                } 
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sections</SelectItem>
              {sections.map((section) => (
                <SelectItem key={section.public_id} value={section.public_id}>
                  {section.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search and Clear buttons at the bottom */}
      <div className="flex gap-4">
        <Button onClick={onSearch} className="gap-2">
          <Search className="h-4 w-4" />
          Search
        </Button>

        {hasActiveFilters && (
          <Button 
            variant="outline" 
            onClick={onClearFilters} 
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear All Filters
          </Button>
        )}
      </div>
    </div>
  );
}
