import { useQuery } from '@tanstack/react-query';

import type { GetDisplayMapRequestDto } from '@/api/dto';
import { getDisplayMap } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

/**
 * 지도 중심 좌표 + 반경으로 주변 전시를 조회하는 훅.
 * 실제 API (/v1/display/map)를 사용합니다.
 */

export interface NearbyDisplay {
  displayId: number;
  title: string;
  posterImageUrl: string;
  status: string; // 예: '전시 중' - startDate/endDate로 계산
  hostName: string; // locationName 사용
  period: string; // startDate ~ endDate 포맷
  placeName: string;
  latitude: number;
  longitude: number;
  isBookmarked: boolean; // 현재 API에 없음, 추후 추가 필요
}

export interface NearbyParams {
  lat: number;
  lng: number;
  radius: number; // meters - API의 bounds 계산에 사용
  searchWord?: string | null;
}

/**
 * 두 좌표 사이 거리(m). 반경 계산에 사용.
 * Haversine formula로 지구 곡률을 고려한 정확한 거리 계산.
 */
export function getDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * 중심 좌표와 반경(m)으로 bounding box 계산
 */
function calculateBounds(lat: number, lng: number, radiusMeters: number) {
  const latDelta = (radiusMeters / 6371000) * (180 / Math.PI);
  const lngDelta = (radiusMeters / 6371000) * (180 / Math.PI) / Math.cos((lat * Math.PI) / 180);

  return {
    southLatitude: lat - latDelta,
    westLongitude: lng - lngDelta,
    northLatitude: lat + latDelta,
    eastLongitude: lng + lngDelta,
  };
}

/**
 * 날짜 문자열을 'MM.DD' 형식으로 변환
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}.${day}`;
}

/**
 * 전시 상태 판단 (시작일/종료일 기준)
 */
function getDisplayStatus(startDate: string, endDate: string): string {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) return '전시 예정';
  if (now > end) return '전시 종료';
  return '전시 중';
}

async function fetchNearbyDisplays(params: NearbyParams): Promise<NearbyDisplay[]> {
  const bounds = calculateBounds(params.lat, params.lng, params.radius);

  const requestDto: GetDisplayMapRequestDto = {
    ...bounds,
    searchWord: params.searchWord || undefined,
    // cursor와 size는 optional이므로 제거해봄
  };

  const response = await getDisplayMap(requestDto);

  // API 응답(DisplayMapMarkerDto)을 NearbyDisplay 형태로 변환
  return response.markers.map((marker) => ({
    displayId: marker.displayId,
    title: marker.title,
    posterImageUrl: marker.posterImageUrl,
    status: getDisplayStatus(marker.startDate, marker.endDate),
    hostName: marker.locationName, // API에 hostName이 없으므로 locationName 사용
    period: `${formatDate(marker.startDate)} - ${formatDate(marker.endDate)}`,
    placeName: marker.locationName,
    latitude: marker.latitude,
    longitude: marker.longitude,
    isBookmarked: false, // TODO: 북마크 API 연동 필요
  }));
}

export function useNearbyDisplays(params: NearbyParams | null) {
  return useQuery({
    queryKey: queryKeys.displays.nearby(params),
    queryFn: () => fetchNearbyDisplays(params!),
    enabled: params !== null, // 지도 첫 idle 전에는 호출 안 함
    placeholderData: (prev) => prev, // 지도 이동 중 목록이 깜빡이지 않게 이전 값 유지
    staleTime: 10_000,
  });
}


