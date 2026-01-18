import { Loader2, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  loadGoogleMapsScript,
  initializeAutocompleteLegacy,
  AddressComponents,
} from "@/lib/google-places";

interface AddressAutocompleteProps {
  onAddressSelect: (address: AddressComponents) => void;
  onChange?: (value: string) => void;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
  id?: string;
  testId?: string;
  name?: string;
}

export function AddressAutocomplete({
  onAddressSelect,
  onChange,
  value,
  defaultValue = "",
  placeholder = "Start typing your address...",
  label = "Street Address",
  required = false,
  error,
  id = "address-autocomplete",
  testId = "address-autocomplete",
  name,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scriptError, setScriptError] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  
  // Conditional Google API usage: Only load in dev mode with API key to avoid production billing
  const isGoogleApiEnabled = import.meta.env.VITE_GOOGLE_API_KEY && import.meta.env.DEV;

  useEffect(() => {
    // Skip Google API initialization if disabled (falls back to manual input)
    if (!isGoogleApiEnabled) {
      setIsLoading(false);
      setScriptError(false);
      return;
    }

    let mounted = true;

    const initAutocomplete = async () => {
      try {
        await loadGoogleMapsScript();

        if (!mounted || !inputRef.current) return;

        // Use legacy API for now since it's still supported
        autocompleteRef.current = initializeAutocompleteLegacy(
          inputRef.current,
          (addressComponents) => {
            onAddressSelect(addressComponents);
            // Also trigger onChange with the street address
            if (onChange) {
              onChange(addressComponents.streetAddress);
            }
          }
        );

        setIsLoading(false);
        setScriptError(false); // Ensure error is cleared on success
      } catch (error) {
        console.error("Failed to load Google Maps:", error);
        if (mounted) {
          setScriptError(true);
          setIsLoading(false);
        }
      }
    };

    initAutocomplete();

    return () => {
      mounted = false;
      // Cleanup autocomplete listener
      if (autocompleteRef.current && window.google) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onAddressSelect, onChange, isGoogleApiEnabled]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="relative">
        <MapPin className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
        <Input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          placeholder={isLoading ? "Loading..." : placeholder}
          value={value}
          defaultValue={defaultValue}
          onChange={handleInputChange}
          disabled={isLoading}
          className="pl-9"
          data-testid={testId}
        />
        {isLoading && (
          <Loader2 className="text-muted-foreground absolute top-3 right-3 h-4 w-4 animate-spin" />
        )}
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
      {!isGoogleApiEnabled && (
        <p className="text-muted-foreground text-xs">
          Enter your complete address manually
        </p>
      )}
      {scriptError && (
        <p className="text-destructive text-sm">
          Failed to load address autocomplete. Please enter address manually.
        </p>
      )}
      {isGoogleApiEnabled && !isLoading && !scriptError && (
        <p className="text-muted-foreground text-xs">
          Start typing and select from the suggestions
        </p>
      )}
    </div>
  );
}
