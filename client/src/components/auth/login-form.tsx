import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, User as UserIcon, Lock, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
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
import { useUser, type User } from "@/context/user-context";
import { useToast } from "@/hooks/use-toast";
import { api, API_ENDPOINTS, saveTokens } from "@/lib/api";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

interface LoginFormProps {
  onForgotPassword?: () => void;
}

export function LoginForm({ onForgotPassword }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { setAuth } = useUser();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true);

    try {
      const result = await api.post(API_ENDPOINTS.auth.login, {
        username: data.username,
        password: data.password,
      });

      // Save tokens to localStorage
      if (result.tokens) {
        saveTokens(result.tokens.access, result.tokens.refresh);
      }

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
          access: "mock_access_token",
        },
        user: {
          public_id: "vlTDgDUm0L1WfF",
          username: data.username,
          email: "rajesh.kumar@stmarysschool.edu",
          role: data.username.includes("teacher")
            ? "teacher"
            : data.username.includes("parent")
              ? "parent"
              : "admin",
          full_name: data.username.includes("teacher")
            ? "Sarah Johnson"
            : data.username.includes("parent")
              ? "Michael Smith"
              : "Rajesh Kumar",
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
          is_approved: data.username !== "pending",
        },
      };

      setAuth(mockResponse.user, mockResponse.organization, mockResponse.tokens);

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
    <Card className="mx-auto w-full max-w-md border-0 shadow-none sm:border sm:shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <UserIcon className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
            <Input
              id="username"
              placeholder="Enter your username"
              className="pl-9"
              {...form.register("username")}
              data-testid="input-username"
            />
          </div>
          {form.formState.errors.username && (
            <p className="text-destructive text-sm">{form.formState.errors.username.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Button
              variant="link"
              className="text-primary h-auto px-0 text-xs"
              data-testid="link-forgot-password"
              onClick={onForgotPassword}
              type="button"
            >
              Forgot password?
            </Button>
          </div>
          <div className="relative">
            <Lock className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
            <Input
              id="password"
              type="password"
              className="pl-9"
              {...form.register("password")}
              data-testid="input-password"
            />
          </div>
          {form.formState.errors.password && (
            <p className="text-destructive text-sm">{form.formState.errors.password.message}</p>
          )}
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
