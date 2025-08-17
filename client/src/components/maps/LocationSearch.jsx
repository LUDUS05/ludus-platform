/* global google */
import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Search, MapPin, X } from 'lucide-react';

const LocationSearch = ({ 
  onPlaceSelect, 
  placeholder = "Search for a location...",
  className = "",
  initialValue = "",
  onClear
}) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [inputValue, setInputValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAutocomplete = async () => {
      if (!process.env.REACT_APP_GOOGLE_MAPS_API_KEY) {
        setError('Google Maps API key is not configured.');
        return;
      }

      try {
        setIsLoading(true);
        const loader = new Loader({
          apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
          version: 'weekly',
          libraries: ['places']
        });

        await loader.load();

        // Initialize Places Autocomplete
        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: 'sa' }, // Restrict to Saudi Arabia
          fields: ['place_id', 'geometry', 'name', 'formatted_address', 'address_components'],
          types: ['establishment', 'geocode']
        });

        // Add place selection listener
        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace();
          
          if (place.geometry && place.geometry.location) {
            const location = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
              address: place.formatted_address,
              name: place.name,
              placeId: place.place_id,
              addressComponents: place.address_components
            };

            // Extract city and region from address components
            place.address_components?.forEach(component => {
              if (component.types.includes('locality')) {
                location.city = component.long_name;
              }
              if (component.types.includes('administrative_area_level_1')) {
                location.region = component.long_name;
              }
            });

            setInputValue(place.formatted_address || place.name);
            onPlaceSelect?.(location);
          }
        });

        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing Places Autocomplete:', err);
        setError('Failed to load location search. Please try again.');
        setIsLoading(false);
      }
    };

    initAutocomplete();

    // Cleanup
    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onPlaceSelect]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleClear = () => {
    setInputValue('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
    onClear?.();
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            // Reverse geocode to get address
            const loader = new Loader({
              apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
              version: 'weekly',
              libraries: ['geocoding']
            });

            await loader.load();
            
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode(
              { location: { lat: latitude, lng: longitude } },
              (results, status) => {
                setIsLoading(false);
                if (status === 'OK' && results[0]) {
                  const location = {
                    lat: latitude,
                    lng: longitude,
                    address: results[0].formatted_address,
                    name: 'Current Location',
                    placeId: results[0].place_id,
                    isCurrentLocation: true
                  };

                  setInputValue(results[0].formatted_address);
                  onPlaceSelect?.(location);
                } else {
                  setError('Unable to determine your current address.');
                }
              }
            );
          } catch (err) {
            setIsLoading(false);
            setError('Failed to get current location address.');
          }
        },
        (error) => {
          setIsLoading(false);
          console.error('Geolocation error:', error);
          setError('Unable to access your location. Please check your browser settings.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  if (error) {
    return (
      <div className={`${className} relative`}>
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <Search className="w-5 h-5 text-red-400" />
          <span className="text-sm text-red-600">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} relative`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-ludus-orange"></div>
          ) : (
            <Search className="w-5 h-5 text-gray-400" />
          )}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ludus-orange focus:border-transparent transition-all duration-200"
          disabled={isLoading}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
          {inputValue && (
            <button
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={handleCurrentLocation}
            className="p-1 text-ludus-orange hover:text-ludus-orange-dark transition-colors"
            title="Use current location"
            disabled={isLoading}
          >
            <MapPin className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="mt-2 text-xs text-gray-500">
        Search for places in Saudi Arabia or click the pin icon to use your current location
      </div>
    </div>
  );
};

export default LocationSearch;