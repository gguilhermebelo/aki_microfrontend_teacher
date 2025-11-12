import { useEffect, useState } from 'react';

interface GeoPosition {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
  refresh: () => void;
}

export function useGeolocation(options?: PositionOptions): GeoPosition {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setError('Geolocalização não suportada neste navegador');
      setLoading(false);
      return;
    }
    setLoading(true);
    const watch = navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setAccuracy(pos.coords.accuracy);
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Falha ao obter localização');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0, ...(options || {}) }
    );
    return () => {
      // getCurrentPosition não retorna watchId para clear; se usar watchPosition mudar aqui
    };
  }, [trigger]);

  return {
    latitude,
    longitude,
    accuracy,
    error,
    loading,
    refresh: () => setTrigger((x) => x + 1),
  };
}
