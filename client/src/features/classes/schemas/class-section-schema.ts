import * as z from "zod";

export const classSectionRowSchema = z.object({
  id: z.string(),
  core_class_id: z.string().min(1, "Please select a class"),
  section_name: z.string().min(1, "Section name is required"),
  description: z.string().optional(),
  capacity: z
    .number()
    .positive("Capacity must be greater than 0")
    .max(200, "Capacity cannot exceed 200")
    .optional()
    .nullable(),
  class_teacher_id: z.string().optional(),
  isExpanded: z.boolean().default(true),
});

export const classSectionsSchema = z.object({
  sections: z.array(classSectionRowSchema).min(1, "At least one section is required"),
});

export type ClassSectionRow = z.infer<typeof classSectionRowSchema>;
export type ClassSectionsFormValues = z.infer<typeof classSectionsSchema>;

export function getDefaultSectionRow(): ClassSectionRow {
  return {
    id: crypto.randomUUID(),
    core_class_id: "",
    section_name: "",
    description: "",
    capacity: undefined,
    class_teacher_id: "",
    isExpanded: true,
  };
}

export const classSingleFormSchema = z.object({
  class_master: z.number().optional(),
  name: z
    .string()
    .min(1, "Section name is required")
    .max(50, "Section name must not exceed 50 characters")
    .regex(/^[A-Za-z0-9\s-]+$/, "Section name can only contain letters, numbers, spaces, and hyphens"),
  class_teacher: z.string().optional().nullable(),
  info: z.string().optional().nullable(),
  capacity: z
    .number()
    .positive("Capacity must be greater than 0")
    .max(200, "Capacity cannot exceed 200")
    .optional()
    .nullable(),
});

export type ClassSingleFormValues = z.infer<typeof classSingleFormSchema>;

