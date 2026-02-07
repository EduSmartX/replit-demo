/**
 * Class and Subject Filter Component
 * Reusable filter for selecting class and optionally subject
 * Used in Student and Subject listing pages
 */

import { useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, API_ENDPOINTS } from "@/lib/api";
import { fetchClasses } from "@/lib/api/class-api";

interface CoreSubject {
  id: number;
  public_id: string;
  name: string;
  code: string;
}

interface ClassItem {
  public_id: string;
  name: string;
  class_master?: {
    name: string;
  };
  class_master_name?: string;
}

interface ClassSubjectFilterProps {
  selectedClassId: string;
  selectedSubjectId?: string;
  onClassChange: (classId: string) => void;
  onSubjectChange?: (subjectId: string) => void;
  showSubjectFilter?: boolean;
  className?: string;
}

export function ClassSubjectFilter({
  selectedClassId,
  selectedSubjectId,
  onClassChange,
  onSubjectChange,
  showSubjectFilter = false,
  className = "",
}: ClassSubjectFilterProps) {
  const { data: classesData, isLoading: loadingClasses } = useQuery({
    queryKey: ["classes"],
    queryFn: () => fetchClasses(),
  });

  const { data: subjectsData, isLoading: loadingSubjects } = useQuery({
    queryKey: ["core", "subjects"],
    queryFn: async () => {
      const response = await api.get(API_ENDPOINTS.core.subjects);
      return response;
    },
  });

  const classes = classesData?.data || [];
  // Handle both direct array and wrapped response
  const subjects = (() => {
    if (Array.isArray(subjectsData)) {
      return subjectsData;
    }
    const data = subjectsData as { data?: CoreSubject[] };
    if (Array.isArray(data?.data)) {
      return data.data;
    }
    return [];
  })();

  return (
    <div className={`flex flex-col gap-4 md:flex-row ${className}`}>
      {/* Class Filter */}
      <div className="flex-1 space-y-2">
        <Label>Filter by Class</Label>
        <Select value={selectedClassId} onValueChange={onClassChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={loadingClasses ? "Loading..." : "Select a class"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classes.map((classItem: ClassItem) => (
              <SelectItem key={classItem.public_id} value={classItem.public_id}>
                {classItem.class_master?.name || classItem.class_master_name || ""} -{" "}
                {classItem.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Subject Filter (Optional) */}
      {showSubjectFilter && onSubjectChange && (
        <div className="flex-1 space-y-2">
          <Label>Filter by Subject</Label>
          <Select value={selectedSubjectId || "all"} onValueChange={onSubjectChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={loadingSubjects ? "Loading..." : "Select a subject"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects?.map((subject: CoreSubject) => (
                <SelectItem key={subject.id} value={subject.id.toString()}>
                  {subject.name} ({subject.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
