import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, User, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useUser } from "@/context/user-context";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  role: z.string().min(1, "Please select a role"),
});

const demoUsers = {
  admin: { name: "John Doe", email: "admin@school.edu", password: "admin123" },
  teacher: { name: "Sarah Johnson", email: "teacher@school.edu", password: "teacher123" },
  parent: { name: "Michael Smith", email: "parent@school.edu", password: "parent123" },
};

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { setUser } = useUser();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "", role: "" }
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);

    const role = data.role as "admin" | "teacher" | "parent";
    const demoUser = demoUsers[role];
    
    toast({
      title: "Welcome back!",
      description: `Successfully logged in as ${role}.`,
    });

    // Set user context
    setUser({
      id: role,
      name: demoUser.name,
      email: demoUser.email,
      role: role,
      institution: "Green Valley High School"
    });
    
    // Redirect to dashboard
    setLocation("/dashboard");
  };

  const autofillRole = (role: string) => {
    const demoUser = demoUsers[role as keyof typeof demoUsers];
    form.setValue("username", demoUser.email);
    form.setValue("password", demoUser.password);
    form.setValue("role", role);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-none border-0 sm:border sm:shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="role">Select Your Role</Label>
          <Select onValueChange={(val) => {
            form.setValue("role", val);
            autofillRole(val);
          }}>
            <SelectTrigger data-testid="select-role">
              <SelectValue placeholder="Choose your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">🎓 School Admin</SelectItem>
              <SelectItem value="teacher">👨‍🏫 Teacher</SelectItem>
              <SelectItem value="parent">👨‍👩‍👧 Parent</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.role && (
            <p className="text-sm text-destructive">{form.formState.errors.role.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Username or Email</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              id="username" 
              placeholder="admin@school.edu" 
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

        <div className="text-xs text-muted-foreground">
          <p className="font-semibold mb-2">Demo Credentials:</p>
          <ul className="space-y-1">
            <li>Admin: admin@school.edu / admin123</li>
            <li>Teacher: teacher@school.edu / teacher123</li>
            <li>Parent: parent@school.edu / parent123</li>
          </ul>
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
