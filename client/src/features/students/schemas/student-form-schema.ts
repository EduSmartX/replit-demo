import { z } from "zod";
import { GENDER_VALUES, BLOOD_GROUP_CHOICES } from "@/lib/constants/choices";

// Regex patterns for input validation
const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
const admissionNumberRegex = /^[A-Z0-9_-]+$/i;
const rollNumberRegex = /^[A-Z0-9]+$/i;

// Comprehensive student form validation schema with:
// - Field-level validation (format, length, regex)
// - Cross-field validation (emergency contact consistency, email uniqueness, guardian contact requirement)
// - Auto-transformation (trim, uppercase, lowercase)
export const studentFormSchema = z
  .object({
    roll_number: z
      .string()
      .min(1, "Roll number is required")
      .max(20, "Roll number must not exceed 20 characters")
      .regex(rollNumberRegex, "Roll number can only contain letters and numbers")
      .transform((val) => val.trim().toUpperCase()),
    
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

    admission_number: z
      .string()
      .max(50, "Admission number must not exceed 50 characters")
      .regex(admissionNumberRegex, "Admission number can only contain letters, numbers, hyphens, and underscores")
      .optional()
      .transform((val) => val?.trim().toUpperCase()),
    
    email: z
      .string()
      .email("Please enter a valid email address")
      .max(255, "Email must not exceed 255 characters")
      .optional()
      .or(z.literal(""))
      .transform((val) => val?.trim().toLowerCase() || ""),
    
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || phoneRegex.test(val),
        "Please enter a valid phone number"
      )
      .transform((val) => val?.trim()),
    
    admission_date: z
      .string()
      .optional()
      .refine(
        (val) => !val || !isNaN(Date.parse(val)),
        "Please enter a valid admission date"
      ),
    
    date_of_birth: z
      .string()
      .optional()
      .refine(
        (val) => !val || !isNaN(Date.parse(val)),
        "Please enter a valid date of birth"
      )
      .refine(
        (val) => {
          if (!val) return true;
          const dob = new Date(val);
          const today = new Date();
          const age = today.getFullYear() - dob.getFullYear();
          return age >= 3 && age <= 25;
        },
        "Student age must be between 3 and 25 years"
      ),
    
    blood_group: z
      .string()
      .optional()
      .refine(
        (val) => !val || (BLOOD_GROUP_CHOICES as readonly string[]).includes(val),
        "Please select a valid blood group"
      ),
    
    gender: z
      .string()
      .optional()
      .refine(
        (val) => !val || (GENDER_VALUES as readonly string[]).includes(val),
        "Please select a valid gender"
      ),
    
    class_id: z
      .string()
      .optional(),
    
    guardian_name: z
      .string()
      .max(255, "Guardian name must not exceed 255 characters")
      .optional()
      .transform((val) => val?.trim()),
    
    guardian_phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || phoneRegex.test(val),
        "Please enter a valid guardian phone number"
      )
      .transform((val) => val?.trim()),
    
    guardian_email: z
      .string()
      .email("Please enter a valid guardian email address")
      .max(255, "Guardian email must not exceed 255 characters")
      .optional()
      .or(z.literal(""))
      .transform((val) => val?.trim().toLowerCase() || ""),
    
    guardian_relationship: z
      .string()
      .max(100, "Relationship must not exceed 100 characters")
      .optional()
      .transform((val) => val?.trim()),
    
    emergency_contact_name: z
      .string()
      .max(255, "Emergency contact name must not exceed 255 characters")
      .optional()
      .transform((val) => val?.trim()),
    
    emergency_contact_phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || phoneRegex.test(val),
        "Please enter a valid emergency contact number"
      )
      .transform((val) => val?.trim()),
    
    medical_conditions: z
      .string()
      .max(500, "Medical conditions must not exceed 500 characters")
      .optional()
      .transform((val) => val?.trim()),
    
    description: z
      .string()
      .max(500, "Description must not exceed 500 characters")
      .optional()
      .transform((val) => val?.trim()),
    
    organization_role: z
      .string()
      .optional(),
    
    supervisor_email: z
      .string()
      .optional()
      .refine(
        (val) => !val || val === "" || z.string().email().safeParse(val).success,
        "Please enter a valid supervisor email address"
      )
      .transform((val) => val?.trim().toLowerCase() || ""),
  })
  // Cross-field validation: Emergency contact consistency
  .refine(
    (data) => {
      if (data.emergency_contact_name && !data.emergency_contact_phone) {
        return false;
      }
      return true;
    },
    {
      message: "Emergency contact phone is required when emergency contact name is provided",
      path: ["emergency_contact_phone"],
    }
  )
  // Cross-field validation: Prevent self-supervision
  .refine(
    (data) => {
      if (data.email && data.supervisor_email && data.email === data.supervisor_email) {
        return false;
      }
      return true;
    },
    {
      message: "Supervisor email cannot be the same as student email",
      path: ["supervisor_email"],
    }
  )
  // Cross-field validation: Guardian contact requirement (if name provided, need phone or email)
  .refine(
    (data) => {
      // Guardian contact: if guardian name is provided, at least phone or email should be provided
      if (data.guardian_name && !data.guardian_phone && !data.guardian_email) {
        return false;
      }
      return true;
    },
    {
      message: "Guardian phone or email is required when guardian name is provided",
      path: ["guardian_phone"],
    }
  );

export type StudentFormValues = z.infer<typeof studentFormSchema>;

/**
 * Validation helper functions
 */
export function validatePhoneNumber(phone: string): boolean {
  return phoneRegex.test(phone);
}

export function validateAge(dateOfBirth: string): { valid: boolean; age?: number } {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    return { valid: age - 1 >= 3 && age - 1 <= 25, age: age - 1 };
  }
  
  return { valid: age >= 3 && age <= 25, age };
}

export function formatStudentFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}
