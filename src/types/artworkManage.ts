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
  /** 카드에 보일 작가 이름. 대표 작가가 첫 번째이고 공동 작가가 이어진다 */
  artistNames?: string[];
  thumbnail?: string;
  /** 카드 썸네일에 보이는 영역 */
  thumbnailCrop?: CropRect | null;
  /** 카드 썸네일에 보이는 방식(서버 값 FILL | FIT). 없으면 꽉 채우기 */
  thumbnailFitMode?: string | null;
}

export type Content = {
  id: number;
  title: string;
  photoCount: number;
  thumbnail?: string;
};
