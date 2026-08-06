import type { DisplayContentOpenType } from '@/api/dto';

/* 숨김은 서버가 아직 지원하지 않아 선택지에서 제외했습니다. */
export type VisibilityType = 'immediate' | 'startDate';

export const VISIBILITY_LABEL: Record<VisibilityType, string> = {
  immediate: '전시 등록과 동시에 공개',
  startDate: '전시 시작일에 공개',
};

export const VISIBILITY_TO_CONTENT_OPEN: Record<VisibilityType, DisplayContentOpenType> = {
  immediate: 'IMMEDIATELY',
  startDate: 'ON_EXHIBITION',
};

export const CONTENT_OPEN_TO_VISIBILITY: Record<DisplayContentOpenType, VisibilityType> = {
  IMMEDIATELY: 'immediate',
  ON_EXHIBITION: 'startDate',
};

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/** Date → "2026.06.10 (수)" */
export function formatStartDate(date?: Date | string | null) {
  if (!date) return null;
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return null;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} (${WEEKDAYS[d.getDay()]})`;
}
