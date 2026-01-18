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
import { useUser } from "@/core/contexts";
import { useToast } from "@/hooks/use-toast";
import { api, API_ENDPOINTS, saveTokens } from "@/lib/api";
import { ErrorMessages, SuccessMessages, ValidationErrorMessages } from "@/lib/constants";

const loginSchema = z.object({
  username: z.string().min(1, ValidationErrorMessages.USERNAME_REQUIRED),
  password: z.string().min(1, ValidationErrorMessages.PASSWORD_REQUIRED),
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
      const result = (await api.post(API_ENDPOINTS.auth.login, {
        username: data.username,
        password: data.password,
      })) as {
        tokens: { access: string; refresh: string };
        user: { full_name: string; [key: string]: unknown };
        organization: unknown;
      };

      // Save tokens to localStorage
      if (result.tokens) {
        saveTokens(result.tokens.access, result.tokens.refresh);
      }

      setAuth(result.user as any, result.organization as any, result.tokens);

      toast({
        title: "Welcome back!",
        description: `${SuccessMessages.Auth.LOGIN_SUCCESS} Welcome, ${result.user.full_name}!`,
      });

      // Redirect to stored URL or default to dashboard
      const redirectUrl = sessionStorage.getItem("redirectAfterLogin") || "/dashboard";
      sessionStorage.removeItem("redirectAfterLogin");
      setLocation(redirectUrl);
    } catch (error: unknown) {
      // Handle authentication errors properly
      const err = error as {
        message?: string;
        detail?: string;
        non_field_errors?: string[];
        errors?: {
          non_field_errors?: string[];
          [key: string]: any;
        };
      };
      const errorMessage =
        err?.errors?.non_field_errors?.[0] ||
        err?.non_field_errors?.[0] ||
        err?.detail ||
        err?.message ||
        ErrorMessages.Auth.LOGIN_FAILED;

      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      });
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
