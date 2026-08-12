export type TabKey = 'exhibition' | 'artwork' | 'artist';

export interface ExhibitionItem {
  id: string;
  archiveDisplayId?: number;
  displayId?: number;
  userId?: number;
  /* 내 전시 목록은 생성/참여를 나눠서 내려주므로 소유 여부를 그대로 담아둡니다. */
  isOwner?: boolean;
  status: string;
  title: string;
  org: string;
  period: string;
  place: string;
  thumbnail: string;
  memo?: string;
}

export interface SavedArtworkItem {
  id: string;
  archiveWorkId?: number;
  artworkId?: number | null;
  personalArtworkId?: number | null;
  userId?: number;
  title: string;
  artist: string;
  thumbnail: string;
  memo?: string;
}

export interface ArtistItem {
  id: string;
  artistId?: number;
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
  schoolIcon: string;
  field: string;
  fieldIcon: string;
  exhibit: string;
  exhibitionIcon: string;
  bio: string;
  portfolioUrl: string;
}
