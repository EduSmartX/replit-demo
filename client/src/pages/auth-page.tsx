import { useState } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { SignupWizard } from "@/components/auth/signup-wizard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import educationBg from "@assets/generated_images/abstract_modern_education_background_with_geometric_shapes_in_blue_and_white..png";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Panel - Image */}
      <div className="hidden lg:flex w-1/2 relative bg-primary/5 overflow-hidden">
        <div className="absolute inset-0 bg-primary/10 z-10 mix-blend-multiply" />
        <img 
          src={educationBg} 
          alt="Education Background" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 p-12 flex flex-col justify-between h-full text-white">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-primary font-bold text-xl">S</span>
            </div>
            <span className="text-xl font-bold tracking-tight">School App</span>
          </div>
          <div className="max-w-md">
            <h1 className="text-4xl font-serif font-bold mb-4 leading-tight">
              Empowering Education Through Technology
            </h1>
            <p className="text-lg opacity-90 font-light">
              Streamline administration, enhance communication, and focus on what matters most—student success.
            </p>
          </div>
          <div className="text-sm opacity-70">
            © 2025 School App Platform. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Panel - Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-serif font-bold tracking-tight text-foreground">
              {activeTab === "login" ? "Welcome back" : "Get started"}
            </h2>
            <p className="text-muted-foreground mt-2">
              {activeTab === "login" 
                ? "Enter your credentials to access your account" 
                : "Create your institution account in 3 simple steps"}
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login" data-testid="tab-login">Log In</TabsTrigger>
              <TabsTrigger value="signup" data-testid="tab-signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
              <LoginForm />
            </TabsContent>
            
            <TabsContent value="signup" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
              <SignupWizard onComplete={() => setActiveTab("login")} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
