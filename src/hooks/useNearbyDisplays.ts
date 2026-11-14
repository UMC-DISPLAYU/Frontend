import { useQuery } from '@tanstack/react-query';

import type { DisplayMapMarkerDto } from '@/api/dto';
import { getDisplayMap } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

/**
 * 지도에 찍을 전시를 모두 조회하는 훅 (/v1/display/map).
 * 핀은 범위 안 전시가 전부 있어야 하므로 전체 범위를 페이지 끝까지 받는다.
 */

export interface NearbyDisplay {
  displayId: number;
  title: string;
  posterImageUrl: string;
  status: string; // 예: '전시 중' - startDate/endDate로 계산
  schoolDepartmentName?: string;
  startDate: string;
  endDate: string;
  locationName: string;
  latitude: number;
  longitude: number;
  isArchived: boolean;
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

const WORLD_BOUNDS = {
  southLatitude: -90,
  westLongitude: -180,
  northLatitude: 90,
  eastLongitude: 180,
};
// 서버가 받는 최대 페이지 크기
const PAGE_SIZE = 100;
// 서버가 다음 페이지를 계속 돌려주는 경우를 막는 안전장치 (최대 5,000개)
const MAX_PAGES = 50;

const toNearbyDisplay = (marker: DisplayMapMarkerDto): NearbyDisplay => ({
  displayId: marker.displayId,
  title: marker.title,
  posterImageUrl: marker.posterImageUrl,
  status: getDisplayStatus(marker.startDate, marker.endDate),
  schoolDepartmentName: marker.schoolDepartmentName,
  startDate: marker.startDate,
  endDate: marker.endDate,
  locationName: marker.locationName,
  latitude: marker.latitude,
  longitude: marker.longitude,
  isArchived: marker.isArchived ?? false,
});

export async function fetchAllMapDisplays(): Promise<NearbyDisplay[]> {
  const markers = new Map<number, DisplayMapMarkerDto>();
  let cursor: number | undefined;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const { markers: pageMarkers, pagination } = await getDisplayMap({
      ...WORLD_BOUNDS,
      size: PAGE_SIZE,
      cursor,
    });
    pageMarkers.forEach((marker) => markers.set(marker.displayId, marker));
    if (!pagination.hasNext || pagination.nextCursor == null) break;
    cursor = pagination.nextCursor;
  }

  return [...markers.values()].map(toNearbyDisplay);
}

export function useMapDisplays() {
  return useQuery({
    queryKey: queryKeys.displays.mapMarkers(),
    queryFn: fetchAllMapDisplays,
    staleTime: 60_000,
  });
}
