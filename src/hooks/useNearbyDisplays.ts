import { useQuery } from '@tanstack/react-query';

import type { GetDisplayMapRequestDto } from '@/api/dto';
import { getDisplayMap } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';
import { formatDate } from '@/utils/date';
import { calculateBounds } from '@/utils/geo';

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
  isArchived: boolean; // 현재 API에 없음, 추후 추가 필요
}

export interface NearbyParams {
  lat: number;
  lng: number;
  radius: number; // meters - API의 bounds 계산에 사용
  searchWord?: string | null;
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
    isArchived: false, // TODO: 북마크 API 연동 필요
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
