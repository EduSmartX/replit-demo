/**
 * Phone Update Form
 * Update phone with OTP verification
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Phone, Send } from "lucide-react";
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
import { getUserProfile, sendOTP, updatePhone } from "@/lib/api/profile-api";

const phoneSchema = z.object({
  new_phone: z.string().min(10, "Phone number must be at least 10 digits"),
  otp: z.string().min(6, "OTP must be 6 digits").max(6),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;

export function PhoneUpdateForm() {
  const { toast } = useToast();
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { data: profileData } = useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfile,
  });

  const currentPhone = profileData?.data?.phone;

  const form = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      new_phone: "",
      otp: "",
    },
  });

  const sendOTPMutation = useMutation({
    mutationFn: (phone: string) => sendOTP({ phone, purpose: "PHONE_VERIFICATION" }),
    onSuccess: (data) => {
      setOtpSent(true);
      setCountdown(data.data.expires_in_minutes * 60);
      toast({
        title: "Success",
        description: "OTP sent to your new phone number",
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

  const updatePhoneMutation = useMutation({
    mutationFn: updatePhone,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Phone number updated successfully",
      });
      form.reset();
      setOtpSent(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update phone number",
      });
    },
  });

  const handleSendOTP = () => {
    const phone = form.getValues("new_phone");
    if (!phone || phone.length < 10) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid phone number",
      });
      return;
    }
    sendOTPMutation.mutate(phone);
  };

  const onSubmit = (values: PhoneFormValues) => {
    updatePhoneMutation.mutate(values);
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
            <strong>Current Phone:</strong> {currentPhone || "Not set"}
          </p>
          <p className="mt-1 text-xs text-blue-700">
            An OTP will be sent to your new phone number for verification
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="new_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    New Phone Number <span className="text-red-500">*</span>
                  </FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input type="tel" placeholder="+1234567890" {...field} disabled={otpSent} />
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
                      "Click the button to send OTP to this phone"
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
                    <FormDescription>Enter the OTP sent to your new phone number</FormDescription>
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
                disabled={updatePhoneMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!otpSent || updatePhoneMutation.isPending}>
                {updatePhoneMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Phone className="mr-2 h-4 w-4" />
                Update Phone
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
