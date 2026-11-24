import type { NearbyDisplay } from '@/hooks/queries/useMapDisplays';

import { isOpenOn } from './mapExhibition';

export const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

export type HeatLevel = 0 | 1 | 2 | 3 | 4;

export interface CalendarDay {
  date: Date;
  inMonth: boolean;
  count: number;
  level: HeatLevel;
  isToday: boolean;
  isPast: boolean;
}

type DatedExhibition = Pick<NearbyDisplay, 'startDate' | 'endDate'>;

const pad2 = (value: number) => String(value).padStart(2, '0');

export const toDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

export const addMonths = (month: Date, amount: number) =>
  new Date(month.getFullYear(), month.getMonth() + amount, 1);

export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** 그달 1일이 든 주의 일요일부터 마지막 날이 든 주의 토요일까지 */
export function getCalendarDates(month: Date): Date[] {
  const first = startOfMonth(month);
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0);
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - first.getDay());
  const end = new Date(last.getFullYear(), last.getMonth(), last.getDate() + (6 - last.getDay()));

  const dates: Date[] = [];
  for (let date = start; date <= end; ) {
    dates.push(date);
    date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  }
  return dates;
}

/** 그달에서 가장 많은 날을 4단계로 두고, 하나라도 열렸으면 최소 1단계 */
export function getHeatLevel(count: number, max: number): HeatLevel {
  if (count <= 0) return 0;
  return Math.min(4, Math.max(1, Math.ceil((count / Math.max(1, max)) * 4))) as HeatLevel;
}

export function getCalendarDays(
  month: Date,
  exhibitions: DatedExhibition[],
  now: Date = new Date(),
): CalendarDay[] {
  const today = toDay(now);
  const dates = getCalendarDates(month);
  const counts = dates.map((date) =>
    date.getMonth() === month.getMonth()
      ? exhibitions.filter((exhibition) => isOpenOn(exhibition, date)).length
      : 0,
  );
  const max = Math.max(1, ...counts);

  return dates.map((date, index) => ({
    date,
    inMonth: date.getMonth() === month.getMonth(),
    count: counts[index],
    level: getHeatLevel(counts[index], max),
    isToday: isSameDay(date, today),
    isPast: date < today,
  }));
}

export const formatMonthTitle = (month: Date) =>
  `${month.getFullYear()}.${pad2(month.getMonth() + 1)}`;

/** 칩에 보이는 고른 날: 12.08 화 */
export const formatPickedDate = (date: Date) =>
  `${pad2(date.getMonth() + 1)}.${pad2(date.getDate())} ${WEEKDAY_LABELS[date.getDay()]}`;
