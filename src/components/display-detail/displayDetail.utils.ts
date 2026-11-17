import type { DisplayContentOpenType, DisplayPeriodDto } from '@/api/dto';
import { getExhibitionState } from '@/utils/exhibitionState';

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

/*
 * 공개 시점이 "전시 시작일부터"면 서버가 개막 전까지 작품 · 콘텐츠를 비워서 준다.
 * 빈 화면 대신 언제부터 보이는지 알린다. 예: 11.16부터 노출돼요
 */
export function getContentOpenNotice(
  open: DisplayContentOpenType | undefined,
  period: DisplayPeriodDto | undefined,
  now = Date.now(),
) {
  if (open !== 'ON_EXHIBITION' || !period?.startDate) return null;
  if (getExhibitionState(period, now) !== 'upcoming') return null;
  return `${toDot(period.startDate).slice(5)}부터 노출돼요`;
}
