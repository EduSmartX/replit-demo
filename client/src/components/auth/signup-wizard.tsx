import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, ArrowRight, ArrowLeft, Mail, Building2, User, Lock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Schema for Step 1
const step1Schema = z.object({
  adminEmail: z.string().email({ message: "Invalid admin email address" }),
  orgEmail: z.string().email({ message: "Invalid organization email address" }),
});

// Schema for Step 2
const step2Schema = z.object({
  otp: z.string().min(6, { message: "OTP must be 6 digits" }),
});

// Schema for Step 3
const step3Schema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  role: z.string().min(1, "Please select a role"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export function SignupWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Forms
  const form1 = useForm<z.infer<typeof step1Schema>>({
    resolver: zodResolver(step1Schema),
    defaultValues: { adminEmail: "", orgEmail: "" }
  });

  const form2 = useForm<z.infer<typeof step2Schema>>({
    resolver: zodResolver(step2Schema),
    defaultValues: { otp: "" }
  });

  const form3 = useForm<z.infer<typeof step3Schema>>({
    resolver: zodResolver(step3Schema),
    defaultValues: { firstName: "", lastName: "", role: "", password: "", confirmPassword: "" }
  });

  // Handlers
  const onStep1Submit = async (data: z.infer<typeof step1Schema>) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    toast({
      title: "OTP Sent",
      description: `We've sent a verification code to ${data.adminEmail}`,
    });
    setStep(2);
  };

  const onStep2Submit = async (data: z.infer<typeof step2Schema>) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    toast({
      title: "Verified",
      description: "Organization email successfully verified.",
    });
    setStep(3);
  };

  const onStep3Submit = async (data: z.infer<typeof step3Schema>) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    toast({
      title: "Account Created",
      description: "Welcome to School App! You can now log in.",
    });
    onComplete();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8 flex justify-center items-center space-x-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step >= i 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
            </div>
            {i < 3 && (
              <div 
                className={`w-12 h-0.5 mx-2 transition-colors ${
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
            <Card>
              <CardHeader>
                <CardTitle>Organization Details</CardTitle>
                <CardDescription>Enter your institution's contact information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orgEmail">Organization Email</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="orgEmail" 
                      placeholder="school@edu.org" 
                      className="pl-9"
                      {...form1.register("orgEmail")}
                      data-testid="input-org-email"
                    />
                  </div>
                  {form1.formState.errors.orgEmail && (
                    <p className="text-sm text-destructive">{form1.formState.errors.orgEmail.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Administrator Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="adminEmail" 
                      placeholder="admin@edu.org" 
                      className="pl-9"
                      {...form1.register("adminEmail")}
                      data-testid="input-admin-email"
                    />
                  </div>
                  {form1.formState.errors.adminEmail && (
                    <p className="text-sm text-destructive">{form1.formState.errors.adminEmail.message}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  onClick={form1.handleSubmit(onStep1Submit)}
                  disabled={isLoading}
                  data-testid="button-send-otp"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify & Send OTP"}
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
                <CardTitle>Verify Email</CardTitle>
                <CardDescription>Enter the 6-digit code sent to {form1.getValues("adminEmail")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">One-Time Password</Label>
                  <Input 
                    id="otp" 
                    placeholder="123456" 
                    className="text-center text-2xl tracking-widest"
                    maxLength={6}
                    {...form2.register("otp")}
                    data-testid="input-otp"
                  />
                  {form2.formState.errors.otp && (
                    <p className="text-sm text-destructive">{form2.formState.errors.otp.message}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)} disabled={isLoading}>Back</Button>
                <Button 
                  onClick={form2.handleSubmit(onStep2Submit)}
                  disabled={isLoading}
                  data-testid="button-verify-otp"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify Code"}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Account Setup</CardTitle>
                <CardDescription>Complete your administrator profile.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" {...form3.register("firstName")} data-testid="input-firstname" />
                    {form3.formState.errors.firstName && <p className="text-sm text-destructive">{form3.formState.errors.firstName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" {...form3.register("lastName")} data-testid="input-lastname" />
                    {form3.formState.errors.lastName && <p className="text-sm text-destructive">{form3.formState.errors.lastName.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select onValueChange={(val) => form3.setValue("role", val)}>
                    <SelectTrigger data-testid="select-role">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Principal / Admin</SelectItem>
                      <SelectItem value="coordinator">Coordinator</SelectItem>
                      <SelectItem value="teacher">Head Teacher</SelectItem>
                    </SelectContent>
                  </Select>
                  {form3.formState.errors.role && <p className="text-sm text-destructive">{form3.formState.errors.role.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type="password" className="pl-9" {...form3.register("password")} data-testid="input-signup-password" />
                  </div>
                  {form3.formState.errors.password && <p className="text-sm text-destructive">{form3.formState.errors.password.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="confirmPassword" type="password" className="pl-9" {...form3.register("confirmPassword")} data-testid="input-confirm-password" />
                  </div>
                  {form3.formState.errors.confirmPassword && <p className="text-sm text-destructive">{form3.formState.errors.confirmPassword.message}</p>}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90" 
                  onClick={form3.handleSubmit(onStep3Submit)}
                  disabled={isLoading}
                  data-testid="button-complete-signup"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Complete Registration"}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
