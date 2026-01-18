/**
 * Application-wide Choice Constants
 * Centralized constants for dropdown choices, enums, and validation values
 * These values must match the backend API expectations
 */

/**
 * Gender Choices
 * Backend expects: "M", "F", "O"
 */
export const GENDER_CHOICES = {
  MALE: "M",
  FEMALE: "F",
  OTHER: "O",
} as const;

export const GENDER_VALUES = Object.values(GENDER_CHOICES);

export const GENDER_OPTIONS = [
  { value: GENDER_CHOICES.MALE, label: "Male" },
  { value: GENDER_CHOICES.FEMALE, label: "Female" },
  { value: GENDER_CHOICES.OTHER, label: "Other" },
] as const;

/**
 * Blood Group Choices
 * Backend expects: "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
 */
export const BLOOD_GROUP_CHOICES = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export const BLOOD_GROUP_OPTIONS = BLOOD_GROUP_CHOICES.map((group) => ({
  value: group,
  label: group,
}));

/**
 * Type exports for type safety
 */
export type GenderValue = (typeof GENDER_VALUES)[number];
export type BloodGroupValue = (typeof BLOOD_GROUP_CHOICES)[number];
