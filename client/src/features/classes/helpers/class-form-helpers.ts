/**
 * Class Form Helper Functions
 */

import type { MasterClass } from "@/lib/api/class-api";
import { getDefaultSectionRow } from "../schemas/class-section-schema";
import type {
  ClassSectionRow,
  ClassSingleFormValues,
} from "../schemas/class-section-schema";

export function getDefaultSingleFormValues(): ClassSingleFormValues {
  return {
    class_master: 0,
    name: "",
    class_teacher: null,
    info: null,
    capacity: null,
  };
}

export function getSingleFormValuesFromClass(classData: MasterClass): ClassSingleFormValues {
  return {
    class_master: classData.class_master.id,
    name: classData.name,
    class_teacher: classData.class_teacher?.public_id || null,
    info: classData.info || null,
    capacity: classData.capacity || null,
  };
}

export function addClassRow(classes: ClassSectionRow[]): ClassSectionRow[] {
  return [...classes, getDefaultSectionRow()];
}

export function removeClassRow(
  classes: ClassSectionRow[],
  id: string
): ClassSectionRow[] {
  if (classes.length <= 1) {
    return classes; // Keep at least one row
  }
  return classes.filter((classRow) => classRow.id !== id);
}

export function toggleClassExpand(
  classes: ClassSectionRow[],
  id: string
): ClassSectionRow[] {
  return classes.map((classRow) =>
    classRow.id === id
      ? { ...classRow, isExpanded: !classRow.isExpanded }
      : classRow
  );
}

export function updateClassField(
  classes: ClassSectionRow[],
  id: string,
  field: keyof ClassSectionRow,
  value: unknown
): ClassSectionRow[] {
  return classes.map((classRow) =>
    classRow.id === id
      ? { ...classRow, [field]: value }
      : classRow
  );
}

export function validateClasses(classes: ClassSectionRow[]): {
  isValid: boolean;
  error?: string;
} {
  for (const classRow of classes) {
    if (!classRow.core_class_id) {
      return {
        isValid: false,
        error: "Please select a class for all rows",
      };
    }
    if (!classRow.section_name.trim()) {
      return {
        isValid: false,
        error: "Please enter a section name for all rows",
      };
    }
    if (
      classRow.capacity !== undefined &&
      classRow.capacity !== null &&
      (classRow.capacity < 1 || classRow.capacity > 200)
    ) {
      return {
        isValid: false,
        error: "Capacity must be between 1 and 200",
      };
    }
  }
  return { isValid: true };
}
