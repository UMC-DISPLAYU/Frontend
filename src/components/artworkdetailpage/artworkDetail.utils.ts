import type { ImageResponseDto } from '@/api/dto';

export type ArtworkDetailTabKey = 'intro' | 'guest';

export const artworkTabId = (key: ArtworkDetailTabKey) => `artwork-tab-${key}`;
export const artworkPanelId = (key: ArtworkDetailTabKey) => `artwork-panel-${key}`;

export function getProcessImages<T extends Pick<ImageResponseDto, 'imageType' | 'sortOrder'>>(
  images: T[],
) {
  return images
    .filter((image) => image.imageType === 'WORK_PROCESS')
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/* theme.css 의 --breakpoint-desktop(56.25rem = 900px)과 같다 */
export const DESKTOP_MEDIA_QUERY = '(width >= 56.25rem)';
export const isDesktopViewport = () => window.matchMedia(DESKTOP_MEDIA_QUERY).matches;

/* 이어서 보기에서 지금 보는 장을 읽는 화면 높이 비율(프로토타입 40%) */
export const STACK_READING_LINE = 0.4;

/*
 * 이어서 보기에서 지금 보는 장. tops 는 사진마다 화면 기준 윗변 위치다.
 * 읽는 선(line)을 넘은 마지막 사진을 고르되, 바로 앞 사진이 아직 위 여백(anchor) 아래에 온전히 있으면 앞 사진으로 되돌린다.
 * 사진이 (line - anchor)보다 짧으면 맨 위 · 썸네일로 옮긴 자리에서 다음 장이 골라지기 때문이다.
 * 반올림 오차는 1px 까지 같은 자리로 본다
 */
export function getStackPhotoIndex(tops: number[], anchor: number, line: number) {
  let index = 0;
  tops.forEach((top, i) => {
    if (top <= line) index = i;
  });
  while (index > 0 && tops[index - 1] >= anchor - 1) index -= 1;
  return index;
}

/*
 * 작품 이름표에 보일 작가 목록. 프로필이 있는(계정 있는) 작가를 먼저, 이름만 입력한 작가를 뒤에 둔다(사용자 결정).
 * 같은 묶음 안에서는 대표 작가 → 공동 작업자 순서를 지킨다.
 * 대표 작가와 계정이 같은 공동 작업자만 뺀다. 이름만 입력한 공동 작업자(userId 없음)는 대표 작가 계정이 없어도 남긴다
 */
export function getArtworkArtists({
  artistUserId,
  artistName,
  coAuthors,
}: {
  artistUserId?: number | null;
  artistName: string;
  coAuthors?: { userId?: number | null; name: string }[] | null;
}) {
  const artists = [
    { userId: artistUserId ?? undefined, name: artistName || '작가 미상' },
    ...(coAuthors ?? [])
      .filter((coAuthor) => coAuthor.userId == null || coAuthor.userId !== artistUserId)
      .map((coAuthor) => ({ userId: coAuthor.userId ?? undefined, name: coAuthor.name })),
  ];
  return [
    ...artists.filter((artist) => artist.userId !== undefined),
    ...artists.filter((artist) => artist.userId === undefined),
  ];
}

/* 소개글·작업과정이 모두 없는 작품은 소개 탭을 빼고 방명록만 보여줍니다. */
export function hasArtworkIntro({
  content,
  processImageCount,
}: {
  content?: string | null;
  processImageCount: number;
}) {
  return Boolean(content?.trim() || processImageCount > 0);
}

/* 연도·크기·재료 순으로, 값이 있는 항목만 가운뎃점(·)으로 잇습니다. */
export function getArtworkSpecText({
  productionYear,
  size,
  materialMedia,
}: {
  productionYear?: number | null;
  size?: string | null;
  materialMedia?: string | null;
}) {
  return [productionYear ? `${productionYear}` : null, size, materialMedia]
    .filter(Boolean)
    .join(' · ');
}

/*
 * 소속 전시 줄의 주최: 프로토타입처럼 학교와 학과를 함께 쓴다(예: 모아디자인대학교 시각디자인학과).
 * 작품 상세 응답의 주최는 학교만 오므로 전시 상세의 학교 · 학과를 먼저 쓴다
 */
export function getExhibitionOrganizerText(
  display: { organization?: string | null; department?: string | null } | undefined,
  fallback: string,
) {
  const text = [display?.organization, display?.department]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(' ');
  return text || fallback;
}
