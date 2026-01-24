/**
 * Google Places API Integration
 * Provides address autocomplete functionality using the new PlaceAutocompleteElement
  */
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || "";
const GOOGLE_MAPS_SCRIPT_ID = "google-maps-script";
const GOOGLE_API_ENABLED = !!GOOGLE_API_KEY && import.meta.env.DEV;

export interface AddressComponents {
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude: string;
  longitude: string;
  formattedAddress: string;
}

/**
 * Load Google Maps API script dynamically
 * Returns promise to support async/await pattern, handles duplicate load attempts
 */
export function loadGoogleMapsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Environment gate: Only load in dev with valid API key to avoid production billing
    if (!GOOGLE_API_ENABLED) {
      reject(new Error("Google Places API is disabled for this environment"));
      return;
    }

    // Check if script is already loaded
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", () =>
        reject(new Error("Failed to load Google Maps script"))
      );
      return;
    }

    // Load the script with places library
    const script = document.createElement("script");
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places&loading=async`;
    script.async = true;
    script.defer = true;

    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => reject(new Error("Failed to load Google Maps script")));

    document.head.appendChild(script);
  });
}

/**
 * Parse Google Place result into address components
 * Maps Places API response structure to simplified AddressComponents interface
 */
export function parseAddressComponents(place: google.maps.places.PlaceResult): AddressComponents {
  const components: AddressComponents = {
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    latitude: "",
    longitude: "",
    formattedAddress: place.formatted_address || "",
  };

  if (!place.address_components) {
    return components;
  }

  let streetNumber = "";
  let route = "";

  place.address_components.forEach((component) => {
    const types = component.types;

    if (types.includes("street_number")) {
      streetNumber = component.long_name;
    }
    if (types.includes("route")) {
      route = component.long_name;
    }
    if (types.includes("locality")) {
      components.city = component.long_name;
    }
    if (types.includes("administrative_area_level_1")) {
      components.state = component.long_name;
    }
    if (types.includes("postal_code")) {
      components.zipCode = component.long_name;
    }
    if (types.includes("country")) {
      components.country = component.short_name;
    }
  });

  // Combine street number and route for street address
  components.streetAddress = [streetNumber, route].filter(Boolean).join(" ");

  // Get latitude and longitude
  if (place.geometry && place.geometry.location) {
    components.latitude = place.geometry.location.lat().toString();
    components.longitude = place.geometry.location.lng().toString();
  }

  return components;
}

/**
 * Initialize Google Places Autocomplete on an input element using the legacy API
 * Note: This uses the older Autocomplete API as fallback
 */
export function initializeAutocompleteLegacy(
  inputElement: HTMLInputElement,
  onPlaceSelected: (addressComponents: AddressComponents) => void,
  options?: google.maps.places.AutocompleteOptions
): google.maps.places.Autocomplete {
  const defaultOptions: google.maps.places.AutocompleteOptions = {
    componentRestrictions: { country: "in" }, // Restrict to India
    fields: ["address_components", "formatted_address", "geometry", "name"],
    types: ["address"],
    ...options,
  };

  const autocomplete = new google.maps.places.Autocomplete(inputElement, defaultOptions);

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();

    if (!place.geometry) {
      console.error(`No details available for input: '${  place.name  }'`);
      return;
    }

    const addressComponents = parseAddressComponents(place);
    onPlaceSelected(addressComponents);
  });

  return autocomplete;
}

// Type declarations for Google Maps
declare global {
  interface Window {
    google?: typeof google;
  }
}
