export type DisplayDetailTabKey = 'intro' | 'works' | 'reviews';

const DISPLAY_DETAIL_TABS: readonly DisplayDetailTabKey[] = ['intro', 'works', 'reviews'];

type DisplayIntro = {
  content?: string | null;
  contentCategories: readonly unknown[];
};

export const getDisplayIntroText = ({ content }: Pick<DisplayIntro, 'content'>) =>
  content?.trim() ?? '';

/* 소개 글도 전시 콘텐츠도 없으면 소개 탭이 비므로 탭을 뺀다 */
export const hasDisplayIntro = (display: DisplayIntro) =>
  getDisplayIntroText(display) !== '' || display.contentCategories.length > 0;

/*
 * 작품 목록(GET /v1/artworks?displayId=)을 받은 뒤에만 비었는지 판단한다. 받기 전 · 불러오기 실패(응답 없음)는
 * 작품 탭을 남긴다(실패면 패널에서 다시 시도를 보인다). 작품 공개 전이면 서버가 빈 목록을 주므로 탭이 빠진다
 */
export const hasDisplayWorks = (works: { artworks?: readonly unknown[] | null } | undefined) =>
  !works || (works.artworks?.length ?? 0) > 0;

/* 내용이 없는 탭은 뺀다. 후기 탭은 첫 후기를 쓸 자리라 비어도 남긴다 */
export const getDisplayDetailTabs = (
  display: DisplayIntro,
  { hasWorks }: { hasWorks: boolean },
): DisplayDetailTabKey[] =>
  DISPLAY_DETAIL_TABS.filter(
    (tab) => (tab !== 'intro' || hasDisplayIntro(display)) && (tab !== 'works' || hasWorks),
  );

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
