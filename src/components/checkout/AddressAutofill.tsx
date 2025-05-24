'use client';

import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

interface AddressAutofillProps {
  onAddressSelected: (address: AddressData) => void;
  defaultValue?: string;
  className?: string;
  placeholder?: string;
  required?: boolean;
  label?: string;
  id?: string;
}

export interface AddressData {
  address: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

declare global {
  interface Window {
    google: any;
  }
}

const AddressAutofill: React.FC<AddressAutofillProps> = ({
  onAddressSelected,
  defaultValue = '',
  className = '',
  placeholder = 'Enter your address',
  required = false,
  label = 'Address',
  id = 'address-autofill'
}) => {
  const [inputValue, setInputValue] = useState(defaultValue);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoadingScript, setIsLoadingScript] = useState(false);
  const autocompleteRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load Google Maps API script
  useEffect(() => {
    if (window.google?.maps?.places) {
      setIsLoaded(true);
      return;
    }

    if (isLoadingScript) return;

    const loadGoogleMapsScript = () => {
      setIsLoadingScript(true);
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        console.error('Google Maps API key is missing');
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsLoaded(true);
        setIsLoadingScript(false);
      };
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
        setIsLoadingScript(false);
      };
      document.head.appendChild(script);
    };

    loadGoogleMapsScript();
  }, [isLoadingScript]);

  // Initialize autocomplete when Google Maps API is loaded
  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    try {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        fields: ['address_components', 'formatted_address'],
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        
        if (!place.address_components) {
          toast.error('Please select an address from the dropdown');
          return;
        }

        // Parse address components
        const addressData: AddressData = {
          address: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'US',
        };

        // Extract address components
        for (const component of place.address_components) {
          const type = component.types[0];
          
          if (type === 'street_number') {
            addressData.address = component.long_name;
          } else if (type === 'route') {
            addressData.address += (addressData.address ? ' ' : '') + component.long_name;
          } else if (type === 'locality') {
            addressData.city = component.long_name;
          } else if (type === 'administrative_area_level_1') {
            addressData.state = component.short_name;
          } else if (type === 'postal_code') {
            addressData.postalCode = component.long_name;
          } else if (type === 'country') {
            addressData.country = component.short_name;
          }
        }

        // If we couldn't parse the address properly, use the formatted address
        if (!addressData.address && place.formatted_address) {
          const parts = place.formatted_address.split(',');
          if (parts.length > 0) {
            addressData.address = parts[0].trim();
          }
        }

        setInputValue(place.formatted_address || addressData.address);
        onAddressSelected(addressData);
      });
    } catch (error) {
      console.error('Error initializing Google Maps Autocomplete:', error);
    }

    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoaded, onAddressSelected]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="tw-mb-4">
      {label && (
        <label htmlFor={id} className="tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-1">
          {label} {required && <span className="tw-text-red-500">*</span>}
        </label>
      )}
      <input
        ref={inputRef}
        type="text"
        id={id}
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={`tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-shadow-sm focus:tw-outline-none focus:tw-ring-blue-500 focus:tw-border-blue-500 ${className}`}
        required={required}
        autoComplete="off"
      />
      {!isLoaded && (
        <p className="tw-text-xs tw-text-gray-500 tw-mt-1">
          Loading address autocomplete...
        </p>
      )}
    </div>
  );
};

export default AddressAutofill;
