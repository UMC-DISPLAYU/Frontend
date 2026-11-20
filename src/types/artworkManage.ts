import type { ImageFitDto } from '@/api/dto';
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
  thumbnailFit?: ImageFitDto | null;
  /** 대표가 영상이면 true. 보이는 방식은 대표 사진에만 적용한다 */
  hasVideo?: boolean;
}

export type Content = {
  id: number;
  title: string;
  photoCount: number;
  thumbnail?: string;
};
