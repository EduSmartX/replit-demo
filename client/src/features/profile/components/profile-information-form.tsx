/**
 * Profile Information Form
 * Update personal details (name, gender, blood group, DOB)
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  BloodGroupField,
  DateInputField,
  GenderField,
  TextInputField,
} from "@/common/components/forms";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { getUserProfile, updateProfile } from "@/lib/api/profile-api";

const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  gender: z.string().min(1, "Gender is required"),
  blood_group: z.string().optional(),
  date_of_birth: z.string().optional(),
  notification_opt_in: z.boolean(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileInformationForm() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfile,
  });

  const profile = profileData?.data;

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      gender: "",
      blood_group: "",
      date_of_birth: "",
      notification_opt_in: true,
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        gender: profile.gender || "",
        blood_group: profile.blood_group || "",
        date_of_birth: profile.date_of_birth || "",
        notification_opt_in: profile.notification_opt_in ?? true,
      });
    }
  }, [profile, form]);

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile",
      });
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    updateMutation.mutate(values);
  };

  if (isLoadingProfile) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextInputField
                control={form.control}
                name="first_name"
                label="First Name"
                placeholder="John"
                required
              />
              <TextInputField
                control={form.control}
                name="last_name"
                label="Last Name"
                placeholder="Doe"
                required
              />
              <GenderField control={form.control} name="gender" required />
              <BloodGroupField control={form.control} name="blood_group" />
              <DateInputField
                control={form.control}
                name="date_of_birth"
                label="Date of Birth"
                max={new Date()}
              />
              <FormField
                control={form.control}
                name="notification_opt_in"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Notification Preferences</FormLabel>
                      <FormDescription>
                        Receive email notifications about important updates
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
                disabled={updateMutation.isPending}
              >
                Reset
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
