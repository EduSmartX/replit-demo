/**
 * Email Update Form
 * Update email with OTP verification
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Mail, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getUserProfile, sendOTP, updateEmail } from "@/lib/api/profile-api";

const emailSchema = z.object({
  new_email: z.string().email("Invalid email address"),
  otp: z.string().min(6, "OTP must be 6 digits").max(6),
});

type EmailFormValues = z.infer<typeof emailSchema>;

export function EmailUpdateForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { data: profileData } = useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfile,
  });

  const currentEmail = profileData?.data?.email;

  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      new_email: "",
      otp: "",
    },
  });

  const sendOTPMutation = useMutation({
    mutationFn: (email: string) => sendOTP({ email, purpose: "EMAIL_VERIFICATION" }),
    onSuccess: (_data) => {
      setOtpSent(true);
      toast({
        title: "Success",
        description: "OTP sent to your new email address",
      });

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send OTP",
      });
    },
  });

  const updateEmailMutation = useMutation({
    mutationFn: updateEmail,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Email updated successfully",
      });
      form.reset();
      setOtpSent(false);
      // Refetch user profile to update current email display
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update email",
      });
    },
  });

  const handleSendOTP = () => {
    const email = form.getValues("new_email");
    if (!email || !z.string().email().safeParse(email).success) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid email address",
      });
      return;
    }
    sendOTPMutation.mutate(email);
  };

  const onSubmit = (values: EmailFormValues) => {
    updateEmailMutation.mutate(values);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-900">
            <strong>Current Email:</strong> {currentEmail}
          </p>
          <p className="mt-1 text-xs text-blue-700">
            An OTP will be sent to your new email for verification
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="new_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    New Email Address <span className="text-red-500">*</span>
                  </FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="newemail@example.com"
                        {...field}
                        disabled={otpSent}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={otpSent || sendOTPMutation.isPending}
                    >
                      {sendOTPMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <FormDescription>
                    {otpSent ? (
                      <span className="text-green-600">
                        OTP sent! Expires in {formatTime(countdown)}
                      </span>
                    ) : (
                      "Click the button to send OTP to this email"
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {otpSent && (
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      OTP Code <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Enter 6-digit OTP" maxLength={6} {...field} />
                    </FormControl>
                    <FormDescription>Enter the OTP sent to your new email</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setOtpSent(false);
                }}
                disabled={updateEmailMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!otpSent || updateEmailMutation.isPending}>
                {updateEmailMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Mail className="mr-2 h-4 w-4" />
                Update Email
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
