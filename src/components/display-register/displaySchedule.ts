export type DateRange = { start: string | null; end: string | null };

const pad = (value: number) => String(value).padStart(2, '0');

/** 로컬 날짜 기준 YYYY-MM-DD. toISOString 은 UTC 라 한국 시간 자정 근처에서 하루가 밀린다 */
export const toIsoDate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const formatDotDate = (isoDate: string) => isoDate.replace(/-/g, '.');

/** 첫 주 앞의 빈칸은 null, 날짜는 YYYY-MM-DD 로 채운 한 달 칸 */
export function buildMonthDays(year: number, month: number): (string | null)[] {
  const leading = new Date(year, month, 1).getDay();
  const length = new Date(year, month + 1, 0).getDate();

  return [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length }, (_, index) => toIsoDate(new Date(year, month, index + 1))),
  ];
}

/** 시작일 → 종료일 순서로 고른다. 시작일보다 앞 날짜를 누르거나 둘 다 골랐으면 다시 시작일부터 */
export function pickRangeDate(range: DateRange, picked: string): DateRange {
  if (!range.start || range.end || picked < range.start) return { start: picked, end: null };
  return { start: range.start, end: picked };
}

export const TIME_OPTIONS = Array.from(
  { length: 48 },
  (_, index) => `${pad(Math.floor(index / 2))}:${index % 2 ? '30' : '00'}`,
);

export const isValidTimeRange = (start: string, end: string) => end > start;
