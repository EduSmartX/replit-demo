/**
 * Address Update Form
 * Update residential address
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AddressInputFields } from "@/common/components/forms";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { getUserProfile, updateProfile } from "@/lib/api/profile-api";

const addressSchema = z.object({
  street_address: z.string().min(1, "Street address is required"),
  address_line_2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip_code: z.string().min(1, "Zip code is required"),
  country: z.string().min(1, "Country is required"),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export function AddressUpdateForm() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: getUserProfile,
  });

  const profile = profileData?.data;

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street_address: "",
      address_line_2: "",
      city: "",
      state: "",
      zip_code: "",
      country: "",
    },
  });

  useEffect(() => {
    if (profile?.address) {
      form.reset({
        street_address: profile.address.street_address || "",
        address_line_2: profile.address.address_line_2 || "",
        city: profile.address.city || "",
        state: profile.address.state || "",
        zip_code: profile.address.zip_code || "",
        country: profile.address.country || "",
      });
    }
  }, [profile, form]);

  const updateMutation = useMutation({
    mutationFn: (values: AddressFormValues) => updateProfile({ address: values }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast({
        title: "Success",
        description: "Address updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update address",
      });
    },
  });

  const handleAddressSelect = (address: {
    streetAddress?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  }) => {
    if (address.streetAddress) {
      form.setValue("street_address", address.streetAddress);
    }
    if (address.city) {
      form.setValue("city", address.city);
    }
    if (address.state) {
      form.setValue("state", address.state);
    }
    if (address.zipCode) {
      form.setValue("zip_code", address.zipCode);
    }
    if (address.country) {
      form.setValue("country", address.country);
    }
  };

  const onSubmit = (values: AddressFormValues) => {
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
            <AddressInputFields
              control={form.control}
              streetAddressName="street_address"
              addressLine2Name="address_line_2"
              cityName="city"
              stateName="state"
              zipCodeName="zip_code"
              countryName="country"
              onAddressSelect={handleAddressSelect}
              showLocationButton={true}
              gridCols="2"
            />

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
                Save Address
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
