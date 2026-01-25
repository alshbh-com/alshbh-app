import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
  error: string | null;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    loading: false,
    error: null,
  });

  const getLocation = useCallback((): Promise<{ latitude: number; longitude: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setState((prev) => ({ ...prev, error: 'المتصفح لا يدعم تحديد الموقع' }));
        resolve(null);
        return;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setState({
            latitude,
            longitude,
            loading: false,
            error: null,
          });
          resolve({ latitude, longitude });
        },
        (error) => {
          let errorMessage = 'حدث خطأ في تحديد الموقع';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'تم رفض إذن الموقع';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'معلومات الموقع غير متاحة';
              break;
            case error.TIMEOUT:
              errorMessage = 'انتهت مهلة طلب الموقع';
              break;
          }
          
          setState({
            latitude: null,
            longitude: null,
            loading: false,
            error: errorMessage,
          });
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }, []);

  const requestLocation = useCallback(async () => {
    const location = await getLocation();
    if (location) {
      toast.success('تم تحديد موقعك بنجاح');
    }
    return location;
  }, [getLocation]);

  return {
    ...state,
    getLocation,
    requestLocation,
  };
};
