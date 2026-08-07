import { useCallback, useEffect, useRef } from 'react';

import { useMutation } from '@tanstack/react-query';
import { LocateFixed } from 'lucide-react';
import { CustomOverlayMap, Map, useKakaoLoader } from 'react-kakao-maps-sdk';

import type { NearbyDisplay, NearbyParams } from '@/hooks/useNearbyDisplays';
import { getAccurateUserLocation, getGeolocationErrorMessage } from '@/utils/geolocation';

import { ExhibitionMapMarker } from './ExhibitionMapMarker';

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };
const DEFAULT_LEVEL = 6;
const IDLE_DEBOUNCE_MS = 250;

interface ExhibitionMapProps {
  exhibitions: NearbyDisplay[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  onBoundsChange: (params: NearbyParams) => void;
}

export function ExhibitionMap({
  exhibitions,
  selectedId,
  onSelect,
  onBoundsChange,
}: ExhibitionMapProps) {
  const appkey = import.meta.env.VITE_KAKAO_MAP_KEY;

  const [loading, error] = useKakaoLoader({
    appkey,
    libraries: ['services'],
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const mapRef = useRef<kakao.maps.Map | null>(null);

  const { mutate: moveToMyLocation, isPending: isLocating } = useMutation({
    mutationFn: getAccurateUserLocation,
    onSuccess: (position) => {
      if (!mapRef.current) return;
      const { latitude, longitude } = position.coords;
      mapRef.current.setCenter(new kakao.maps.LatLng(latitude, longitude));
      mapRef.current.setLevel(5);
    },
    onError: (error) => {
      alert(getGeolocationErrorMessage(error));
    },
  });

  const handleIdle = useCallback(
    (map: kakao.maps.Map) => {
      const bounds = map.getBounds();
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();

      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onBoundsChange({
          southLatitude: sw.getLat(),
          westLongitude: sw.getLng(),
          northLatitude: ne.getLat(),
          eastLongitude: ne.getLng(),
        });
      }, IDLE_DEBOUNCE_MS);
    },
    [onBoundsChange],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  if (error) {
    return (
      <div className="flex size-full items-center justify-center bg-box100">
        <p className="typo-body-sm-regular text-faint">지도를 불러오지 못했습니다</p>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="flex size-full items-center justify-center bg-box100">
        <p className="typo-body-sm-regular text-faint">지도를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="relative size-full">
      <Map
        center={DEFAULT_CENTER}
        level={DEFAULT_LEVEL}
        style={{ width: '100%', height: '100%' }}
        onClick={() => onSelect(null)}
        onIdle={handleIdle}
        onCreate={(map) => {
          mapRef.current = map;
          handleIdle(map);
        }}
      >
        {exhibitions.map((ex) => (
          <CustomOverlayMap
            key={ex.displayId}
            position={{ lat: ex.latitude, lng: ex.longitude }}
            yAnchor={1}
            zIndex={ex.displayId === selectedId ? 10 : 1}
          >
            <ExhibitionMapMarker
              title={ex.title}
              selected={ex.displayId === selectedId}
              onClick={() => onSelect(ex.displayId)}
            />
          </CustomOverlayMap>
        ))}
      </Map>

      <button
        type="button"
        onClick={() => moveToMyLocation()}
        disabled={isLocating}
        aria-label="내 위치로 이동"
        className="absolute bottom-4 right-4 z-10 flex size-12 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
      >
        <LocateFixed className={`size-6 text-sub700 ${isLocating ? 'animate-pulse' : ''}`} />
      </button>
    </div>
  );
}
