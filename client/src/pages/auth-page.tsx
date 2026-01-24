import { GraduationCap } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/features/auth/components/login-form";
import { PasswordReset } from "@/features/auth/components/password-reset";
import { SignupWizard } from "@/features/auth/components/signup-wizard";
import { COMPANY_NAME } from "@/lib/constants/app-config";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [signupStep, setSignupStep] = useState(1);
  const [, setLocation] = useLocation();

  const getSignupDescription = () => {
    switch (signupStep) {
      case 1:
        return "Join the EduSphere network and simplify your management.";
      case 2:
        return "Enter the 6-digit codes sent to both email addresses";
      case 3:
        return "Provide organization details, address, and admin information.";
      default:
        return "Create your institution account in 3 simple steps";
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30">
      {/* Header with Logo and Navigation */}
      <div className="w-full border-b bg-gradient-to-r from-blue-600 to-emerald-500 shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white">{COMPANY_NAME}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-white hover:bg-white/20"
            onClick={() => setLocation("/")}
          >
            Back to Home
          </Button>
        </div>
      </div>

      {/* Center Panel - Forms */}
      <div className="flex w-full flex-1 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-4xl space-y-6">
          {!showPasswordReset ? (
            <>
              <div className="text-center">
                <h2 className="text-foreground font-serif text-2xl lg:text-3xl font-bold tracking-tight">
                  {activeTab === "login" ? "Welcome back" : "School Registration"}
                </h2>
                <p className="text-muted-foreground mt-2 text-sm lg:text-base">
                  {activeTab === "login"
                    ? "Enter your credentials to access your account"
                    : getSignupDescription()}
                </p>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-6 grid w-full max-w-md mx-auto grid-cols-2 h-11">
                  <TabsTrigger value="login" data-testid="tab-login" className="text-base">
                    Log In
                  </TabsTrigger>
                  <TabsTrigger value="signup" data-testid="tab-signup" className="text-base">
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="login"
                  className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300"
                >
                  <div className="mx-auto max-w-md">
                    <LoginForm onForgotPassword={() => setShowPasswordReset(true)} />
                  </div>
                </TabsContent>

                <TabsContent
                  value="signup"
                  className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300"
                >
                  <SignupWizard 
                    onComplete={() => setActiveTab("login")}
                    onStepChange={setSignupStep}
                  />
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <>
              <div className="text-center">
                <h2 className="text-foreground font-serif text-2xl lg:text-3xl font-bold tracking-tight">
                  Reset Your Password
                </h2>
                <p className="text-muted-foreground mt-2 text-sm lg:text-base">
                  We&apos;ll send you a code to reset your password
                </p>
              </div>

              <div className="mx-auto max-w-md">
                <PasswordReset
                  onBack={() => setShowPasswordReset(false)}
                  onSuccess={() => {
                    setShowPasswordReset(false);
                    setActiveTab("login");
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
