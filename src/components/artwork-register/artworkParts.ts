import type { ArtworkPartValues } from './artworkRegister.schema';
import type { ArtworkVideoMeta } from './artworkRequest';
import { type ArtworkImageItem, isArtworkItemReady } from './useArtworkImageUploads';

type PartMedia = { media?: readonly ArtworkImageItem[] };

/** 작품 2부터 칸에 올린 사진 · 영상 수(올리는 중 포함) */
export const countPartMedia = (parts: readonly PartMedia[] = []) =>
  parts.reduce((count, part) => count + (part.media?.length ?? 0), 0);

/**
 * 한 작품 칸이 가질 수 있는 최대 장수. 사진 · 영상은 모든 작품을 합쳐 max 개라서
 * 다른 작품 칸에 올린 수만큼 줄어든다
 */
export const getPartMediaLimit = (ownCount: number, totalCount: number, max: number) =>
  Math.max(ownCount, max - (totalCount - ownCount));

export const isAnyPartUploading = (parts: readonly PartMedia[] = []) =>
  parts.some((part) => (part.media ?? []).some((item) => !isArtworkItemReady(item)));

/** 다 올라간 작품 2부터 사진 · 영상 주소(partUrls)와 그중 영상의 썸네일 · 크기 */
export function toPartUploads(parts: readonly PartMedia[]) {
  const readyItems = parts.map((part) => (part.media ?? []).filter(isArtworkItemReady));

  return {
    partUrls: readyItems.map((items) => items.map((item) => item.uploadedUrl!)),
    videos: Object.fromEntries(
      readyItems
        .flat()
        .filter((item) => item.mediaType === 'VIDEO')
        .map((item) => [
          item.uploadedUrl!,
          { thumbnailUrl: item.thumbnailUrl!, width: item.width, height: item.height },
        ]),
    ) as Record<string, ArtworkVideoMeta>,
  };
}

const createPartKey = () => `new-${Date.now()}-${Math.random().toString(36).slice(2)}`;

/** 새 작품 칸. 제작 연도는 작품 1 연도로 채운다(프로토타입) */
export const createArtworkPartValues = (year: string): ArtworkPartValues => ({
  key: createPartKey(),
  title: '',
  year,
  material: '',
  size: '',
  media: [],
});
