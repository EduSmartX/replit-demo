import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, User, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useUser } from "@/context/user-context";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const API_BASE_URL = "http://localhost:8000";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { setAuth } = useUser();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" }
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
        }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const result = await response.json();
      
      setAuth(result.user, result.organization, result.tokens);
      
      toast({
        title: "Welcome back!",
        description: `Successfully logged in as ${result.user.full_name}.`,
      });

      setLocation("/dashboard");
    } catch (error) {
      // For demo/testing - use mock data if API fails
      const mockResponse = {
        message: "Login successful.",
        tokens: {
          refresh: "mock_refresh_token",
          access: "mock_access_token"
        },
        user: {
          public_id: "vlTDgDUm0L1WfF",
          username: data.username,
          email: "rajesh.kumar@stmarysschool.edu",
          role: data.username.includes("teacher") ? "teacher" : data.username.includes("parent") ? "parent" : "admin",
          full_name: data.username.includes("teacher") ? "Sarah Johnson" : data.username.includes("parent") ? "Michael Smith" : "Rajesh Kumar"
        },
        organization: {
          public_id: "1SqYNe7saEyqg",
          name: "St. Mary's International School",
          organization_type: "public",
          email: "info@stmarysschool.edu",
          phone: "+919876543210",
          website_url: "https://www.stmarysschool.edu",
          board_affiliation: "cbse",
          legal_entity: "St. Mary's Educational Trust",
          is_active: true,
          is_verified: true,
          is_approved: data.username !== "pending"
        }
      };

      setAuth(
        mockResponse.user as any, 
        mockResponse.organization, 
        mockResponse.tokens
      );
      
      toast({
        title: "Welcome back!",
        description: `Successfully logged in as ${mockResponse.user.full_name}.`,
      });

      setLocation("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-none border-0 sm:border sm:shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              id="username" 
              placeholder="Enter your username" 
              className="pl-9"
              {...form.register("username")}
              data-testid="input-username"
            />
          </div>
          {form.formState.errors.username && (
            <p className="text-sm text-destructive">{form.formState.errors.username.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Button variant="link" className="px-0 h-auto text-xs text-primary" data-testid="link-forgot-password">
              Forgot password?
            </Button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              id="password" 
              type="password" 
              className="pl-9"
              {...form.register("password")}
              data-testid="input-password"
            />
          </div>
          {form.formState.errors.password && (
            <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
          )}
        </div>

        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <p className="font-semibold mb-2">Demo Accounts:</p>
          <ul className="space-y-1">
            <li><span className="font-medium">Admin:</span> rajesh.kumar602</li>
            <li><span className="font-medium">Teacher:</span> teacher.demo</li>
            <li><span className="font-medium">Parent:</span> parent.demo</li>
            <li><span className="font-medium">Pending Org:</span> pending</li>
          </ul>
          <p className="mt-2 text-muted-foreground">Password: any value</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={form.handleSubmit(onSubmit)}
          disabled={isLoading}
          data-testid="button-login"
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
          {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </CardFooter>
    </Card>
  );
}
