import { useEffect, useState } from 'react';

import { useMutation } from '@tanstack/react-query';

import { getAccurateUserLocation, getGeolocationErrorMessage } from '@/utils/geolocation';

import type { LatLng } from './mapExhibition';

type LocationPermission = 'granted' | 'denied' | 'prompt' | 'unknown';

const isPermissionDenied = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'code' in error &&
  (error as GeolocationPositionError).code === 1;

const toLatLng = (position: GeolocationPosition): LatLng => ({
  lat: position.coords.latitude,
  lng: position.coords.longitude,
});

interface UseMyLocationOptions {
  onLocated: (location: LatLng) => void;
  onError: (message: string) => void;
}

/**
 * 권한이 이미 허용돼 있으면 조용히 위치를 받아 거리 표시에 쓰고,
 * 내 위치 버튼을 눌렀을 때만 지도를 옮긴다(onLocated).
 */
export function useMyLocation({ onLocated, onError }: UseMyLocationOptions) {
  const [permission, setPermission] = useState<LocationPermission>('unknown');
  const [location, setLocation] = useState<LatLng | null>(null);
  const [isShown, setIsShown] = useState(false);

  const silent = useMutation({
    mutationFn: getAccurateUserLocation,
    onSuccess: (position) => setLocation(toLatLng(position)),
  });
  const { mutate: locateSilently } = silent;

  const locate = useMutation({
    mutationFn: getAccurateUserLocation,
    onSuccess: (position) => {
      const next = toLatLng(position);
      setLocation(next);
      setIsShown(true);
      setPermission('granted');
      onLocated(next);
    },
    onError: (error) => {
      if (isPermissionDenied(error)) {
        setPermission('denied');
        return;
      }
      onError(getGeolocationErrorMessage(error));
    },
  });

  useEffect(() => {
    let status: PermissionStatus | null = null;
    let cancelled = false;

    const apply = () => {
      if (!status || cancelled) return;
      setPermission(status.state);
      if (status.state === 'granted') locateSilently();
    };

    // 권한 API가 없는 브라우저는 버튼을 눌렀을 때 결과로 판단한다
    navigator.permissions
      ?.query({ name: 'geolocation' })
      .then((result) => {
        if (cancelled) return;
        status = result;
        apply();
        status.addEventListener('change', apply);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      status?.removeEventListener('change', apply);
    };
  }, [locateSilently]);

  return {
    location,
    isShown,
    isDenied: permission === 'denied',
    isLocating: locate.isPending,
    locate: () => locate.mutate(),
  };
}
