import { z } from "zod";
import { GENDER_VALUES, BLOOD_GROUP_CHOICES } from "@/lib/constants/choices";

const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
const employeeIdRegex = /^[A-Z0-9_-]+$/i;

export const teacherFormSchema = z
  .object({
    employee_id: z
      .string()
      .min(1, "Employee ID is required")
      .max(20, "Employee ID must not exceed 20 characters")
      .regex(employeeIdRegex, "Employee ID can only contain letters, numbers, hyphens, and underscores")
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
        (val) => !val || phoneRegex.test(val),
        "Please enter a valid phone number"
      )
      .transform((val) => val?.trim()),
    
    highest_qualification: z
      .string()
      .max(200, "Qualification must not exceed 200 characters")
      .optional()
      .transform((val) => val?.trim()),
    
    joining_date: z
      .string()
      .optional()
      .refine(
        (val) => !val || !isNaN(Date.parse(val)),
        "Please enter a valid date"
      ),
    
    specialization: z
      .string()
      .max(100, "Specialization must not exceed 100 characters")
      .optional()
      .transform((val) => val?.trim()),
    
    designation: z
      .string()
      .max(100, "Designation must not exceed 100 characters")
      .optional()
      .transform((val) => val?.trim()),
    
    experience_years: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) {
            return true;
          }
          const num = parseInt(val, 10);
          return !isNaN(num) && num >= 0 && num <= 70;
        },
        "Experience must be between 0 and 70 years"
      ),
    
    subjects: z
      .array(z.number())
      .optional()
      .default([])
      .refine(
        (arr) => arr.length <= 20,
        "A teacher can be assigned to a maximum of 20 subjects"
      ),
    
    emergency_contact_name: z
      .string()
      .max(200, "Emergency contact name must not exceed 200 characters")
      .optional()
      .transform((val) => val?.trim()),
    
    emergency_contact_number: z
      .string()
      .optional()
      .refine(
        (val) => !val || phoneRegex.test(val),
        "Please enter a valid emergency contact number"
      )
      .transform((val) => val?.trim()),
    
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
  .refine(
    (data) => {
      if (data.emergency_contact_name && !data.emergency_contact_number) {
        return false;
      }
      return true;
    },
    {
      message: "Emergency contact number is required when emergency contact name is provided",
      path: ["emergency_contact_number"],
    }
  )
  .refine(
    (data) => {
      if (data.emergency_contact_number && !data.emergency_contact_name) {
        return false;
      }
      return true;
    },
    {
      message: "Emergency contact name is required when emergency contact number is provided",
      path: ["emergency_contact_name"],
    }
  )
  .refine(
    (data) => {
      if (data.supervisor_email && data.email && data.supervisor_email === data.email) {
        return false;
      }
      return true;
    },
    {
      message: "Supervisor email cannot be the same as teacher email",
      path: ["supervisor_email"],
    }
  );

export type TeacherFormValues = z.infer<typeof teacherFormSchema>;
