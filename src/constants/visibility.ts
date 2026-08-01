export type VisibilityType = 'immediate' | 'startDate' | 'hidden';

export const VISIBILITY_LABEL: Record<VisibilityType, string> = {
  immediate: '전시 등록과 동시에 공개',
  startDate: '전시 시작일에 공개',
  hidden: '숨김',
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
