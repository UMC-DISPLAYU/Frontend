import { useMemo } from 'react';

import { useMapDisplays } from '@/hooks/queries/useMapDisplays';
import { formatDate } from '@/utils/date';

import {
  formatDistance,
  getDistanceMeters,
  getMapExhibitionStatus,
  getMapStatusLabel,
  isOpenOn,
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
  startDate: string;
  endDate: string;
  position: LatLng;
  status: MapExhibitionStatus;
  statusLabel: string;
  distanceMeters: number | null;
  distance?: string;
}

export interface MapFilters {
  query: string;
  statusFilters: MapExhibitionStatus[];
  /** 고른 날. 날짜와 전시 상태는 한쪽만 걸린다(프로토타입) */
  date: Date | null;
}

const matchesQuery = (
  exhibition: Pick<MapExhibition, 'title' | 'organization' | 'locationName'>,
  query: string,
) =>
  matchesMapQuery(
    {
      title: exhibition.title,
      schoolDepartmentName: exhibition.organization,
      locationName: exhibition.locationName,
    },
    query,
  );

export const matchesMapFilters = (
  exhibition: Pick<
    MapExhibition,
    'title' | 'organization' | 'locationName' | 'status' | 'startDate' | 'endDate'
  >,
  { query, statusFilters, date }: MapFilters,
) =>
  (date
    ? isOpenOn(exhibition, date)
    : statusFilters.length === 0 || statusFilters.includes(exhibition.status)) &&
  matchesQuery(exhibition, query);

interface UseMapExhibitionsOptions {
  snapshot: MapSnapshot | null;
  insets: ViewInsets;
  filters: MapFilters;
  myLocation: LatLng | null;
}

/**
 * 지도에 찍을 전시를 모두 받아 화면용으로 바꾼다. 목록(inView)은 그중 보이는 범위만 보여준다.
 * 종료된 전시는 지도에 보이지 않는다(프로토타입 정책).
 */
export function useMapExhibitions({
  snapshot,
  insets,
  filters,
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
            startDate: display.startDate,
            endDate: display.endDate,
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

  // 칩 · 달력의 개수는 검색어만 반영한다
  const queried = useMemo(
    () => exhibitions.filter((exhibition) => matchesQuery(exhibition, filters.query)),
    [exhibitions, filters.query],
  );

  const statusCounts = useMemo(
    () => ({
      live: queried.filter((exhibition) => exhibition.status === 'live').length,
      soon: queried.filter((exhibition) => exhibition.status === 'soon').length,
    }),
    [queried],
  );

  const { date } = filters;
  const dateCount = useMemo(
    () => (date ? queried.filter((exhibition) => isOpenOn(exhibition, date)).length : 0),
    [queried, date],
  );

  const matched = useMemo(
    () => exhibitions.filter((exhibition) => matchesMapFilters(exhibition, filters)),
    [exhibitions, filters],
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
    queried,
    matched,
    inView,
    statusCounts,
    dateCount,
    hasData: data !== undefined,
    isLoading: isLoading || !snapshot,
    error,
    refetch,
  };
}
