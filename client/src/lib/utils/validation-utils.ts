export const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
export const tenDigitPhoneRegex = /^[6-9]\d{9}$/;
export const internationalPhoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
export const employeeIdRegex = /^[A-Z0-9_-]+$/i;
export const nameRegex = /^[a-zA-Z\s'-]+$/;
export const alphanumericRegex = /^[a-zA-Z0-9\s]+$/;

export const ValidationMessages = {
    phone: {
        required: "Phone number is required",
        invalid: "Please enter a valid 10-digit phone number",
        exactDigits: "Phone number must be exactly 10 digits",
        startWith: "Phone number must start with 6, 7, 8, or 9",
    },
    emergencyContact: {
        numberRequired: "Emergency contact number is required when contact name is provided",
        nameRequired: "Emergency contact name is required when contact number is provided",
        invalid: "Please enter a valid 10-digit emergency contact number",
    },
    email: {
        required: "Email is required",
        invalid: "Please enter a valid email address",
    },
    name: {
        required: "This field is required",
        invalid: "Can only contain letters, spaces, hyphens, and apostrophes",
        minLength: (field: string, min: number) => `${field} must be at least ${min} characters`,
        maxLength: (field: string, max: number) => `${field} must not exceed ${max} characters`,
    },
} as const;

export function isValidTenDigitPhone(phone: string | undefined | null): boolean {
    if (!phone) {
        return true;
    }
    const cleanPhone = phone.replace(/\s+/g, "").replace(/[^0-9]/g, "");
    return tenDigitPhoneRegex.test(cleanPhone);
}

export function formatPhoneNumber(phone: string | undefined | null): string {
    if (!phone) {
        return "";
    }
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length === 10) {
        return cleanPhone.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
    }
    return phone;
}

export function cleanPhoneNumber(phone: string | undefined | null): string {
    if (!phone) {
        return "";
    }
    return phone.replace(/\D/g, "");
}
