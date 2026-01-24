/**
 * Class Section Row Component
 * Individual expandable row for a single class section
 */

import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { CoreClass } from "@/lib/api/class-api";
import type { Teacher } from "@/lib/api/teacher-api";
import type { ClassSectionRow as ClassSectionRowType } from "../../schemas/class-section-schema";

interface ClassSectionRowProps {
  section: ClassSectionRowType;
  index: number;
  coreClasses: CoreClass[];
  teachers: Teacher[];
  canDelete: boolean;
  onUpdate: (field: keyof ClassSectionRowType, value: unknown) => void;
  onToggleExpand: () => void;
  onDelete: () => void;
}

export function ClassSectionRow({
  section,
  index,
  coreClasses,
  teachers,
  canDelete,
  onUpdate,
  onToggleExpand,
  onDelete,
}: ClassSectionRowProps) {
  return (
    <Card className="border border-blue-200">
      <CardHeader 
        className="cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors pb-3"
        onClick={onToggleExpand}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Section {index + 1}
            {section.section_name && ` - ${section.section_name}`}
          </CardTitle>
          <div className="flex items-center gap-2">
            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                type="button"
                className="h-8 w-8 text-red-600 hover:bg-red-100"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            {section.isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-600" />
            )}
          </div>
        </div>
      </CardHeader>

      {section.isExpanded && (
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Core Class Dropdown */}
            <div className="space-y-2">
              <Label htmlFor={`class-${section.id}`}>
                Class <span className="text-red-500">*</span>
              </Label>
              <Select
                value={section.core_class_id}
                onValueChange={(value) => onUpdate("core_class_id", value)}
              >
                <SelectTrigger id={`class-${section.id}`}>
                  <SelectValue placeholder="Select class..." />
                </SelectTrigger>
                <SelectContent>
                  {coreClasses.map((coreClass) => (
                    <SelectItem key={coreClass.id} value={coreClass.id.toString()}>
                      {coreClass.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Section Name */}
            <div className="space-y-2">
              <Label htmlFor={`section-${section.id}`}>
                Section Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id={`section-${section.id}`}
                placeholder="e.g., A, B, C, Morning, Afternoon"
                value={section.section_name}
                onChange={(e) => onUpdate("section_name", e.target.value)}
              />
            </div>

            {/* Student Capacity */}
            <div className="space-y-2">
              <Label htmlFor={`capacity-${section.id}`}>Student Capacity</Label>
              <Input
                id={`capacity-${section.id}`}
                type="number"
                placeholder="e.g., 40"
                value={section.capacity || ""}
                onChange={(e) => {
                  const val = e.target.value === "" ? undefined : parseInt(e.target.value);
                  onUpdate("capacity", val);
                }}
                min={1}
                max={200}
              />
            </div>

            {/* Class Teacher */}
            <div className="space-y-2">
              <Label htmlFor={`teacher-${section.id}`}>Class Teacher</Label>
              <Select
                value={section.class_teacher_id}
                onValueChange={(value) => onUpdate("class_teacher_id", value)}
              >
                <SelectTrigger id={`teacher-${section.id}`}>
                  <SelectValue placeholder="Select teacher..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.public_id} value={teacher.public_id}>
                      {teacher.full_name} ({teacher.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description - Full Width */}
          <div className="space-y-2">
            <Label htmlFor={`description-${section.id}`}>Description</Label>
            <Textarea
              id={`description-${section.id}`}
              placeholder="Optional notes about this section..."
              value={section.description || ""}
              onChange={(e) => onUpdate("description", e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}
