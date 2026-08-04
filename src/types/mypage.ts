export type TabKey = 'exhibition' | 'artwork' | 'artist';

export interface ExhibitionItem {
  id: string;
  archiveDisplayId?: number;
  displayId?: number;
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
  artworkId?: number;
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
