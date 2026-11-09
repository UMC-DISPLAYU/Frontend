import type { DisplayDetailDto } from '@/api/dto';

export type DisplayDetailTabKey = 'intro' | 'works' | 'reviews';

export const DISPLAY_DETAIL_TABS: DisplayDetailTabKey[] = ['intro', 'works', 'reviews'];

export const displayTabId = (tab: DisplayDetailTabKey) => `display-tab-${tab}`;
export const displayPanelId = (tab: DisplayDetailTabKey) => `display-panel-${tab}`;

/* 공개 전(등록 중) 전시. 팀원이 미리보기로 열 때만 상세가 내려온다 */
export const isPreviewDisplay = (display: Pick<DisplayDetailDto, 'status'>) =>
  display.status === 'DRAFT';

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

export type ExternalLink = { label: string; href: string };

/* 아이디만 남긴다. @나 인스타그램 주소를 그대로 넣은 값도 받는다 */
export function toInstagramLink(value?: string | null): ExternalLink | null {
  const id = (value ?? '')
    .trim()
    .replace(/^(https?:\/\/)?(www\.)?instagram\.com\//i, '')
    .replace(/^@/, '')
    .split(/[/?#]/)[0];
  if (!id) return null;
  return { label: `@${id}`, href: `https://www.instagram.com/${encodeURIComponent(id)}/` };
}

/* 사용자가 입력한 주소라 http(s)만 연다. 보이는 글자는 https · www 를 뺀 주소 */
export function toWebsiteLink(value?: string | null): ExternalLink | null {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;

  const label = `${url.host.replace(/^www\./, '')}${url.pathname.replace(/\/$/, '')}`;
  return { label, href: url.href };
}
