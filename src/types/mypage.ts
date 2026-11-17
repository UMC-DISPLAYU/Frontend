import type { DisplayMemberRole, DisplayPublishStatus, PosterCropDto } from '@/api/dto';

export type TabKey = 'exhibition' | 'artwork' | 'artist';

export interface ExhibitionItem {
  id: string;
  archiveDisplayId?: number;
  displayId?: number;
  userId?: number;
  /* 내 전시 목록은 생성/참여를 나눠서 내려주므로 소유 여부를 그대로 담아둡니다. */
  isOwner?: boolean;
  isLeader?: boolean;
  role?: DisplayMemberRole;
  publishStatus?: DisplayPublishStatus;
  status: string;
  title: string;
  org: string;
  period: string;
  startDate?: string;
  endDate?: string;
  place: string;
  thumbnail: string;
  /* 대표 포스터가 영상이면 true. thumbnail 은 썸네일이다 */
  hasVideoPoster?: boolean;
  /* 대표 포스터에서 카드에 보이는 범위. 없으면 가운데를 보여 준다 */
  posterCrop?: PosterCropDto | null;
  memo?: string;
  artistName?: string;
}

export interface SavedArtworkItem {
  id: string;
  archiveWorkId?: number;
  artworkId?: number | null;
  personalArtworkId?: number | null;
  displayId?: number | null;
  userId?: number;
  title: string;
  artist: string;
  thumbnail: string;
  memo?: string;
}

export interface ArtistItem {
  id: string;
  artistId?: number;
  artistUserId?: number;
  name: string;
  field: string;
  registeration: string;
  exhibition: string;
  thumbnail: string;
  memo?: string;
}

export interface ArtistProfile {
  name: string;
  isVerified: boolean;
  avatar: string;
  school: string;
  fields: string[];
  exhibitionCount: string;
  artworkCount: string;
  bio: string;
  portfolioUrl: string;
}

export interface UserProfile {
  name: string;
  avatar: string;
  school?: string;
  fields?: string[];
  exhibitionCount?: string;
  artworkCount?: string;
  bio?: string;
  portfolioUrl?: string;
  caption?: string;
}
