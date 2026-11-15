import type { CropRect } from '@/utils/cropBox';

export interface Work {
  id: number;
  title: string;
  artist: string;
  org: string;
  date: string;
  place: string;
  owner: string;
  artistUserId?: number | null;
  /** 대표 · 공동 작가 중 계정이 있는 사람의 id */
  artistUserIds?: number[];
  thumbnail?: string;
  /** 카드 썸네일에 보이는 영역 */
  thumbnailCrop?: CropRect | null;
}

export type Content = {
  id: number;
  title: string;
  photoCount: number;
  thumbnail?: string;
};
