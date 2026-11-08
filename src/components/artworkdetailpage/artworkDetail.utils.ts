import type { DisplayPeriodDto, ImageResponseDto } from '@/api/dto';
import { ARTWORK_TYPE_LABEL_MAP } from '@/constants/artwork';

export type ArtworkDetailTabKey = 'intro' | 'guest';

export const artworkTabId = (key: ArtworkDetailTabKey) => `artwork-tab-${key}`;
export const artworkPanelId = (key: ArtworkDetailTabKey) => `artwork-panel-${key}`;

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

export function getProcessImages<T extends Pick<ImageResponseDto, 'imageType' | 'sortOrder'>>(
  images: T[],
) {
  return images
    .filter((image) => image.imageType === 'WORK_PROCESS')
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/* 소개글·감상 포인트·작업과정이 모두 없는 작품은 소개 탭을 빼고 방명록만 보여줍니다. */
export function hasArtworkIntro({
  content,
  point,
  processImageCount,
}: {
  content?: string | null;
  point?: string | null;
  processImageCount: number;
}) {
  return Boolean(content?.trim() || point?.trim() || processImageCount > 0);
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
