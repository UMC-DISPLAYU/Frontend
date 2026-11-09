import type { DisplayPeriodDto } from '@/api/dto';

export type ExhibitionState = 'upcoming' | 'ongoing' | 'ended';

export const EXHIBITION_STATE_LABEL: Record<ExhibitionState, string> = {
  upcoming: '전시 예정',
  ongoing: '전시 중',
  ended: '종료',
};

const toTimestamp = (date: string, time: string | undefined, fallbackTime: string) => {
  const timestamp = new Date(`${date}T${time || fallbackTime}`).getTime();
  return Number.isNaN(timestamp) ? new Date(`${date}T${fallbackTime}`).getTime() : timestamp;
};

/* 작품 상세 응답에는 전시 상태가 없어 전시 기간으로 계산합니다. */
export function getExhibitionState(
  period: DisplayPeriodDto | undefined,
  now = Date.now(),
): ExhibitionState | null {
  if (!period?.startDate || !period.endDate) return null;

  const start = toTimestamp(period.startDate, period.startTime, '00:00:00');
  const end = toTimestamp(period.endDate, period.endTime, '23:59:59');
  if (Number.isNaN(start) || Number.isNaN(end)) return null;

  if (now < start) return 'upcoming';
  return now > end ? 'ended' : 'ongoing';
}
