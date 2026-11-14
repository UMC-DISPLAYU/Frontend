import { useMemo } from 'react';

import { useMapDisplays } from '@/hooks/useNearbyDisplays';
import { formatDate } from '@/utils/date';

import {
  formatDistance,
  getDistanceMeters,
  getMapExhibitionStatus,
  getMapStatusLabel,
  type LatLng,
  type MapExhibitionStatus,
  matchesMapQuery,
} from './mapExhibition';
import { filterInView, type MapSnapshot, type ViewInsets } from './mapViewport';

export interface MapExhibition {
  id: number;
  title: string;
  posterImageUrl: string;
  organization?: string;
  locationName: string;
  period: string;
  position: LatLng;
  status: MapExhibitionStatus;
  statusLabel: string;
  distanceMeters: number | null;
  distance?: string;
}

export const matchesMapFilters = (
  exhibition: Pick<MapExhibition, 'title' | 'organization' | 'locationName' | 'status'>,
  query: string,
  statusFilters: MapExhibitionStatus[],
) =>
  (statusFilters.length === 0 || statusFilters.includes(exhibition.status)) &&
  matchesMapQuery(
    {
      title: exhibition.title,
      schoolDepartmentName: exhibition.organization,
      locationName: exhibition.locationName,
    },
    query,
  );

interface UseMapExhibitionsOptions {
  snapshot: MapSnapshot | null;
  insets: ViewInsets;
  query: string;
  statusFilters: MapExhibitionStatus[];
  myLocation: LatLng | null;
}

/**
 * 지도에 찍을 전시를 모두 받아 화면용으로 바꾼다. 목록(inView)은 그중 보이는 범위만 보여준다.
 * 종료된 전시는 지도에 보이지 않는다(프로토타입 정책).
 */
export function useMapExhibitions({
  snapshot,
  insets,
  query,
  statusFilters,
  myLocation,
}: UseMapExhibitionsOptions) {
  const { data, isLoading, error, refetch } = useMapDisplays();

  const exhibitions = useMemo<MapExhibition[]>(
    () =>
      (data ?? []).flatMap((display) => {
        const status = getMapExhibitionStatus(display);
        if (status === 'ended') return [];

        const position = { lat: display.latitude, lng: display.longitude };
        const distanceMeters = myLocation ? getDistanceMeters(myLocation, position) : null;

        return [
          {
            id: display.displayId,
            title: display.title,
            posterImageUrl: display.posterImageUrl,
            organization: display.schoolDepartmentName,
            locationName: display.locationName,
            period: `${formatDate(display.startDate)} - ${formatDate(display.endDate)}`,
            position,
            status,
            statusLabel: getMapStatusLabel(display),
            distanceMeters,
            distance: distanceMeters === null ? undefined : formatDistance(distanceMeters),
          },
        ];
      }),
    [data, myLocation],
  );

  const statusCounts = useMemo(() => {
    const queried = exhibitions.filter((exhibition) => matchesMapFilters(exhibition, query, []));
    return {
      live: queried.filter((exhibition) => exhibition.status === 'live').length,
      soon: queried.filter((exhibition) => exhibition.status === 'soon').length,
    };
  }, [exhibitions, query]);

  const matched = useMemo(
    () => exhibitions.filter((exhibition) => matchesMapFilters(exhibition, query, statusFilters)),
    [exhibitions, query, statusFilters],
  );

  const inView = useMemo(() => {
    // 지도 범위를 알기 전에는 "이 지역" 목록을 비워 두고 불러오는 중으로 보여준다
    if (!snapshot) return [];
    const visible = filterInView(
      matched.map((exhibition) => ({
        exhibition,
        latitude: exhibition.position.lat,
        longitude: exhibition.position.lng,
      })),
      snapshot,
      insets,
    ).map(({ exhibition }) => exhibition);

    if (!myLocation) return visible;
    return [...visible].sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));
  }, [matched, snapshot, insets, myLocation]);

  return {
    exhibitions,
    matched,
    inView,
    statusCounts,
    hasData: data !== undefined,
    isLoading: isLoading || !snapshot,
    error,
    refetch,
  };
}
