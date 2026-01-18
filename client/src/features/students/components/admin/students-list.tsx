/**
 * Students List Component
 * Displays filterable and paginated student list with CRUD operations
 */

import { useQuery } from "@tanstack/react-query";
import { Filter } from "lucide-react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { TablePagination } from "@/components/ui/table-pagination";
import { 
  fetchStudents, 
  fetchClassMasters, 
  fetchSectionsByClassMaster, 
  type Student 
} from "@/lib/api/student-api";
import { StudentsHeader } from "./students-header";
import { StudentsStats } from "./students-stats";
import { StudentsFilters } from "./students-filters";
import { getStudentColumns } from "./students-table-columns";
import { StudentsErrorState } from "./students-error-state";
import { StudentsLoadingState } from "./students-loading-state";
import { StudentsEmptyState } from "./students-empty-state";

interface StudentsListProps {
  onCreateNew: (sectionId: string) => void;
  onView: (student: Student) => void;
  onEdit: (student: Student) => void;
  onDelete: (publicId: string) => void;
}

export function StudentsList({ onCreateNew, onView, onEdit, onDelete }: StudentsListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Two-tier state: UI selections (selectedX) vs applied filters (appliedX) for explicit search trigger
  const [selectedClassMaster, setSelectedClassMaster] = useState<number | "">("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");
  
  const [appliedClassMaster, setAppliedClassMaster] = useState<number | "">("");
  const [appliedSection, setAppliedSection] = useState<string>("");
  const [appliedSearch, setAppliedSearch] = useState<string>("");

  const { data: classMasters = [], isLoading: loadingClassMasters } = useQuery({
    queryKey: ["classMasters"],
    queryFn: fetchClassMasters,
  });

  // Cascading dropdown: Sections depend on selected class master
  const { data: sections = [], isLoading: loadingSections } = useQuery({
    queryKey: ["sections", selectedClassMaster],
    queryFn: () => fetchSectionsByClassMaster(selectedClassMaster),
    enabled: !!selectedClassMaster,
  });

  // Auto-select first class and section on load
  useEffect(() => {
    if (classMasters.length > 0 && !selectedClassMaster) {
      const firstClass = classMasters[0];
      setSelectedClassMaster(firstClass.id);
      setAppliedClassMaster(firstClass.id);
    }
  }, [classMasters, selectedClassMaster]);

  useEffect(() => {
    if (sections.length > 0 && selectedClassMaster && !selectedSection) {
      const firstSection = sections[0];
      setSelectedSection(firstSection.public_id);
      setAppliedSection(firstSection.public_id);
    } else if (sections.length === 0) {
      setSelectedSection("");
      setAppliedSection("");
    }
  }, [sections, selectedClassMaster, selectedSection]);
  // Fetch students using applied filters (not UI state) - query fires only when appliedX values change
  const {
    data: studentsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["students", appliedClassMaster, appliedSection, appliedSearch],
    queryFn: () =>
      fetchStudents({
        page: 1,
        page_size: 100,
        class_master_id: appliedClassMaster ? appliedClassMaster.toString() : undefined,
        section_id: appliedSection || undefined,
        search: appliedSearch || undefined,
      }),
    enabled: !!appliedClassMaster,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const allStudents = studentsData?.results || [];

  // Client-side pagination
  const totalRecords = allStudents.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const students = allStudents.slice(startIndex, endIndex);

  // Apply UI selections to trigger API query (called by Search button)
  const handleSearch = () => {
    setAppliedClassMaster(selectedClassMaster);
    setAppliedSection(selectedSection);
    setAppliedSearch(searchInput);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    if (classMasters.length > 0) {
      const firstClass = classMasters[0];
      setSelectedClassMaster(firstClass.id);
      setAppliedClassMaster(firstClass.id);
    }
    setSelectedSection("");
    setAppliedSection("");
    setSearchInput("");
    setAppliedSearch("");
    setCurrentPage(1);
  };

  // Reset dependent section when class master changes
  const handleClassMasterChange = (value: string) => {
    const numValue = Number(value);
    setSelectedClassMaster(numValue);
    setSelectedSection("");
    setCurrentPage(1);
  };

  const handleSectionChange = (value: string) => {
    setSelectedSection(value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setCurrentPage(1);
  };

  const hasActiveFilters = appliedSection !== "" || appliedSearch !== "";
  const columns = getStudentColumns({ onView, onEdit, onDelete });

  if (error) {
    return <StudentsErrorState onRetry={() => refetch()} />;
  }

  if (loadingClassMasters) {
    return <StudentsLoadingState message="Loading classes..." />;
  }

  if (classMasters.length === 0) {
    return <StudentsEmptyState />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <StudentsHeader
        onAddStudent={() => selectedSection && onCreateNew(selectedSection)}
        canAddStudent={!!selectedSection}
      />

      <StudentsStats
        totalRecords={totalRecords}
        displayedCount={students.length}
        hasActiveFilters={hasActiveFilters}
      />

      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <CardTitle>Filters & Search</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <StudentsFilters
            selectedClassMaster={selectedClassMaster}
            selectedSection={selectedSection}
            searchInput={searchInput}
            classMasters={classMasters}
            sections={sections}
            loadingSections={loadingSections}
            onClassMasterChange={handleClassMasterChange}
            onSectionChange={handleSectionChange}
            onSearchInputChange={setSearchInput}
            onSearch={handleSearch}
            onClearFilters={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Students List</CardTitle>
          <CardDescription>
            {students.length > 0
              ? `Showing ${startIndex + 1} to ${Math.min(endIndex, totalRecords)} of ${totalRecords} students`
              : "No students found"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={students} isLoading={isLoading} />

          {totalPages > 1 && (
            <div className="mt-4">
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
