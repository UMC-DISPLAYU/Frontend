export type DisplayDetailTabKey = 'intro' | 'works' | 'reviews';

export const DISPLAY_DETAIL_TABS: DisplayDetailTabKey[] = ['intro', 'works', 'reviews'];

export const displayTabId = (tab: DisplayDetailTabKey) => `display-tab-${tab}`;
export const displayPanelId = (tab: DisplayDetailTabKey) => `display-panel-${tab}`;

const toDot = (date: string) => date.slice(0, 10).replace(/-/g, '.');

/* 2026.10.12 - 11.20. 끝 날짜의 연도는 시작과 다를 때만 붙인다 */
export function formatPeriodDate(start?: string | null, end?: string | null) {
  if (!start) return '';
  if (!end || end.slice(0, 10) === start.slice(0, 10)) return toDot(start);
  const endText = end.slice(0, 4) === start.slice(0, 4) ? toDot(end).slice(5) : toDot(end);
  return `${toDot(start)} - ${endText}`;
}

/* 10:00:00 → 10:00 */
export function formatPeriodTime(start?: string | null, end?: string | null) {
  if (!start || !end) return '';
  return `${start.slice(0, 5)} - ${end.slice(0, 5)}`;
}

// 작가 프로필도 같이 쓰므로 공용 위치로 올렸다
export { type ExternalLink, toInstagramLink, toWebsiteLink } from '@/utils/externalLink';
