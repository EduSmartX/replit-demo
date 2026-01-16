/**
 * Generic Address Management Component
 * Reusable component for managing addresses for any user type (Teacher, Student, Staff, etc.)
 * Uses backend API: PATCH /api/users/profile/{user_public_id}/update-address/
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, MapPin, Loader2, Save, Navigation, Edit } from "lucide-react";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { TextInputField, SelectField } from "./form-fields";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { updateUserAddress, type Address } from "@/lib/api/address-api";
import { parseApiError } from "@/lib/error-parser";

const addressFormSchema = z.object({
  street_address: z.string().min(1, "Street address is required"),
  address_line_2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip_code: z.string().min(1, "Zip code is required"),
  country: z.string().min(1, "Country is required"),
  address_type: z.string().optional(),
  is_primary: z.boolean().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type AddressFormValues = z.infer<typeof addressFormSchema>;

export interface AddressManagementFormRef {
  submitAddress: () => Promise<void>;
  isValid: () => boolean;
}

interface AddressManagementFormProps {
  userPublicId: string; // User's public_id (from user object)
  resourceName: string; // Display name for the resource
  currentAddress?: Address | null; // Current address data if exists
  mode?: "view" | "edit";
  onEditMode?: () => void; // Callback to switch parent to edit mode
  hideActions?: boolean; // Hide Save/Cancel buttons (when part of parent form)
  onAddressChange?: (isValid: boolean) => void; // Callback when address form validity changes
}

const ADDRESS_TYPES = [
  { value: "user_current", label: "Current Address" },
  { value: "user_permanent", label: "Permanent Address" },
];

export const AddressManagementForm = forwardRef<
  AddressManagementFormRef,
  AddressManagementFormProps
>(
  (
    {
      userPublicId,
      resourceName: _resourceName,
      currentAddress,
      mode = "edit",
      onEditMode,
      hideActions = false,
      onAddressChange,
    },
    ref
  ) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    // Initialize isEditing based on mode prop - if mode is "edit", start in editing state
    const [isEditing, setIsEditing] = useState(mode === "edit");
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);
    const isViewMode = mode === "view";

    // Sync isEditing state when mode prop changes
    useEffect(() => {
      // eslint-disable-next-line no-console
      console.log("AddressManagementForm - Mode changed to:", mode);
      setIsEditing(mode === "edit");
    }, [mode]);

    // Debug logging
    useEffect(() => {
      // eslint-disable-next-line no-console
      console.log("AddressManagementForm - Props:", {
        userPublicId,
        currentAddress,
        mode,
        isEditing,
        hasAddress: !!currentAddress,
      });
    }, [userPublicId, currentAddress, mode, isEditing]);

    // Helper to parse coordinate values
    const parseCoordinate = (value: string | number | null | undefined): number | undefined => {
      if (value === null || value === undefined) return undefined;
      const num = typeof value === "string" ? parseFloat(value) : value;
      return isNaN(num) ? undefined : num;
    };

    // Initialize form with current address data
    const form = useForm<AddressFormValues>({
      resolver: zodResolver(addressFormSchema),
      defaultValues: {
        street_address: currentAddress?.street_address || "",
        address_line_2: currentAddress?.address_line_2 || "",
        city: currentAddress?.city || "",
        state: currentAddress?.state || "",
        zip_code: currentAddress?.zip_code || currentAddress?.postal_code || "",
        country: currentAddress?.country || "India",
        address_type: currentAddress?.address_type || "user_current",
        is_primary: currentAddress?.is_primary || false,
        latitude: parseCoordinate(currentAddress?.latitude),
        longitude: parseCoordinate(currentAddress?.longitude),
      },
    });

    // Update form when address changes from parent (e.g., after teacher data refetch)
    useEffect(() => {
      if (currentAddress && !form.formState.isDirty) {
        // Only reset if form hasn't been modified by user
        form.reset({
          street_address: currentAddress.street_address || "",
          address_line_2: currentAddress.address_line_2 || "",
          city: currentAddress.city || "",
          state: currentAddress.state || "",
          zip_code: currentAddress.zip_code || currentAddress.postal_code || "",
          country: currentAddress.country || "India",
          address_type: currentAddress.address_type || "user_current",
          is_primary: currentAddress.is_primary || false,
          latitude: parseCoordinate(currentAddress.latitude),
          longitude: parseCoordinate(currentAddress.longitude),
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentAddress]);

    // Expose submit function to parent via ref
    useImperativeHandle(ref, () => ({
      submitAddress: async () => {
        // Only submit if form has changes
        if (!form.formState.isDirty) {
          console.log("AddressManagementForm - No changes detected, skipping address update");
          return Promise.resolve();
        }

        const isValid = await form.trigger();
        if (isValid) {
          return form.handleSubmit(onSubmit)();
        }
        throw new Error("Address form validation failed");
      },
      isValid: () => form.formState.isValid,
    }));

    // Update address mutation
    const updateMutation = useMutation({
      mutationFn: (data: Partial<Address>) => updateUserAddress(userPublicId, data),
      onSuccess: async (updatedAddress: Address) => {
        // Invalidate all relevant queries to refetch data (including filtered teacher lists)
        await queryClient.invalidateQueries({
          queryKey: ["teachers"],
          exact: false,
        });
        await queryClient.invalidateQueries({
          queryKey: ["teacher"],
          exact: false,
        });
        await queryClient.invalidateQueries({
          queryKey: ["teacher-detail"],
          exact: false,
        });

        // Reset form with new data and clear dirty state
        form.reset(
          {
            street_address: updatedAddress.street_address || "",
            address_line_2: updatedAddress.address_line_2 || "",
            city: updatedAddress.city || "",
            state: updatedAddress.state || "",
            zip_code: updatedAddress.zip_code || updatedAddress.postal_code || "",
            country: updatedAddress.country || "India",
            address_type: updatedAddress.address_type || "user_current",
            is_primary: updatedAddress.is_primary || false,
            latitude: parseCoordinate(updatedAddress.latitude),
            longitude: parseCoordinate(updatedAddress.longitude),
          },
          { keepDirty: false }
        );

        toast({
          title: "Success",
          description: "Address updated successfully",
        });
        setIsEditing(false);
      },
      onError: (error: unknown) => {
        const errorMessage = parseApiError(error);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      },
    });

    const onSubmit = (values: AddressFormValues) => {
      updateMutation.mutate(values);
    };

    const handleEdit = () => {
      // Reset form with current address data when entering edit mode
      if (currentAddress) {
        form.reset({
          street_address: currentAddress.street_address || "",
          address_line_2: currentAddress.address_line_2 || "",
          city: currentAddress.city || "",
          state: currentAddress.state || "",
          zip_code: currentAddress.zip_code || currentAddress.postal_code || "",
          country: currentAddress.country || "India",
          address_type: currentAddress.address_type || "user_current",
          is_primary: currentAddress.is_primary || false,
          latitude: parseCoordinate(currentAddress.latitude),
          longitude: parseCoordinate(currentAddress.longitude),
        });
      }
      setIsEditing(true);
    };

    const handleCancel = () => {
      form.reset();
      setIsEditing(false);
    };

    const handleFetchLocation = async () => {
      if (!navigator.geolocation) {
        toast({
          title: "Not Supported",
          description: "Geolocation is not supported by your browser",
          variant: "destructive",
        });
        return;
      }

      setIsFetchingLocation(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            // Use reverse geocoding to get address from coordinates
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
            );
            const data = await response.json();

            if (data.address) {
              // Update form with fetched address
              form.setValue(
                "street_address",
                data.address.road || data.address.suburb || data.display_name.split(",")[0] || ""
              );
              form.setValue(
                "city",
                data.address.city || data.address.town || data.address.village || ""
              );
              form.setValue("state", data.address.state || "");
              form.setValue("zip_code", data.address.postcode || "");
              form.setValue("country", data.address.country || "India");

              // Store coordinates
              form.setValue("latitude", latitude);
              form.setValue("longitude", longitude);

              toast({
                title: "Location Fetched",
                description:
                  "Address details have been populated. Please verify and adjust if needed.",
              });
            }
          } catch (error) {
            console.error("Reverse geocoding error:", error);
            // Even if reverse geocoding fails, we can still save the coordinates
            form.setValue("latitude", latitude);
            form.setValue("longitude", longitude);

            toast({
              title: "Location Fetched",
              description: `Coordinates captured (${latitude.toFixed(6)}, ${longitude.toFixed(6)}). Please fill in address details manually.`,
            });
          } finally {
            setIsFetchingLocation(false);
          }
        },
        (error) => {
          setIsFetchingLocation(false);
          let errorMessage = "Unable to fetch location";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Location access denied. Please enable location permissions in your browser.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out";
              break;
          }

          toast({
            title: "Location Error",
            description: errorMessage,
            variant: "destructive",
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    };

    const showForm = isEditing;
    const showViewOnly = !isEditing && currentAddress && isViewMode;
    const showEmptyState = !isEditing && !currentAddress;

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="text-muted-foreground h-5 w-5" />
              <CardTitle>Address Information</CardTitle>
            </div>
            {!isEditing && currentAddress && !isViewMode && (
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Address
              </Button>
            )}
            {!isEditing && currentAddress && isViewMode && (
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Address
              </Button>
            )}
            {!isEditing && !currentAddress && !isViewMode && (
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Plus className="mr-2 h-4 w-4" />
                Add Address
              </Button>
            )}
          </div>
          <CardDescription>
            {currentAddress ? "View and manage address information" : "No address added yet"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {showEmptyState ? (
            <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
              <MapPin className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No address found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {isViewMode
                  ? "This user does not have an address on file. Switch to edit mode to add one."
                  : "Get started by adding a new address for this user."}
              </p>
              {!isViewMode && (
                <Button className="mt-4" onClick={handleEdit}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Address
                </Button>
              )}
              {isViewMode && onEditMode && (
                <Button className="mt-4" variant="outline" onClick={onEditMode}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit to Add Address
                </Button>
              )}
            </div>
          ) : showViewOnly ? (
            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Street Address</p>
                <p className="text-sm">{currentAddress.street_address}</p>
              </div>
              {currentAddress.address_line_2 && (
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Address Line 2</p>
                  <p className="text-sm">{currentAddress.address_line_2}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">City</p>
                  <p className="text-sm">{currentAddress.city}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">State</p>
                  <p className="text-sm">{currentAddress.state}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Zip Code</p>
                  <p className="text-sm">{currentAddress.zip_code || currentAddress.postal_code}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Country</p>
                  <p className="text-sm">{currentAddress.country}</p>
                </div>
              </div>
              {currentAddress.address_type && (
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Address Type</p>
                  <p className="text-sm capitalize">{currentAddress.address_type}</p>
                </div>
              )}
              {currentAddress.latitude && currentAddress.longitude && (
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Coordinates</p>
                  <p className="text-sm text-blue-600">
                    {typeof currentAddress.latitude === "number"
                      ? currentAddress.latitude.toFixed(6)
                      : parseFloat(currentAddress.latitude).toFixed(6)}
                    ,{" "}
                    {typeof currentAddress.longitude === "number"
                      ? currentAddress.longitude.toFixed(6)
                      : parseFloat(currentAddress.longitude).toFixed(6)}{" "}
                    <a
                      href={`https://www.google.com/maps?q=${currentAddress.latitude},${currentAddress.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-blue-800"
                    >
                      (View on Map)
                    </a>
                  </p>
                </div>
              )}
            </div>
          ) : showForm ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Location Fetch Button */}
                {!isViewMode && (
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleFetchLocation}
                      disabled={isFetchingLocation}
                    >
                      {isFetchingLocation ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Fetching Location...
                        </>
                      ) : (
                        <>
                          <Navigation className="mr-2 h-4 w-4" />
                          Use My Current Location
                        </>
                      )}
                    </Button>
                  </div>
                )}

                <TextInputField
                  control={form.control}
                  name="street_address"
                  label="Street Address"
                  placeholder="Enter street address"
                  required
                  disabled={isViewMode}
                />

                <TextInputField
                  control={form.control}
                  name="address_line_2"
                  label="Address Line 2"
                  placeholder="Apartment, suite, unit, building, floor, etc. (optional)"
                  disabled={isViewMode}
                />

                <div className="grid grid-cols-2 gap-4">
                  <TextInputField
                    control={form.control}
                    name="city"
                    label="City"
                    placeholder="Enter city"
                    required
                    disabled={isViewMode}
                  />
                  <TextInputField
                    control={form.control}
                    name="state"
                    label="State"
                    placeholder="Enter state"
                    required
                    disabled={isViewMode}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <TextInputField
                    control={form.control}
                    name="zip_code"
                    label="Zip Code"
                    placeholder="Enter zip code"
                    required
                    disabled={isViewMode}
                  />
                  <TextInputField
                    control={form.control}
                    name="country"
                    label="Country"
                    placeholder="Enter country"
                    required
                    disabled={isViewMode}
                  />
                </div>

                <SelectField
                  control={form.control}
                  name="address_type"
                  label="Address Type"
                  placeholder="Select address type"
                  options={ADDRESS_TYPES}
                  disabled={isViewMode}
                />

                {!isViewMode && !hideActions && (
                  <div className="flex justify-end gap-2">
                    {isEditing && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={updateMutation.isPending}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button type="submit" disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Address
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          ) : null}
        </CardContent>
      </Card>
    );
  }
);

AddressManagementForm.displayName = "AddressManagementForm";
