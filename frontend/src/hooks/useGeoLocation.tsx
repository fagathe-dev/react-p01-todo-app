import { EntryLocation } from '@/types/journal.types';
import { useCallback, useState } from 'react';

export type GeolocationStatus = 'idle' | 'loading' | 'success' | 'error';

export const useGeolocation = (initialLocation?: EntryLocation | null) => {
  const [status, setStatus] = useState<GeolocationStatus>(initialLocation ? 'success' : 'idle');
  const [location, setLocation] = useState<EntryLocation | null>(initialLocation ?? null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMessage('Géolocalisation non supportée');
      return;
    }

    setStatus('loading');
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            {
              headers: {
                'Accept-Language': 'fr',
                'User-Agent': 'PersonalLifeOS/1.0',
              },
            }
          );
          const data = await res.json();

          const street = [data.address?.house_number, data.address?.road].filter(Boolean).join(' ') || null;
          const city = data.address?.city ?? data.address?.town ?? data.address?.village ?? null;
          const country = data.address?.country ?? null;
          const shortLabel = [city, country].filter(Boolean).join(', ');
          const name = shortLabel || data.display_name || `${latitude}, ${longitude}`;

          const locationObj: EntryLocation = {
            name,
            latitude,
            longitude,
            street,
            city,
            country,
          };

          setLocation(locationObj);
          setStatus('success');
        } catch {
          // Si Nominatim échoue, on conserve quand même les coordonnées GPS
          const fallbackLocation: EntryLocation = {
            name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            latitude,
            longitude,
            street: null,
            city: null,
            country: null,
          };
          setLocation(fallbackLocation);
          setStatus('success');
        }
      },
      (err) => {
        const messages: Record<number, string> = {
          1: 'Localisation refusée',
          2: 'Position indisponible',
          3: 'La requête a expiré',
        };
        setStatus('error');
        setErrorMessage(messages[err.code] ?? 'Erreur');
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setStatus('idle');
    setErrorMessage(null);
  }, []);

  return {
    status,
    location,
    errorMessage,
    requestLocation,
    clearLocation,
  };
};
