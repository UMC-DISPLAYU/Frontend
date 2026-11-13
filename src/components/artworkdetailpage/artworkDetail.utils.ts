import type { ImageResponseDto } from '@/api/dto';
import { ARTWORK_TYPE_LABEL_MAP } from '@/constants/artwork';

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

/* 분류·연도·크기·재료 순으로, 값이 있는 항목만 가운뎃점(·)으로 잇습니다. */
export function getArtworkSpecText({
  type,
  productionYear,
  size,
  materialMedia,
}: {
  type: string;
  productionYear?: number | null;
  size?: string | null;
  materialMedia?: string | null;
}) {
  return [
    ARTWORK_TYPE_LABEL_MAP[type] ?? type,
    productionYear ? `${productionYear}` : null,
    size,
    materialMedia,
  ]
    .filter(Boolean)
    .join(' · ');
}
