/**
 * Signup Wizard Component
 * Multi-step registration flow for new organizations and admin users.
 * 
 * Steps:
 * 1. Email verification (admin + organization emails with OTP)
 * 2. Organization details (name, phone, address)
 * 3. Admin details (name, password)
 * 4. Confirmation and submission
 * 
 * Includes form validation, OTP verification, Google Places address autocomplete,
 * and animated step transitions.
 */

/**
 * Organization Signup Wizard Component
 * Multi-step registration wizard for creating new organizations with admin account.
 * Steps: Email verification → OTP validation → Organization details → Address → Admin credentials
 * Includes form validation, progress tracking, and animated transitions between steps.
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  CheckCircle2,
  ArrowRight,
  Mail,
  Building2,
  User,
  Lock,
  MapPin,
  Phone,
  Globe,
} from "lucide-react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useLocation } from "wouter";
import * as z from "zod";
import { OtpInput } from "./otp-input";
import { AuthFormCard } from "./auth-form-card";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api, API_ENDPOINTS } from "@/lib/api";
import { ErrorMessages, SuccessMessages, ValidationErrorMessages } from "@/lib/constants";
import { parseApiError } from "@/lib/error-parser";
import { AddressComponents } from "@/lib/google-places";
import { verifyOtp, sendOtps } from "@/lib/otp-service";

// Schema for Step 1
const step1Schema = z.object({
  adminEmail: z.string().email({ message: ValidationErrorMessages.INVALID_EMAIL }),
  orgEmail: z.string().email({ message: ValidationErrorMessages.INVALID_EMAIL }),
});

// Schema for Step 2
const step2Schema = z.object({
  adminOtp: z.string().min(6, { message: "OTP must be 6 digits" }),
  orgOtp: z.string().min(6, { message: "OTP must be 6 digits" }),
});

// Schema for Step 3 - Organization Registration
const step3Schema = z
  .object({
    // Organization Info
    orgName: z.string().min(2, ValidationErrorMessages.ORG_NAME_REQUIRED),
    orgType: z.string().min(1, "Organization type is required"),
    orgPhoneNumber: z.string().min(10, ValidationErrorMessages.INVALID_PHONE),
    orgWebsite: z.string().optional(),
    boardAffiliation: z.string().optional(),
    legalEntity: z.string().optional(),
    agentReferral: z.string().optional(),

    // Address Info
    streetAddress: z.string().min(3, "Street address is required"),
    addressLine2: z.string().optional(),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    zipCode: z.string().min(3, "Zip code is required"),
    country: z.string().default("INDIA"),
    latitude: z.string().optional(),
    longitude: z.string().optional(),

    // Admin Info
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    password: z.string().min(8, ValidationErrorMessages.PASSWORD_TOO_SHORT),
    confirmPassword: z.string(),
    notificationOptIn: z.boolean().default(true),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: ValidationErrorMessages.PASSWORDS_DO_NOT_MATCH,
    path: ["confirmPassword"],
  });

export function SignupWizard({ 
  onComplete: _onComplete,
  onStepChange 
}: { 
  onComplete: () => void;
  onStepChange?: (step: number) => void;
}) {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [adminOtpVerified, setAdminOtpVerified] = useState(false);
  const [orgOtpVerified, setOrgOtpVerified] = useState(false);
  const [verifyingAdmin, setVerifyingAdmin] = useState(false);
  const [verifyingOrg, setVerifyingOrg] = useState(false);
  const { toast } = useToast();

  // Notify parent of step changes
  const updateStep = (newStep: number) => {
    setStep(newStep);
    onStepChange?.(newStep);
  };

  // Forms
  const form1 = useForm<z.infer<typeof step1Schema>>({
    resolver: zodResolver(step1Schema),
    defaultValues: { adminEmail: "", orgEmail: "" },
  });

  const form2 = useForm<z.infer<typeof step2Schema>>({
    resolver: zodResolver(step2Schema),
    defaultValues: { adminOtp: "", orgOtp: "" },
  });

  const form3 = useForm<z.infer<typeof step3Schema>>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      orgName: "",
      orgType: "",
      orgPhoneNumber: "",
      orgWebsite: "",
      boardAffiliation: "",
      legalEntity: "",
      agentReferral: "",
      streetAddress: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: "",
      country: "INDIA",
      latitude: "",
      longitude: "",
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
      notificationOptIn: true,
    },
  });

  // Address autocomplete handler
  const handleAddressSelect = (address: AddressComponents) => {
    form3.setValue("streetAddress", address.streetAddress);
    form3.setValue("city", address.city);
    form3.setValue("state", address.state);
    form3.setValue("zipCode", address.zipCode);
    form3.setValue("country", address.country === "IN" ? "INDIA" : address.country);
    form3.setValue("latitude", address.latitude);
    form3.setValue("longitude", address.longitude);

    // Clear any previous errors
    form3.clearErrors(["streetAddress", "city", "state", "zipCode"]);

    toast({
      title: "Address Selected",
      description: "Address fields have been auto-filled.",
    });
  };

  // Handlers
  const onStep1Submit = async (data: z.infer<typeof step1Schema>) => {
    setIsLoading(true);

    try {
      const response = await sendOtps([
        {
          email: data.orgEmail,
          category: "organization",
          purpose: "organization_registration",
        },
        {
          email: data.adminEmail,
          category: "admin",
          purpose: "organization_registration",
        },
      ]);

      if (response.all_success) {
        toast({
          title: "OTP Sent",
          description: `Verification codes sent to ${data.adminEmail} and ${data.orgEmail}`,
        });
        updateStep(2);
      } else {
        toast({
          title: "Partial Success",
          description: "Some emails failed. Please check and try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      // Parse error response
      let errorTitle = "Error Sending OTP";
      let errorDescription = "Failed to send verification codes. Please try again.";

      try {
        const errorText = (error as { message?: string })?.message || "";
        const jsonMatch = errorText.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          const errorData = JSON.parse(jsonMatch[0]);

          // Handle validation errors with specific email errors
          if (errorData.errors && Array.isArray(errorData.errors)) {
            // Build a detailed error message
            const errorMessages = errorData.errors
              .map((err: { email: string; error: string }) => `${err.email}: ${err.error}`)
              .join("\n");

            errorTitle = errorData.detail || "Validation Failed";
            errorDescription = errorMessages;
          }
          // Handle already registered emails
          else if (errorData.detail && errorData.detail.includes("already registered")) {
            errorTitle = "Email Already Registered";
            errorDescription =
              "One or more emails are already registered. Please use different emails or login.";
          }
          // Handle general errors with detail field
          else if (errorData.detail) {
            errorTitle = "OTP Send Failed";
            errorDescription = errorData.detail;
          }
          // Handle errors with message field
          else if (errorData.message) {
            errorDescription = errorData.message;
          }
        }
      } catch (parseError) {
        // If parsing fails, use the original error message
        errorDescription = (error as { message?: string })?.message || errorDescription;
      }

      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generic OTP verification handler
  const handleVerifyOtp = async (
    email: string,
    otpCode: string,
    setVerified: (value: boolean) => void,
    setVerifying: (value: boolean) => void,
    successMessage: string
  ) => {
    if (!otpCode || otpCode.length < 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit OTP code.",
        variant: "destructive",
      });
      return;
    }

    setVerifying(true);
    try {
      const response = (await verifyOtp(email, otpCode, "organization_registration")) as any;

      if (response.success === true || response.success === "true") {
        setVerified(true);
        toast({
          title: "Verified",
          description: successMessage,
        });
      } else {
        toast({
          title: "Verification Failed",
          description: response.message || "Failed to verify OTP. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: parseApiError(error, "Failed to verify OTP. Please try again."),
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const verifyAdminOtp = () => {
    handleVerifyOtp(
      form1.getValues("adminEmail"),
      form2.getValues("adminOtp"),
      setAdminOtpVerified,
      setVerifyingAdmin,
      "Administrator email verified successfully."
    );
  };

  const verifyOrgOtp = () => {
    handleVerifyOtp(
      form1.getValues("orgEmail"),
      form2.getValues("orgOtp"),
      setOrgOtpVerified,
      setVerifyingOrg,
      "Organization email verified successfully."
    );
  };

  const onStep2Submit = async () => {
    // Just move to next step if both are verified
    if (adminOtpVerified && orgOtpVerified) {
      updateStep(3);
    }
  };

  const onStep3Submit = async (data: z.infer<typeof step3Schema>) => {
    setIsLoading(true);

    try {
      const requestData = {
        organization_info: {
          name: data.orgName,
          type: data.orgType,
          email: form1.getValues("orgEmail"),
          phone_number: data.orgPhoneNumber,
          website_url: data.orgWebsite || undefined,
          board_affiliation: data.boardAffiliation || undefined,
          legal_entity: data.legalEntity || undefined,
          agent_referral: data.agentReferral || undefined,
        },
        admin_info: {
          first_name: data.firstName,
          last_name: data.lastName,
          email: form1.getValues("adminEmail"),
          password: data.password,
          password2: data.confirmPassword,
          notification_opt_in: data.notificationOptIn,
        },
        address_info: {
          street_address: data.streetAddress,
          address_line_2: data.addressLine2 || undefined,
          city: data.city,
          state: data.state,
          zip_code: data.zipCode,
          country: data.country,
          latitude: data.latitude || undefined,
          longitude: data.longitude || undefined,
        },
      };

      const response = await api.post(
        API_ENDPOINTS.organizations.register,
        requestData,
        { skipAuth: true } // Public endpoint - no auth required
      );

      if (
        response.status === "success" ||
        response.message === "Organization registered successfully."
      ) {
        // Extract registration data from response
        const registrationData = {
          username: response.admin_info?.username || "N/A",
          organizationName: response.organization_info?.name || data.orgName,
          email: response.admin_info?.email || form1.getValues("adminEmail"),
        };

        // Store in sessionStorage for the success page
        sessionStorage.setItem("registrationData", JSON.stringify(registrationData));

        toast({
          title: "Registration Successful",
          description: "Redirecting to confirmation page...",
        });

        // Redirect to success page
        setTimeout(() => {
          setLocation("/registration-success");
        }, 500);
      }
    } catch (error: any) {
      // Parse validation errors
      try {
        const errorText = error.message;
        const jsonMatch = errorText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const errorData = JSON.parse(jsonMatch[0]);

          if (errorData.errors) {
            // Set errors for each field
            const errors = errorData.errors;

            // Organization info errors
            if (errors.organization_info) {
              Object.keys(errors.organization_info).forEach((field) => {
                const fieldMap: Record<string, any> = {
                  name: "orgName",
                  type: "orgType",
                  phone_number: "orgPhoneNumber",
                  website_url: "orgWebsite",
                  board_affiliation: "boardAffiliation",
                  legal_entity: "legalEntity",
                  agent_referral: "agentReferral",
                };
                const formField = fieldMap[field];
                if (formField) {
                  form3.setError(formField, {
                    type: "manual",
                    message: errors.organization_info[field][0],
                  });
                }
              });
            }

            // Address info errors
            if (errors.address_info) {
              Object.keys(errors.address_info).forEach((field) => {
                const fieldMap: Record<string, any> = {
                  street_address: "streetAddress",
                  address_line_2: "addressLine2",
                  city: "city",
                  state: "state",
                  zip_code: "zipCode",
                  country: "country",
                  latitude: "latitude",
                  longitude: "longitude",
                };
                const formField = fieldMap[field];
                if (formField) {
                  form3.setError(formField, {
                    type: "manual",
                    message: errors.address_info[field][0],
                  });
                }
              });
            }

            // Admin info errors
            if (errors.admin_info) {
              Object.keys(errors.admin_info).forEach((field) => {
                const fieldMap: Record<string, any> = {
                  first_name: "firstName",
                  last_name: "lastName",
                  password: "password",
                  password2: "confirmPassword",
                };
                const formField = fieldMap[field];
                if (formField) {
                  form3.setError(formField, {
                    type: "manual",
                    message: errors.admin_info[field][0],
                  });
                }
              });
            }

            toast({
              title: "Validation Error",
              description: errorData.message || "Please check the form for errors.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Registration Failed",
              description: errorData.message || "Failed to create account. Please try again.",
              variant: "destructive",
            });
          }
        }
      } catch (parseError) {
        toast({
          title: "Registration Failed",
          description: parseApiError(error, "Failed to create account. Please try again."),
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-8 flex items-center justify-center space-x-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                step >= i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {step > i ? <CheckCircle2 className="h-5 w-5" /> : i}
            </div>
            {i < 3 && (
              <div
                className={`mx-2 h-0.5 w-12 transition-colors ${
                  step > i ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <AuthFormCard
              footer={
                <Button
                  className="w-full h-12 text-base"
                  onClick={form1.handleSubmit(onStep1Submit)}
                  disabled={isLoading}
                  data-testid="button-send-otp"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    "Verify & Send OTP"
                  )}
                </Button>
              }
            >
              <div className="space-y-2">
                <Label htmlFor="orgEmail" className="text-base">Organization Email</Label>
                <div className="relative">
                  <Building2 className="text-muted-foreground absolute top-3.5 left-3 h-5 w-5" />
                  <Input
                    id="orgEmail"
                    placeholder="school@edu.org"
                    className="pl-10 h-12 text-base"
                    {...form1.register("orgEmail")}
                    data-testid="input-org-email"
                  />
                </div>
                {form1.formState.errors.orgEmail && (
                  <p className="text-destructive text-sm">
                    {form1.formState.errors.orgEmail.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail" className="text-base">Administrator Email</Label>
                <div className="relative">
                  <Mail className="text-muted-foreground absolute top-3.5 left-3 h-5 w-5" />
                  <Input
                    id="adminEmail"
                    placeholder="admin@edu.org"
                    className="pl-10 h-12 text-base"
                    {...form1.register("adminEmail")}
                    data-testid="input-admin-email"
                  />
                </div>
                {form1.formState.errors.adminEmail && (
                  <p className="text-destructive text-sm">
                    {form1.formState.errors.adminEmail.message}
                  </p>
                )}
              </div>
            </AuthFormCard>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <AuthFormCard
              footer={
                <div className="flex justify-between w-full gap-4">
                  <Button variant="ghost" onClick={() => updateStep(1)} disabled={isLoading} className="h-12 text-base">
                    Back
                  </Button>
                  <Button
                    onClick={onStep2Submit}
                    disabled={!adminOtpVerified || !orgOtpVerified}
                    data-testid="button-continue-step2"
                    className="h-12 text-base"
                  >
                    Continue <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              }
            >
              <OtpInput
                id="adminOtp"
                label="Administrator Email OTP"
                email={form1.getValues("adminEmail")}
                register={form2.register}
                fieldName="adminOtp"
                error={form2.formState.errors.adminOtp}
                isVerified={adminOtpVerified}
                isVerifying={verifyingAdmin}
                onVerify={verifyAdminOtp}
                testId="input-admin-otp"
              />
              <OtpInput
                id="orgOtp"
                label="Organization Email OTP"
                email={form1.getValues("orgEmail")}
                register={form2.register}
                fieldName="orgOtp"
                error={form2.formState.errors.orgOtp}
                isVerified={orgOtpVerified}
                isVerifying={verifyingOrg}
                onVerify={verifyOrgOtp}
                testId="input-org-otp"
              />
            </AuthFormCard>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <AuthFormCard
              footer={
                <div className="flex justify-between w-full gap-4">
                  <Button variant="ghost" onClick={() => updateStep(2)} className="h-12 text-base">
                    Back
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary/90 h-12 text-base"
                    onClick={form3.handleSubmit(onStep3Submit)}
                    disabled={isLoading}
                    data-testid="button-complete-signup"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      "Complete Registration"
                    )}
                  </Button>
                </div>
              }
            >
              {/* Organization Information */}
              <div className="space-y-4">
                  <h3 className="text-primary flex items-center gap-2 text-base font-semibold">
                    <Building2 className="h-5 w-5" />
                    Organization Information
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="orgName" className="text-base">
                      Organization Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="orgName"
                      placeholder="Green Valley School"
                      {...form3.register("orgName")}
                      data-testid="input-org-name"
                      className="h-12 text-base"
                    />
                    {form3.formState.errors.orgName && (
                      <p className="text-destructive text-sm">
                        {form3.formState.errors.orgName.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="orgType" className="text-base">
                        Type <span className="text-destructive">*</span>
                      </Label>
                      <Select onValueChange={(val) => form3.setValue("orgType", val)}>
                        <SelectTrigger data-testid="select-org-type" className="h-12 text-base">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="charter">Charter</SelectItem>
                          <SelectItem value="international">International</SelectItem>
                        </SelectContent>
                      </Select>
                      {form3.formState.errors.orgType && (
                        <p className="text-destructive text-sm">
                          {form3.formState.errors.orgType.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orgPhoneNumber" className="text-base">
                        Phone Number <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Phone className="text-muted-foreground absolute top-3.5 left-3 h-5 w-5" />
                        <Input
                          id="orgPhoneNumber"
                          placeholder="+919876543210"
                          className="pl-10 h-12 text-base"
                          {...form3.register("orgPhoneNumber")}
                          data-testid="input-org-phone"
                        />
                      </div>
                      {form3.formState.errors.orgPhoneNumber && (
                        <p className="text-destructive text-sm">
                          {form3.formState.errors.orgPhoneNumber.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="orgWebsite" className="text-base">Website URL</Label>
                      <div className="relative">
                        <Globe className="text-muted-foreground absolute top-3.5 left-3 h-5 w-5" />
                        <Input
                          id="orgWebsite"
                          placeholder="https://school.edu"
                          className="pl-10 h-12 text-base"
                          {...form3.register("orgWebsite")}
                          data-testid="input-org-website"
                        />
                      </div>
                      {form3.formState.errors.orgWebsite && (
                        <p className="text-destructive text-sm">
                          {form3.formState.errors.orgWebsite.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="boardAffiliation" className="text-base">Board Affiliation</Label>
                      <Select onValueChange={(val) => form3.setValue("boardAffiliation", val)}>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="Select board" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cbse">CBSE</SelectItem>
                          <SelectItem value="icse">ICSE</SelectItem>
                          <SelectItem value="state">State Board</SelectItem>
                          <SelectItem value="ib">IB</SelectItem>
                          <SelectItem value="cambridge">Cambridge</SelectItem>
                        </SelectContent>
                      </Select>
                      {form3.formState.errors.boardAffiliation && (
                        <p className="text-destructive text-sm">
                          {form3.formState.errors.boardAffiliation.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="legalEntity" className="text-base">Legal Entity</Label>
                      <Input
                        id="legalEntity"
                        placeholder="ABC Education Trust"
                        {...form3.register("legalEntity")}
                        className="h-12 text-base"
                      />
                      {form3.formState.errors.legalEntity && (
                        <p className="text-destructive text-sm">
                          {form3.formState.errors.legalEntity.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="agentReferral" className="text-base">Agent Referral</Label>
                      <Input
                        id="agentReferral"
                        placeholder="Referral code"
                        {...form3.register("agentReferral")}
                        className="h-12 text-base"
                      />
                      {form3.formState.errors.agentReferral && (
                        <p className="text-destructive text-sm">
                          {form3.formState.errors.agentReferral.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-primary flex items-center gap-2 text-base font-semibold">
                    <MapPin className="h-5 w-5" />
                    Organization Address
                  </h3>

                  <Controller
                    name="streetAddress"
                    control={form3.control}
                    render={({ field }) => (
                      <AddressAutocomplete
                        onAddressSelect={handleAddressSelect}
                        value={field.value}
                        onChange={field.onChange}
                        label="Street Address"
                        required
                        error={form3.formState.errors.streetAddress?.message}
                        id="streetAddress"
                        testId="input-street-address"
                        name={field.name}
                      />
                    )}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="addressLine2" className="text-base">Address Line 2</Label>
                    <Input
                      id="addressLine2"
                      placeholder="Suite, Building, Floor (optional)"
                      {...form3.register("addressLine2")}
                      className="h-12 text-base"
                    />
                    {form3.formState.errors.addressLine2 && (
                      <p className="text-destructive text-sm">
                        {form3.formState.errors.addressLine2.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-base">
                        City <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="city"
                        placeholder="Mumbai"
                        {...form3.register("city")}
                        data-testid="input-city"
                        className="h-12 text-base"
                      />
                      {form3.formState.errors.city && (
                        <p className="text-destructive text-sm">
                          {form3.formState.errors.city.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state" className="text-base">
                        State <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="state"
                        placeholder="Maharashtra"
                        {...form3.register("state")}
                        data-testid="input-state"
                        className="h-12 text-base"
                      />
                      {form3.formState.errors.state && (
                        <p className="text-destructive text-sm">
                          {form3.formState.errors.state.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="zipCode" className="text-base">
                        Zip Code <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="zipCode"
                        placeholder="400001"
                        {...form3.register("zipCode")}
                        data-testid="input-zip-code"
                        className="h-12 text-base"
                      />
                      {form3.formState.errors.zipCode && (
                        <p className="text-destructive text-sm">
                          {form3.formState.errors.zipCode.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-base">Country</Label>
                      <Input
                        id="country"
                        value={form3.watch("country") || "INDIA"}
                        disabled
                        {...form3.register("country")}
                        className="h-12 text-base"
                      />
                    </div>
                  </div>
                </div>

                {/* Admin Information */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-primary flex items-center gap-2 text-base font-semibold">
                    <User className="h-5 w-5" />
                    Administrator Information
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-base">
                        First Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        placeholder="Rajesh"
                        {...form3.register("firstName")}
                        data-testid="input-firstname"
                        className="h-12 text-base"
                      />
                      {form3.formState.errors.firstName && (
                        <p className="text-destructive text-sm">
                          {form3.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-base">
                        Last Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        placeholder="Kumar"
                        {...form3.register("lastName")}
                        data-testid="input-lastname"
                        className="h-12 text-base"
                      />
                      {form3.formState.errors.lastName && (
                        <p className="text-destructive text-sm">
                          {form3.formState.errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-base">
                      Password <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="text-muted-foreground absolute top-3.5 left-3 h-5 w-5" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Minimum 8 characters"
                        className="pl-10 h-12 text-base"
                        {...form3.register("password")}
                        data-testid="input-signup-password"
                      />
                    </div>
                    {form3.formState.errors.password && (
                      <p className="text-destructive text-sm">
                        {form3.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-base">
                      Confirm Password <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="text-muted-foreground absolute top-3.5 left-3 h-5 w-5" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Re-enter password"
                        className="pl-10 h-12 text-base"
                        {...form3.register("confirmPassword")}
                        data-testid="input-confirm-password"
                      />
                    </div>
                    {form3.formState.errors.confirmPassword && (
                      <p className="text-destructive text-sm">
                        {form3.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>
            </AuthFormCard> 
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
