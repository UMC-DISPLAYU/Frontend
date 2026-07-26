import { useCallback, useEffect, useRef, useState } from 'react';

import { LocateFixed } from 'lucide-react';
import { CustomOverlayMap, Map, useKakaoLoader } from 'react-kakao-maps-sdk';

import {
  getDistanceMeters,
  type NearbyDisplay,
  type NearbyParams,
} from '../../hooks/useNearbyDisplays';

// 서울시청. 실제로는 사용자 위치나 마지막 위치로 대체 가능.
const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };
const DEFAULT_LEVEL = 6;
const IDLE_DEBOUNCE_MS = 250;

interface ExhibitionMapProps {
  exhibitions: NearbyDisplay[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  /** 지도가 멈출 때마다 중심 좌표 + 반경(m)을 상위로 올려보낸다. */
  onBoundsChange: (params: NearbyParams) => void;
}

export function ExhibitionMap({
  exhibitions,
  selectedId,
  onSelect,
  onBoundsChange,
}: ExhibitionMapProps) {
  const appkey = import.meta.env.VITE_KAKAO_MAP_KEY;

  // 디버깅: 환경변수 확인
  if (!appkey) {
    console.error('VITE_KAKAO_MAP_KEY is not defined');
  } else {
    console.log('Kakao Map Key loaded:', appkey.substring(0, 8) + '...');
  }

  const [loading, error] = useKakaoLoader({
    appkey,
    libraries: ['services'],
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bestAccuracyRef = useRef<number>(Infinity);
  const attemptsRef = useRef<number>(0);
  const hasStoppedRef = useRef<boolean>(false);
  const [isLocating, setIsLocating] = useState(false);

  const handleLocateUser = useCallback(() => {
    if (!navigator.geolocation) {
      alert('위치 서비스를 지원하지 않는 브라우저입니다.');
      return;
    }

    // 이미 실행 중이면 무시
    if (watchIdRef.current !== null) {
      return;
    }

    // 상태 초기화
    setIsLocating(true);
    bestAccuracyRef.current = Infinity;
    attemptsRef.current = 0;
    hasStoppedRef.current = false;

    const maxAttempts = 3;

    const stopLocating = () => {
      // 이미 정리되었으면 중복 실행 방지
      if (hasStoppedRef.current) {
        return;
      }
      hasStoppedRef.current = true;

      // watchPosition 정리
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      // timeout 정리
      if (timeoutIdRef.current !== null) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }

      setIsLocating(false);
      console.log('위치 추적 종료');
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        if (hasStoppedRef.current) return;

        const { latitude, longitude, accuracy } = position.coords;
        attemptsRef.current++;

        console.log(
          `위치 시도 ${attemptsRef.current}: 정확도 ${Math.round(accuracy)}m, 좌표 (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`,
        );

        // 첫 번째 위치는 무조건 사용 (사용자가 바로 피드백을 받도록)
        const shouldUsePosition =
          attemptsRef.current === 1 ||
          accuracy < bestAccuracyRef.current ||
          accuracy < 100;

        if (shouldUsePosition) {
          bestAccuracyRef.current = Math.min(bestAccuracyRef.current, accuracy);

          if (mapRef.current) {
            const moveLatLon = new kakao.maps.LatLng(latitude, longitude);
            mapRef.current.setCenter(moveLatLon);
            mapRef.current.setLevel(5);
            console.log('지도 이동 완료');
          } else {
            console.error('mapRef.current가 null입니다');
          }
        }

        // 종료 조건: 충분히 정확하거나 최대 시도 횟수 도달
        if (accuracy < 100 || attemptsRef.current >= maxAttempts) {
          console.log(
            `최종 위치: 정확도 ${Math.round(accuracy)}m (${attemptsRef.current}번 시도)`,
          );
          stopLocating();
        }
      },
      (error) => {
        console.error('위치 가져오기 실패:', error);
        let message = '위치를 가져올 수 없습니다.';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = '위치 정보를 사용할 수 없습니다.';
            break;
          case error.TIMEOUT:
            message = '위치 요청 시간이 초과되었습니다. WiFi나 GPS가 켜져있는지 확인해주세요.';
            break;
        }

        alert(message);
        stopLocating();
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    );

    // 타임아웃: 5초 후 무조건 종료
    timeoutIdRef.current = setTimeout(() => {
      console.log('타임아웃으로 위치 추적 종료');
      stopLocating();
    }, 5000);
  }, []); // 의존성 배열 비움 - ref만 사용하므로 안전

  const handleIdle = useCallback(
    (map: kakao.maps.Map) => {
      const center = map.getCenter();
      const bounds = map.getBounds();
      const ne = bounds.getNorthEast();
      // 화면에 보이는 영역 = 중심에서 북동쪽 모서리까지 거리를 반경으로.
      // 줌 레벨에 따라 반경이 자동으로 커지고 작아진다.
      const radius = getDistanceMeters(
        center.getLat(),
        center.getLng(),
        ne.getLat(),
        ne.getLng(),
      );

      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onBoundsChange({
          lat: center.getLat(),
          lng: center.getLng(),
          radius,
        });
      }, IDLE_DEBOUNCE_MS);
    },
    [onBoundsChange],
  );

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      // watchPosition 정리
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      // timeout 정리
      if (timeoutIdRef.current !== null) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
      // debounce 정리
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  if (error) {
    return <MapFallback>지도를 불러오지 못했습니다</MapFallback>;
  }
  if (loading) {
    return <MapFallback>지도를 불러오는 중...</MapFallback>;
  }

  return (
    <div className="relative size-full">
      <Map
        center={DEFAULT_CENTER}
        level={DEFAULT_LEVEL}
        style={{ width: '100%', height: '100%' }}
        onIdle={handleIdle}
        onCreate={(map) => {
          mapRef.current = map;
        }}
      >
        {exhibitions.map((ex) => (
          <CustomOverlayMap
            key={ex.displayId}
            position={{ lat: ex.latitude, lng: ex.longitude }}
            yAnchor={1}
            zIndex={ex.displayId === selectedId ? 10 : 1}
          >
            <MarkerPin
              title={ex.title}
              selected={ex.displayId === selectedId}
              onClick={() => onSelect(ex.displayId)}
            />
          </CustomOverlayMap>
        ))}
      </Map>

      {/* 현재 위치로 이동 버튼 */}
      <button
        type="button"
        onClick={handleLocateUser}
        disabled={isLocating}
        aria-label="내 위치로 이동"
        className="absolute bottom-4 right-4 z-10 flex size-12 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
      >
        <LocateFixed
          className={`size-6 text-neutral-700 ${isLocating ? 'animate-pulse' : ''}`}
        />
      </button>
    </div>
  );
}

function MapFallback({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex size-full items-center justify-center bg-box100">
      <p className="typo-body-sm-regular text-faint">{children}</p>
    </div>
  );
}

interface MarkerPinProps {
  title: string;
  selected: boolean;
  onClick: () => void;
}

/**
 * 지도 위 핀. Figma 기준:
 *  - 선택됨: 어두운 알약 + 흰 글자 + 큰 점
 *  - 기본:  흰 알약 + 위치 아이콘 + 회색 글자 + 작은 점
 * 알약 아래 점이 실제 좌표를 가리키므로 yAnchor=1.
 */
function MarkerPin({ title, selected, onClick }: MarkerPinProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex -translate-y-1 flex-col items-center focus:outline-none"
    >
      {selected ? (
        <span className="rounded-2xl bg-dark px-2.5 py-1.5 shadow-lg">
          <span className="typo-body-xxs-semibold whitespace-nowrap text-white">
            {title}
          </span>
        </span>
      ) : (
        <span className="flex items-center gap-1 rounded-[10px] bg-card px-2 py-1 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10)] outline outline-1 -outline-offset-1 outline-line-soft">
          <PinIcon />
          <span className="typo-body-xxs-regular whitespace-nowrap text-sub700">
            {title}
          </span>
        </span>
      )}
      <span
        className={
          selected
            ? 'mt-[3px] size-2.5 rounded-full bg-dark'
            : 'mt-[3px] size-2 rounded-full bg-faint'
        }
      />
    </button>
  );
}

function PinIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path
        d="M5 1.25c1.5 0 2.5 1.1 2.5 2.4C7.5 5.4 5 8.3 5 8.3S2.5 5.4 2.5 3.65C2.5 2.35 3.5 1.25 5 1.25Z"
        stroke="currentColor"
        strokeWidth="0.83"
        className="text-hint"
      />
      <circle
        cx="5"
        cy="3.75"
        r="0.9"
        stroke="currentColor"
        strokeWidth="0.83"
        className="text-hint"
      />
    </svg>
  );
}
