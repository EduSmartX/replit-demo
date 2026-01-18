import { motion } from "framer-motion";
import { CheckCircle2, Clock, Mail, ShieldCheck, Users, Settings, ArrowRight, CalendarDays, Sliders } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface RegistrationData {
  username: string;
  organizationName: string;
  email: string;
}

export default function RegistrationSuccess() {
  const [, setLocation] = useLocation();
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);

  useEffect(() => {
    // Get registration data from sessionStorage
    const storedData = sessionStorage.getItem("registrationData");

    if (storedData) {
      setRegistrationData(JSON.parse(storedData));
      // Clear the data after reading
      sessionStorage.removeItem("registrationData");
    } else {
      // Redirect to login if no registration data
      setLocation("/auth");
    }
  }, [setLocation]);

  if (!registrationData) {
    return null;
  }

  return (
    <div className="from-primary/5 via-background to-primary/10 flex min-h-screen w-full items-center justify-center bg-gradient-to-br p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-2">
          <CardHeader className="space-y-4 pb-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20"
            >
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </motion.div>

            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold">Registration Successful!</CardTitle>
              <CardDescription className="text-base">Welcome to EduCard Platform</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* User Info */}
            <div className="bg-primary/5 space-y-2 rounded-lg p-4">
              <p className="text-muted-foreground text-sm">Your Credentials</p>
              <div className="space-y-1">
                <p className="text-lg font-semibold">{registrationData.organizationName}</p>
                <p className="text-muted-foreground text-sm">
                  Username:{" "}
                  <span className="text-foreground font-mono font-medium">
                    {registrationData.username}
                  </span>
                </p>
                <p className="text-muted-foreground text-sm">
                  Email:{" "}
                  <span className="text-foreground font-medium">{registrationData.email}</span>
                </p>
              </div>
            </div>

            {/* Important Notice */}
            <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/10">
              <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="space-y-1">
                <p className="font-semibold text-amber-900 dark:text-amber-100">Pending Approval</p>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Please wait for EduCard admin approval before logging in. You&apos;ll receive a
                  confirmation email once approved.
                </p>
              </div>
            </div>

            {/* What's Next */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <ShieldCheck className="text-primary h-5 w-5" />
                What&apos;s Next?
              </h3>

              <p className="text-muted-foreground text-sm leading-relaxed">
                Your organization registration has been received successfully. Our team will review
                your application and verify the details.
              </p>

              <div className="space-y-3">
                <p className="text-sm font-medium">
                  Once EduCard approves your organization, you will be able to:
                </p>

                <div className="grid gap-3">
                  <div className="flex items-start gap-3 text-sm">
                    <div className="bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                      <Settings className="text-primary h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Access your organization dashboard</p>
                      <p className="text-muted-foreground text-xs">
                        Manage organization settings and profile
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-sm">
                    <div className="bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                      <Sliders className="text-primary h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Configure organization preferences</p>
                      <p className="text-muted-foreground text-xs">
                        Set working day policies and attendance preferences
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-sm">
                    <div className="bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                      <CalendarDays className="text-primary h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Manage leave allocations</p>
                      <p className="text-muted-foreground text-xs">
                        Configure leave types and allocate to staff
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-sm">
                    <div className="bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                      <Users className="text-primary h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Add team members</p>
                      <p className="text-muted-foreground text-xs">
                        Invite staff and manage permissions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-sm">
                    <div className="bg-primary/10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                      <Mail className="text-primary h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Start using EduCard services</p>
                      <p className="text-muted-foreground text-xs">
                        Full access to all platform features
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/10">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <Clock className="mr-1 inline h-4 w-4" />
                  <strong>Verification Timeline:</strong> This process typically takes 24-48 hours.
                  You will receive a confirmation email at <strong>{registrationData.email}</strong>{" "}
                  once your organization is approved.
                </p>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4">
              <Button onClick={() => setLocation("/auth")} className="w-full" size="lg">
                Back to Login Page
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Contact Info */}
            <div className="border-t pt-4 text-center">
              <p className="text-muted-foreground text-xs">
                Need help? Contact our support team at{" "}
                <a href="mailto:support@educard.com" className="text-primary hover:underline">
                  support@educard.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
