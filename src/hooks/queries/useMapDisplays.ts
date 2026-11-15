import { useQuery } from '@tanstack/react-query';

import type { DisplayMapMarkerDto } from '@/api/dto';
import { getDisplayMap } from '@/api/endpoints';
import { queryKeys } from '@/api/queryKeys';

/**
 * 지도에 찍을 전시를 모두 조회하는 훅 (/v1/display/map).
 * 핀은 범위 안 전시가 전부 있어야 하므로 전체 범위를 all=true 로 한 번에 받는다.
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

export async function fetchAllMapDisplays(signal?: AbortSignal): Promise<NearbyDisplay[]> {
  const { markers } = await getDisplayMap({ ...WORLD_BOUNDS, all: true }, signal);
  return markers.map(toNearbyDisplay);
}

export function useMapDisplays() {
  return useQuery({
    queryKey: queryKeys.displays.mapMarkers(),
    queryFn: ({ signal }) => fetchAllMapDisplays(signal),
  });
}
