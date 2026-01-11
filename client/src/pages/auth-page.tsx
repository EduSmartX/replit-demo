import educationBg from "@assets/generated_images/abstract_modern_education_background_with_geometric_shapes_in_blue_and_white..png";
import { useState } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { PasswordReset } from "@/components/auth/password-reset";
import { SignupWizard } from "@/components/auth/signup-wizard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Panel - Image */}
      <div className="bg-primary/5 relative hidden overflow-hidden lg:flex lg:w-2/5">
        <div className="bg-primary/10 absolute inset-0 z-10 mix-blend-multiply" />
        <img
          src={educationBg}
          alt="Education Background"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="relative z-20 flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
              <span className="text-primary text-xl font-bold">S</span>
            </div>
            <span className="text-xl font-bold tracking-tight">School App</span>
          </div>
          <div className="max-w-md">
            <h1 className="mb-4 font-serif text-4xl leading-tight font-bold">
              Empowering Education Through Technology
            </h1>
            <p className="text-lg font-light opacity-90">
              Streamline administration, enhance communication, and focus on what matters
              most—student success.
            </p>
          </div>
          <div className="text-sm opacity-70">© 2025 School App Platform. All rights reserved.</div>
        </div>
      </div>

      {/* Right Panel - Forms */}
      <div className="bg-background flex w-full items-center justify-center p-4 lg:w-3/5 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          {!showPasswordReset ? (
            <>
              <div className="text-center lg:text-left">
                <h2 className="text-foreground font-serif text-3xl font-bold tracking-tight">
                  {activeTab === "login" ? "Welcome back" : "Get started"}
                </h2>
                <p className="text-muted-foreground mt-2">
                  {activeTab === "login"
                    ? "Enter your credentials to access your account"
                    : "Create your institution account in 3 simple steps"}
                </p>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-8 grid w-full grid-cols-2">
                  <TabsTrigger value="login" data-testid="tab-login">
                    Log In
                  </TabsTrigger>
                  <TabsTrigger value="signup" data-testid="tab-signup">
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="login"
                  className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300"
                >
                  <LoginForm onForgotPassword={() => setShowPasswordReset(true)} />
                </TabsContent>

                <TabsContent
                  value="signup"
                  className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300"
                >
                  <SignupWizard onComplete={() => setActiveTab("login")} />
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <>
              <div className="text-center lg:text-left">
                <h2 className="text-foreground font-serif text-3xl font-bold tracking-tight">
                  Reset Your Password
                </h2>
                <p className="text-muted-foreground mt-2">
                  We&apos;ll send you a code to reset your password
                </p>
              </div>

              <PasswordReset
                onBack={() => setShowPasswordReset(false)}
                onSuccess={() => {
                  setShowPasswordReset(false);
                  setActiveTab("login");
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
