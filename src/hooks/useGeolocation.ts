import { useCallback, useRef, useState } from 'react';
import { GeoCoords } from '../types';

interface GeolocationState {
  coords: GeoCoords | null;
  error: string | null;
  isLoading: boolean;
  isSupported: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    error: null,
    isLoading: false,
    isSupported: typeof navigator !== 'undefined' && !!navigator.geolocation,
  });
  const watchIdRef = useRef<number | null>(null);

  const requestLocation = useCallback((): Promise<GeoCoords | null> => {
    return new Promise((resolve) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        setState((prev) => ({ ...prev, error: 'Geolocation is not supported on this device.', isSupported: false }));
        resolve(null);
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: GeoCoords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setState({ coords, error: null, isLoading: false, isSupported: true });
          resolve(coords);
        },
        (err) => {
          let message = 'Unable to fetch live location.';
          if (err.code === err.PERMISSION_DENIED) {
            message = 'Location permission denied. Using registered campus address instead.';
          } else if (err.code === err.TIMEOUT) {
            message = 'Location request timed out. Using registered campus address instead.';
          }
          setState((prev) => ({ ...prev, error: message, isLoading: false }));
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 15000,
        }
      );
    });
  }, []);

  const clear = useCallback(() => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setState((prev) => ({ ...prev, coords: null, error: null }));
  }, []);

  return {
    ...state,
    requestLocation,
    clear,
  };
}
