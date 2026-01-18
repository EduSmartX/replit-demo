/**
 * Classes Feature - Main Export
 */

export * from './components';

// Schemas (all in one file now)
export {
    classSectionRowSchema,
    classSectionsSchema,
    classSingleFormSchema, getDefaultSectionRow, type ClassSectionRow,
    type ClassSectionsFormValues,
    type ClassSingleFormValues
} from "./schemas/class-section-schema";

// Helpers
export {
    addClassRow, getDefaultSingleFormValues,
    getSingleFormValuesFromClass, removeClassRow,
    toggleClassExpand,
    updateClassField,
    validateClasses
} from "./helpers/class-form-helpers";

// Hooks
export {
    useCoreClasses, useCreateClass, useCreateMultipleClasses, useTeachers, useUpdateClass
} from "./hooks/use-class-form";

// Constants
export {
    ClassErrorMessages, ClassMessages, ClassSuccessMessages, ClassValidationMessages
} from "@/lib/constants/class-messages";

