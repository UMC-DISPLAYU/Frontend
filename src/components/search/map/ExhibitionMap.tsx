import { useCallback, useEffect, useRef, useState } from 'react';

import { useMutation } from '@tanstack/react-query';
import { LocateFixed } from 'lucide-react';
import { CustomOverlayMap, Map, useKakaoLoader } from 'react-kakao-maps-sdk';

import type { NearbyDisplay, NearbyParams } from '@/hooks/useNearbyDisplays';
import { getAccurateUserLocation, getGeolocationErrorMessage } from '@/utils/geolocation';

import { ExhibitionMapMarker, ExhibitionMapSelectedOverlay } from './ExhibitionMapMarker';

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };
const DEFAULT_LEVEL = 6;
const IDLE_DEBOUNCE_MS = 250;

const MAP_STATE_KEY = 'SEARCH_MAP_VIEW_STATE';

const getSavedMapState = (): { center: { lat: number; lng: number }; level: number } | null => {
  try {
    const saved = sessionStorage.getItem(MAP_STATE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // Ignore storage parse errors
  }
  return null;
};

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
  const [initialMapState] = useState(getSavedMapState);

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
      const center = { lat: map.getCenter().getLat(), lng: map.getCenter().getLng() };
      const level = map.getLevel();

      try {
        sessionStorage.setItem(MAP_STATE_KEY, JSON.stringify({ center, level }));
      } catch {
        // Ignore storage errors
      }

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

  const lastPannedIdRef = useRef<number | null>(null);

  // 마커/카드가 클릭되어 selectedId가 '새롭게' 변경된 시점에 딱 1회만 이동
  // 이동 후 사용자가 지도를 자유롭게 드래그하거나 탐색할 때는 위치가 강제로 고정/재이동되지 않음
  useEffect(() => {
    if (!mapRef.current || !selectedId) {
      lastPannedIdRef.current = selectedId;
      return;
    }

    if (lastPannedIdRef.current !== selectedId) {
      lastPannedIdRef.current = selectedId;
      const target = exhibitions.find((ex) => ex.displayId === selectedId);
      if (target) {
        const latLng = new kakao.maps.LatLng(target.latitude, target.longitude);
        mapRef.current.setCenter(latLng);
        mapRef.current.panBy(0, -45);
      }
    }
  }, [selectedId, exhibitions]);

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
        center={initialMapState?.center ?? DEFAULT_CENTER}
        level={initialMapState?.level ?? DEFAULT_LEVEL}
        style={{ width: '100%', height: '100%' }}
        onClick={() => onSelect(null)}
        onIdle={handleIdle}
        onCreate={(map) => {
          mapRef.current = map;
          handleIdle(map);
        }}
      >
        {exhibitions.map((ex) => {
          const isSelected = ex.displayId === selectedId;
          return (
            <CustomOverlayMap
              key={ex.displayId}
              position={{ lat: ex.latitude, lng: ex.longitude }}
              yAnchor={isSelected ? 1.05 : 1}
              zIndex={isSelected ? 20 : 1}
              clickable={true}
            >
              {isSelected ? (
                <ExhibitionMapSelectedOverlay exhibition={ex} onClose={() => onSelect(null)} />
              ) : (
                <ExhibitionMapMarker title={ex.title} onClick={() => onSelect(ex.displayId)} />
              )}
            </CustomOverlayMap>
          );
        })}
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
