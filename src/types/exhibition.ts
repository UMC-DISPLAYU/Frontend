import type { LoungeCategoryKey } from '@/constants/loungeCategories';

// ─── Home Types ────────────────────────────────────────────────────────────

export interface DuPickItem {
  id: string;
  name: string;
  date: string;
  location: string;
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

export interface LoungeBoardPost {
  id: string;
  category: LoungeCategoryKey;
  title: string;
  description: string;
  author: string;
  time: string;
  commentCount: number;
  images?: string[];
}

export interface LoungeBoardComment {
  id: string;
  author: string;
  time: string;
  content: string;
  likeCount: number;
  isLiked: boolean;
}

export interface LoungeBoardDetail {
  id: string;
  category: LoungeCategoryKey;
  title: string;
  author: string;
  date: string;
  content: string[];
  likeCount: number;
  isLiked: boolean;
  isSaved: boolean;
  images?: string[];
  comments: LoungeBoardComment[];
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
