import { useEffect, useRef, useState } from 'react';

import { CustomOverlayMap, Map } from 'react-kakao-maps-sdk';

import type { LatLng, MapExhibitionStatus } from './mapExhibition';
import { MapPin, type MapPinDetail, MyLocationMarker } from './MapPin';
import { useMapTap } from './useMapTap';

export interface MapCanvasPin {
  id: number;
  title: string;
  posterImageUrl: string;
  position: LatLng;
  status: MapExhibitionStatus;
  statusLabel: string;
}

// 카카오 레벨은 숫자가 클수록 넓게 보인다. 멀리서는 점, 가까이서는 포스터와 제목을 보여준다
const DOT_FROM_LEVEL = 8;
const LABEL_UNTIL_LEVEL = 4;

const getPinDetail = (level: number): MapPinDetail => {
  if (level >= DOT_FROM_LEVEL) return 'dot';
  if (level <= LABEL_UNTIL_LEVEL) return 'label';
  return 'poster';
};

interface MapCanvasProps {
  isSdkLoading: boolean;
  hasSdkError: boolean;
  initialCenter: LatLng;
  initialLevel: number;
  level: number;
  pins: MapCanvasPin[];
  selectedId: number | null;
  myLocation: LatLng | null;
  onCreate: (map: kakao.maps.Map) => void;
  onIdle: (map: kakao.maps.Map) => void;
  onLevelChange: (level: number) => void;
  onSelectPin: (id: number) => void;
  onMapTap: () => void;
}

export function MapCanvas({
  isSdkLoading,
  hasSdkError,
  initialCenter,
  initialLevel,
  level,
  pins,
  selectedId,
  myLocation,
  onCreate,
  onIdle,
  onLevelChange,
  onSelectPin,
  onMapTap,
}: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<kakao.maps.Map | null>(null);
  const detail = getPinDetail(level);
  useMapTap(containerRef, onMapTap);

  useEffect(() => {
    if (!map) return;
    const handleResize = () => map.relayout();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [map]);

  const placeholder = hasSdkError
    ? '지도를 불러오지 못했어요'
    : isSdkLoading
      ? '지도를 불러오는 중...'
      : null;

  // 지도를 불러오지 못한 화면도 같은 자리에서 탭을 받도록 바깥 요소는 항상 그린다
  return (
    <div
      ref={containerRef}
      role={placeholder ? undefined : 'application'}
      aria-label={placeholder ? undefined : '전시 지도'}
      className="fixed inset-0 touch-none overscroll-none select-none"
    >
      {placeholder ? (
        <div className="grid size-full place-items-center bg-secondary">
          <p className="typography-body-lg-medium text-tertiary">{placeholder}</p>
        </div>
      ) : (
        <Map
          center={initialCenter}
          level={initialLevel}
          style={{ width: '100%', height: '100%' }}
          onCreate={(created) => {
            if (created === map) return;
            setMap(created);
            onCreate(created);
            onIdle(created);
          }}
          onIdle={onIdle}
          onZoomChanged={(target) => onLevelChange(target.getLevel())}
        >
          {pins.map((pin) => {
            const selected = pin.id === selectedId;
            return (
              <CustomOverlayMap
                key={pin.id}
                position={pin.position}
                xAnchor={0}
                yAnchor={0}
                // 남쪽 핀이 북쪽 핀 위에 오도록 위도가 낮을수록 위에 쌓는다
                zIndex={selected ? 100_000 : Math.round((90 - pin.position.lat) * 1000)}
                clickable
              >
                <MapPin
                  title={pin.title}
                  posterImageUrl={pin.posterImageUrl}
                  status={pin.status}
                  statusLabel={pin.statusLabel}
                  detail={detail}
                  selected={selected}
                  onSelect={() => onSelectPin(pin.id)}
                />
              </CustomOverlayMap>
            );
          })}
          {myLocation ? (
            <CustomOverlayMap position={myLocation} xAnchor={0} yAnchor={0} zIndex={1}>
              <MyLocationMarker />
            </CustomOverlayMap>
          ) : null}
        </Map>
      )}
    </div>
  );
}
