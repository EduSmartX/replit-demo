import { z } from "zod";
import { GENDER_VALUES } from "@/lib/constants/choices";
import { 
  tenDigitPhoneRegex, 
  ValidationMessages,
  cleanPhoneNumber 
} from "@/lib/utils/validation-utils";

export const minimalTeacherSchema = z.object({
  employee_id: z
    .string()
    .min(1, "Employee ID is required")
    .max(50, "Employee ID must not exceed 50 characters")
    .regex(/^[A-Z0-9_-]+$/i, "Employee ID can only contain letters, numbers, hyphens, and underscores")
    .transform((val) => val.trim().toUpperCase()),
  
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(255, "Email must not exceed 255 characters")
    .transform((val) => val.trim().toLowerCase()),
  
  first_name: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(100, "First name must not exceed 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "First name can only contain letters, spaces, hyphens, and apostrophes")
    .transform((val) => val.trim()),
  
  last_name: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name must not exceed 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Last name can only contain letters, spaces, hyphens, and apostrophes")
    .transform((val) => val.trim()),
  
  gender: z
    .string()
    .min(1, "Gender is required")
    .refine(
      (val) => GENDER_VALUES.includes(val as "M" | "F" | "O"),
      "Please select a valid gender"
    ),
  
  organization_role: z
    .string()
    .optional()
});

export const teacherFormSchema = z.object({
  employee_id: z
    .string()
    .min(1, "Employee ID is required")
    .max(50, "Employee ID must not exceed 50 characters")
    .regex(/^[A-Z0-9_-]+$/i, "Employee ID can only contain letters, numbers, hyphens, and underscores")
    .transform((val) => val.trim().toUpperCase()),
  
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(255, "Email must not exceed 255 characters")
    .transform((val) => val.trim().toLowerCase()),
  
  first_name: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(100, "First name must not exceed 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "First name can only contain letters, spaces, hyphens, and apostrophes")
    .transform((val) => val.trim()),
  
  last_name: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name must not exceed 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Last name can only contain letters, spaces, hyphens, and apostrophes")
    .transform((val) => val.trim()),
  
  phone: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) {
          return true;
        }
        const cleaned = cleanPhoneNumber(val);
        return tenDigitPhoneRegex.test(cleaned);
      },
      ValidationMessages.phone.invalid
    )
    .transform((val) => val ? cleanPhoneNumber(val) : undefined),
  
  gender: z
    .string()
    .min(1, "Gender is required")
    .refine(
      (val) => GENDER_VALUES.includes(val as "M" | "F" | "O"),
      "Please select a valid gender"
    ),
  
  blood_group: z
    .string()
    .optional(),
  
  date_of_birth: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      "Please enter a valid date of birth"
    ),
  
  organization_role: z
    .string()
    .optional(),
  
  supervisor_email: z
    .string()
    .optional(),
  
  highest_qualification: z
    .string()
    .max(100, "Qualification must not exceed 100 characters")
    .optional(),
  
  specialization: z
    .string()
    .max(200, "Specialization must not exceed 200 characters")
    .optional(),
  
  designation: z
    .string()
    .max(100, "Designation must not exceed 100 characters")
    .optional(),
  
  joining_date: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      "Please enter a valid joining date"
    ),
  
  experience_years: z
    .union([z.string(), z.number()])
    .optional()
    .transform((val) => {
      if (!val) {
        return undefined;
      }
      const num = typeof val === "string" ? parseInt(val) : val;
      return isNaN(num) ? undefined : num;
    }),
  
  emergency_contact_name: z
    .string()
    .max(100, "Emergency contact name must not exceed 100 characters")
    .optional(),
  
  emergency_contact_number: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) {
          return true;
        }
        const cleaned = cleanPhoneNumber(val);
        return tenDigitPhoneRegex.test(cleaned);
      },
      ValidationMessages.phone.invalid
    )
    .transform((val) => val ? cleanPhoneNumber(val) : undefined),
  
  // Address fields
  street_address: z
    .string()
    .max(255, "Street address must not exceed 255 characters")
    .optional(),
  
  address_line_2: z
    .string()
    .max(255, "Address line 2 must not exceed 255 characters")
    .optional(),
  
  city: z
    .string()
    .max(100, "City must not exceed 100 characters")
    .optional(),
  
  state: z
    .string()
    .max(100, "State must not exceed 100 characters")
    .optional(),
  
  postal_code: z
    .string()
    .max(20, "Postal code must not exceed 20 characters")
    .optional(),
  
  country: z
    .string()
    .max(100, "Country must not exceed 100 characters")
    .optional()
});

export const multiTeacherFormSchema = z.object({
  teachers: z.array(minimalTeacherSchema).min(1, "At least one teacher is required")
});

export type TeacherFormValues = z.infer<typeof teacherFormSchema>;
export type MinimalTeacherFormValues = z.infer<typeof minimalTeacherSchema>;
export type MultiTeacherFormValues = z.infer<typeof multiTeacherFormSchema>;
