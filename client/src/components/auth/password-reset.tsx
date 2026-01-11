import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mail, Lock, KeyRound, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api, API_ENDPOINTS } from "@/lib/api";

// Schema for Step 1 - Request Reset
const step1Schema = z.object({
  identifier: z.string().min(1, "Please enter your username or email"),
});

// Schema for Step 2 - Verify OTP and Reset Password
const step2Schema = z
  .object({
    otp: z.string().min(1, "OTP is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

interface PasswordResetProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function PasswordReset({ onBack, onSuccess }: PasswordResetProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [expiresInMinutes, setExpiresInMinutes] = useState(10);
  const { toast } = useToast();

  const form1 = useForm<z.infer<typeof step1Schema>>({
    resolver: zodResolver(step1Schema),
    defaultValues: { identifier: "" },
  });

  const form2 = useForm<z.infer<typeof step2Schema>>({
    resolver: zodResolver(step2Schema),
    defaultValues: { otp: "", newPassword: "", confirmPassword: "" },
  });

  const onStep1Submit = async (data: z.infer<typeof step1Schema>) => {
    setIsLoading(true);

    try {
      // Determine if it's email or username
      const isEmail = data.identifier.includes("@");
      const requestData = isEmail ? { email: data.identifier } : { username: data.identifier };

      const response = await api.post(API_ENDPOINTS.auth.passwordResetRequest, requestData);

      if (response.message) {
        setIdentifier(data.identifier);
        setExpiresInMinutes(response.expires_in_minutes || 10);
        toast({
          title: "OTP Sent",
          description: response.message,
        });
        setStep(2);
      }
    } catch (error: unknown) {
      let errorMessage = "Failed to send reset code. Please try again.";

      try {
        const errorText = (error as { message?: string })?.message || "";
        const jsonMatch = errorText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const errorData = JSON.parse(jsonMatch[0]);

          if (errorData.errors && errorData.errors.non_field_errors) {
            errorMessage = errorData.errors.non_field_errors[0];
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        }
      } catch (parseError) {
        errorMessage = error.message || errorMessage;
      }

      toast({
        title: "Request Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onStep2Submit = async (data: z.infer<typeof step2Schema>) => {
    setIsLoading(true);

    try {
      // Determine if identifier is email or username
      const isEmail = identifier.includes("@");
      const requestData = {
        ...(isEmail ? { email: identifier } : { username: identifier }),
        otp: data.otp,
        new_password: data.newPassword,
        confirm_password: data.confirmPassword,
      };

      const response = await api.post(API_ENDPOINTS.auth.passwordResetVerify, requestData);

      if (response.message) {
        toast({
          title: "Password Reset Successful",
          description: response.message,
        });

        // Redirect to login after a short delay
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (error: unknown) {
      let errorMessage = "Failed to reset password. Please try again.";

      try {
        const errorText = (error as { message?: string })?.message || "";
        const jsonMatch = errorText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const errorData = JSON.parse(jsonMatch[0]);

          if (errorData.errors) {
            // Handle field-specific errors
            if (errorData.errors.otp) {
              form2.setError("otp", {
                type: "manual",
                message: errorData.errors.otp[0],
              });
              errorMessage = errorData.errors.otp[0];
            } else if (errorData.errors.new_password) {
              form2.setError("newPassword", {
                type: "manual",
                message: errorData.errors.new_password[0],
              });
              errorMessage = errorData.errors.new_password[0];
            } else if (errorData.errors.non_field_errors) {
              errorMessage = errorData.errors.non_field_errors[0];
            }
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        }
      } catch (parseError) {
        errorMessage = error.message || errorMessage;
      }

      toast({
        title: "Reset Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Reset Password</CardTitle>
                <CardDescription>
                  Enter your username or email to receive a password reset code.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="identifier">Username or Email</Label>
                  <div className="relative">
                    <Mail className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                    <Input
                      id="identifier"
                      placeholder="username or email@example.com"
                      className="pl-9"
                      {...form1.register("identifier")}
                      data-testid="input-identifier"
                    />
                  </div>
                  {form1.formState.errors.identifier && (
                    <p className="text-destructive text-sm">
                      {form1.formState.errors.identifier.message}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" onClick={onBack} disabled={isLoading}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={form1.handleSubmit(onStep1Submit)}
                  disabled={isLoading}
                  data-testid="button-send-reset-code"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Send Reset Code"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Verify & Reset</CardTitle>
                <CardDescription>
                  Enter the OTP sent to {identifier} and set your new password.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/10">
                  <p className="flex items-center gap-2 text-sm text-blue-900 dark:text-blue-100">
                    <KeyRound className="h-4 w-4" />
                    OTP expires in <strong>{expiresInMinutes} minutes</strong>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otp">One-Time Password</Label>
                  <Input
                    id="otp"
                    placeholder="Enter 6-digit OTP"
                    className="text-center text-lg tracking-widest"
                    {...form2.register("otp")}
                    data-testid="input-otp"
                  />
                  {form2.formState.errors.otp && (
                    <p className="text-destructive text-sm">{form2.formState.errors.otp.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Lock className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Minimum 8 characters"
                      className="pl-9"
                      {...form2.register("newPassword")}
                      data-testid="input-new-password"
                    />
                  </div>
                  {form2.formState.errors.newPassword && (
                    <p className="text-destructive text-sm">
                      {form2.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter password"
                      className="pl-9"
                      {...form2.register("confirmPassword")}
                      data-testid="input-confirm-password"
                    />
                  </div>
                  {form2.formState.errors.confirmPassword && (
                    <p className="text-destructive text-sm">
                      {form2.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)} disabled={isLoading}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={form2.handleSubmit(onStep2Submit)}
                  disabled={isLoading}
                  data-testid="button-reset-password"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Reset Password
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
