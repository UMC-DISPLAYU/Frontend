import type { NearbyDisplay } from '@/hooks/queries/useMapDisplays';
import { parseServerDate } from '@/utils/date';

export type MapExhibitionStatus = 'live' | 'soon';

export interface LatLng {
  lat: number;
  lng: number;
}

const DAY_MS = 86_400_000;

const startOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

// 전시 기간은 'YYYY-MM-DD' 달력 날짜라 UTC 보정 없이 현지 날짜로 읽는다
const parseDay = (value: string) => {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) return new Date(+dateOnly[1], +dateOnly[2] - 1, +dateOnly[3]);
  return parseServerDate(value);
};

const dayIndex = (value: string) => startOfDay(parseDay(value)).getTime();

export function getMapExhibitionStatus(
  exhibition: Pick<NearbyDisplay, 'startDate' | 'endDate'>,
  now: Date = new Date(),
): MapExhibitionStatus | 'ended' {
  const today = startOfDay(now).getTime();
  if (dayIndex(exhibition.startDate) > today) return 'soon';
  if (dayIndex(exhibition.endDate) < today) return 'ended';
  return 'live';
}

/** 그날 열려 있는 전시인지. 시작일 · 종료일 당일도 열린 날로 센다 */
export function isOpenOn(
  exhibition: Pick<NearbyDisplay, 'startDate' | 'endDate'>,
  day: Date,
): boolean {
  const target = startOfDay(day).getTime();
  return dayIndex(exhibition.startDate) <= target && dayIndex(exhibition.endDate) >= target;
}

export function getDaysUntilOpen(startDate: string, now: Date = new Date()) {
  return Math.max(0, Math.round((dayIndex(startDate) - startOfDay(now).getTime()) / DAY_MS));
}

export function getMapStatusLabel(
  exhibition: Pick<NearbyDisplay, 'startDate' | 'endDate'>,
  now: Date = new Date(),
) {
  return getMapExhibitionStatus(exhibition, now) === 'soon'
    ? `전시 예정 · D-${getDaysUntilOpen(exhibition.startDate, now)}`
    : '전시 중';
}

const normalize = (value: string) => value.replace(/\s/g, '').toLowerCase();

export function matchesMapQuery(
  exhibition: Pick<NearbyDisplay, 'title' | 'schoolDepartmentName' | 'locationName'>,
  query: string,
) {
  const keyword = normalize(query);
  if (!keyword) return true;

  return normalize(
    `${exhibition.title}${exhibition.schoolDepartmentName ?? ''}${exhibition.locationName ?? ''}`,
  ).includes(keyword);
}

const EARTH_RADIUS_M = 6_371_000;
const toRad = (deg: number) => (deg * Math.PI) / 180;

export function getDistanceMeters(from: LatLng, to: LatLng) {
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

export function formatDistance(meters: number) {
  const rounded = Math.max(10, Math.round(meters / 10) * 10);
  if (rounded < 1000) return `${rounded}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}
