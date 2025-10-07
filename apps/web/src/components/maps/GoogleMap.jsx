/* global google */
import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const GoogleMap = ({ 
  activities = [], 
  center = { lat: 24.7136, lng: 46.6753 }, // Riyadh, Saudi Arabia
  zoom = 11,
  onActivitySelect,
  selectedActivityId,
  className = '',
  height = '400px'
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef(new Map());
  const infoWindowRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
          version: 'weekly',
          libraries: ['places', 'geometry']
        });

        const { Map } = await loader.importLibrary('maps');
        const { AdvancedMarkerElement, PinElement } = await loader.importLibrary('marker');

        // Initialize map
        const map = new Map(mapRef.current, {
          center,
          zoom,
          mapId: 'ludus-activity-map', // Required for Advanced Markers
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            },
            {
              featureType: 'transit',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        mapInstanceRef.current = map;

        // Initialize InfoWindow
        const { InfoWindow } = await loader.importLibrary('maps');
        infoWindowRef.current = new InfoWindow();

        setIsLoading(false);
      } catch (err) {
        console.error('Error loading Google Maps:', err);
        setError('Failed to load map. Please check your internet connection.');
        setIsLoading(false);
      }
    };

    if (process.env.REACT_APP_GOOGLE_MAPS_API_KEY) {
      initMap();
    } else {
      setError('Google Maps API key is not configured.');
      setIsLoading(false);
    }
  }, [center, zoom]);

  useEffect(() => {
    if (!mapInstanceRef.current || isLoading) return;

    const updateMarkers = async () => {
      try {
        const { AdvancedMarkerElement, PinElement } = await new Loader({
          apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
          version: 'weekly'
        }).importLibrary('marker');

        // Clear existing markers
        markersRef.current.forEach(marker => {
          marker.map = null;
        });
        markersRef.current.clear();

        // Add new markers for activities
        activities.forEach(activity => {
          if (!activity.location?.coordinates && !activity.vendor?.location?.coordinates) return;

          // Try to get coordinates from activity or vendor
          let lat, lng;
          if (activity.location?.coordinates) {
            [lng, lat] = activity.location.coordinates;
          } else if (activity.vendor?.location?.coordinates) {
            [lng, lat] = activity.vendor.location.coordinates;
          } else {
            return; // Skip if no coordinates
          }
          
          // Create custom pin with category color
          const pinColor = getCategoryColor(activity.category);
          const pinElement = new PinElement({
            background: pinColor,
            borderColor: '#FFFFFF',
            glyphColor: '#FFFFFF',
            scale: selectedActivityId === activity._id ? 1.2 : 1.0
          });

          // Create marker
          const marker = new AdvancedMarkerElement({
            position: { lat, lng },
            map: mapInstanceRef.current,
            content: pinElement.element,
            title: activity.title
          });

          // Add click listener
          marker.addListener('click', () => {
            // Show info window
            const infoContent = createInfoWindowContent(activity);
            infoWindowRef.current.setContent(infoContent);
            infoWindowRef.current.open(mapInstanceRef.current, marker);

            // Notify parent component
            onActivitySelect?.(activity);
          });

          markersRef.current.set(activity._id, marker);
        });

        // Fit map to show all markers if activities exist
        if (activities.length > 0) {
          const bounds = new google.maps.LatLngBounds();
          activities.forEach(activity => {
            let lat, lng;
            if (activity.location?.coordinates) {
              [lng, lat] = activity.location.coordinates;
              bounds.extend({ lat, lng });
            } else if (activity.vendor?.location?.coordinates) {
              [lng, lat] = activity.vendor.location.coordinates;
              bounds.extend({ lat, lng });
            }
          });
          mapInstanceRef.current.fitBounds(bounds);
        }

      } catch (err) {
        console.error('Error updating markers:', err);
      }
    };

    updateMarkers();
  }, [activities, selectedActivityId, onActivitySelect, isLoading]);

  const getCategoryColor = (category) => {
    const colors = {
      'fitness': '#10B981', // Green
      'arts': '#8B5CF6',    // Purple
      'food': '#F59E0B',    // Amber
      'outdoor': '#059669', // Emerald
      'unique': '#EF4444',  // Red
      'wellness': '#06B6D4', // Cyan
      'sports': '#3B82F6',  // Blue
      'education': '#7C3AED', // Violet
      'entertainment': '#EC4899', // Pink
      'default': '#FF6B35'  // LUDUS Orange
    };
    return colors[category] || colors.default;
  };

  const createInfoWindowContent = (activity) => {
    return `
      <div class="p-3 max-w-xs">
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h6a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2v-8a2 2 0 012-2z"></path>
              </svg>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-medium text-gray-900 truncate">${activity.title}</h3>
            <p class="text-sm text-gray-500 mt-1">${activity.vendor?.businessName || 'Partner'}</p>
            <div class="flex items-center space-x-2 mt-2">
              <div class="flex items-center text-xs text-gray-500">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                ${activity.vendor?.address?.city || 'Location'}
              </div>
              <div class="flex items-center text-xs text-gray-500">
                <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                ${activity.duration || 'Duration varies'}
              </div>
            </div>
            <div class="flex items-center justify-between mt-3">
              <span class="text-sm font-semibold text-orange-500">
                ${activity.price?.toLocaleString() || 'Price varies'} SAR
              </span>
              <button 
                onclick="window.location.href='/activities/${activity._id}'"
                class="bg-orange-500 text-white px-3 py-1 rounded text-xs font-medium hover:bg-orange-600 transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current && activities.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      activities.forEach(activity => {
        let lat, lng;
        if (activity.location?.coordinates) {
          [lng, lat] = activity.location.coordinates;
          bounds.extend({ lat, lng });
        } else if (activity.vendor?.location?.coordinates) {
          [lng, lat] = activity.vendor.location.coordinates;
          bounds.extend({ lat, lng });
        }
      });
      mapInstanceRef.current.fitBounds(bounds);
    }
  };

  const handleUserLocation = () => {
    if (navigator.geolocation && mapInstanceRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          mapInstanceRef.current.setCenter(userLocation);
          mapInstanceRef.current.setZoom(13);
        },
        (error) => {
          console.error('Error getting user location:', error);
          alert('Unable to get your location. Please enable location services.');
        }
      );
    }
  };

  if (error) {
    return (
      <div 
        className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}
        style={{ height }}
      >
        <div className="text-center p-6">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 48 48">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ludus-orange mx-auto mb-4"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      {/* Map Controls */}
      {!isLoading && (
        <div className="absolute top-4 right-4 space-y-2">
          <button
            onClick={handleRecenter}
            className="bg-white shadow-md rounded-lg p-2 hover:bg-gray-50 transition-colors"
            title="Show all activities"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
          
          <button
            onClick={handleUserLocation}
            className="bg-white shadow-md rounded-lg p-2 hover:bg-gray-50 transition-colors"
            title="Go to my location"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      )}

      {/* Activity Count Badge */}
      {!isLoading && activities.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white shadow-md rounded-lg px-3 py-2">
          <span className="text-sm font-medium text-gray-700">
            {activities.length} activit{activities.length !== 1 ? 'ies' : 'y'} found
          </span>
        </div>
      )}
    </div>
  );
};

export default GoogleMap;