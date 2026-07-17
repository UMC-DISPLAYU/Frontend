// ─── Home Types ────────────────────────────────────────────────────────────

export interface DuPickItem {
  id: string;
  name: string;
  date: string;
  location: string;
}

export interface ExhibitionCardData {
  id: string;
  title: string;
  school: string;
  period: string;
  thumbnail?: string;
}

export interface ArtworkPreviewItem {
  id: string;
  name: string;
  date: string;
}

export interface LoungePost {
  id: string;
  tag: string;
  content: string;
  author: string;
  time: string;
  views: string;
}

// ─── Detail Types ──────────────────────────────────────────────────────────

export type DetailTabKey = 'intro' | 'artwork' | 'review';

export interface ExhibitionDetail {
  id: string;
  title: string;
  subtitle: string;
  organizer: string;
  period: string;
  hours: string;
  location: string;
  bookmarkCount: number;
  isBookmarked: boolean;
  heroImages: string[];
  description: string;
  contentImages: string[];
  notices: string[];
  host: string;
  sns: string;
}

export interface ArtworkItem {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  medium: string;
  year: string;
}

export interface ReviewItem {
  id: string;
  author: string;
  avatarColor: string;
  rating: number;
  content: string;
  date: string;
  likes: number;
  images?: string[];
}
