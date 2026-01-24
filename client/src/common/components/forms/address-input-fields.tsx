/**
 * Reusable Address Input Fields Component
 * Form fields for address input with geolocation support
 * Can be used in any form that needs address collection
 */

import { Loader2, Navigation } from "lucide-react";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AddressComponents } from "@/lib/google-places";
import type { Control, FieldValues, Path } from "react-hook-form";

interface AddressInputFieldsProps<T extends FieldValues> {
  control: Control<T>;
  streetAddressName: Path<T>;
  addressLine2Name: Path<T>;
  cityName: Path<T>;
  stateName: Path<T>;
  zipCodeName: Path<T>;
  countryName: Path<T>;
  latitudeName?: Path<T>;
  longitudeName?: Path<T>;
  onAddressSelect?: (address: AddressComponents) => void;
  errors?: {
    streetAddress?: { message?: string };
    addressLine2?: { message?: string };
    city?: { message?: string };
    state?: { message?: string };
    zipCode?: { message?: string };
    country?: { message?: string };
  };
  disabled?: boolean;
  showLocationButton?: boolean;
  gridCols?: "1" | "2";
}

export function AddressInputFields<T extends FieldValues>({
  control,
  streetAddressName,
  addressLine2Name,
  cityName,
  stateName,
  zipCodeName,
  countryName,
  latitudeName,
  longitudeName,
  onAddressSelect,
  errors,
  disabled = false,
  showLocationButton = true,
  gridCols = "2",
}: AddressInputFieldsProps<T>) {
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const handleFetchLocation = async () => {
    if (!navigator.geolocation) {
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
            // Create address components object
            const addressComponents: AddressComponents = {
              streetAddress: data.address.road || data.address.suburb || data.display_name.split(",")[0] || "",
              city: data.address.city || data.address.town || data.address.village || "",
              state: data.address.state || "",
              zipCode: data.address.postcode || "",
              country: data.address.country || "INDIA",
              latitude: latitude.toString(),
              longitude: longitude.toString(),
            };

            // Call the callback if provided
            if (onAddressSelect) {
              onAddressSelect(addressComponents);
            }
          }
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          // If callback provided and we have coordinates, still call it with partial data
          if (onAddressSelect && latitudeName && longitudeName) {
            onAddressSelect({
              streetAddress: "",
              city: "",
              state: "",
              zipCode: "",
              country: "INDIA",
              latitude: latitude.toString(),
              longitude: longitude.toString(),
            });
          }
        } finally {
          setIsFetchingLocation(false);
        }
      },
      () => {
        setIsFetchingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const gridClass = gridCols === "1" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2";

  return (
    <div className="space-y-4">
      {/* Location Fetch Button */}
      {showLocationButton && !disabled && (
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

      {/* Street Address with Autocomplete */}
      <Controller
        name={streetAddressName}
        control={control}
        render={({ field }) => (
          <AddressAutocomplete
            onAddressSelect={onAddressSelect || (() => {})}
            value={field.value as string}
            onChange={field.onChange}
            label="Street Address"
            required
            error={errors?.streetAddress?.message}
            id="streetAddress"
            testId="input-street-address"
            name={field.name}
          />
        )}
      />

      {/* Address Line 2 */}
      <div className="space-y-2">
        <Label htmlFor="addressLine2" className="text-base">
          Address Line 2
        </Label>
        <Controller
          name={addressLine2Name}
          control={control}
          render={({ field }) => (
            <Input
              id="addressLine2"
              placeholder="Suite, Building, Floor (optional)"
              disabled={disabled}
              className="h-12 text-base"
              {...field}
            />
          )}
        />
        {errors?.addressLine2 && (
          <p className="text-destructive text-sm">{errors.addressLine2.message}</p>
        )}
      </div>

      {/* City and State */}
      <div className={`grid ${gridClass} gap-4`}>
        <div className="space-y-2">
          <Label htmlFor="city" className="text-base">
            City <span className="text-destructive">*</span>
          </Label>
          <Controller
            name={cityName}
            control={control}
            render={({ field }) => (
              <Input
                id="city"
                placeholder="Mumbai"
                disabled={disabled}
                data-testid="input-city"
                className="h-12 text-base"
                {...field}
              />
            )}
          />
          {errors?.city && <p className="text-destructive text-sm">{errors.city.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state" className="text-base">
            State <span className="text-destructive">*</span>
          </Label>
          <Controller
            name={stateName}
            control={control}
            render={({ field }) => (
              <Input
                id="state"
                placeholder="Maharashtra"
                disabled={disabled}
                data-testid="input-state"
                className="h-12 text-base"
                {...field}
              />
            )}
          />
          {errors?.state && <p className="text-destructive text-sm">{errors.state.message}</p>}
        </div>
      </div>

      {/* Zip Code and Country */}
      <div className={`grid ${gridClass} gap-4`}>
        <div className="space-y-2">
          <Label htmlFor="zipCode" className="text-base">
            Zip Code <span className="text-destructive">*</span>
          </Label>
          <Controller
            name={zipCodeName}
            control={control}
            render={({ field }) => (
              <Input
                id="zipCode"
                placeholder="400001"
                disabled={disabled}
                data-testid="input-zip-code"
                className="h-12 text-base"
                {...field}
              />
            )}
          />
          {errors?.zipCode && <p className="text-destructive text-sm">{errors.zipCode.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="country" className="text-base">
            Country
          </Label>
          <Controller
            name={countryName}
            control={control}
            render={({ field }) => (
              <Input
                id="country"
                disabled={disabled}
                placeholder="India"
                className="h-12 text-base"
                {...field}
                value={(field.value as string) || "India"}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
}
