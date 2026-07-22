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

export interface ExhibitionReviewPost {
  id: string;
  tag: string;
  title: string;
  description: string;
  author: string;
  time: string;
  commentCount: number;
  images?: string[];
}

export interface ExhibitionReviewComment {
  id: string;
  author: string;
  time: string;
  content: string;
  likeCount: number;
  isLiked: boolean;
}

export interface ExhibitionReviewDetail {
  id: string;
  tag: string;
  title: string;
  author: string;
  date: string;
  content: string[];
  likeCount: number;
  isLiked: boolean;
  isSaved: boolean;
  images?: string[];
  comments: ExhibitionReviewComment[];
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
// ─── Artwork Detail Types ──────────────────────────────────────────────────

export type ArtworkGuestbookTab = 'review' | 'question';

export interface ArtworkImage {
  imageUrl: string;
  isThumbnail: boolean;
  sortOrder: number;
}

export interface ArtworkDetail {
  artworkId: number;
  artworkName: string;
  content: string;
  type: string;
  productionYear: number;
  materialMedia: string;
  size: string;
  point: string;
  images: ArtworkImage[];

  // UI-specific fields (to be mapped or added later)
  artist: string;
  exhibitionId: string;
  exhibitionTitle: string;
  exhibitionOrganizer: string;
  exhibitionPeriod: string;
  exhibitionThumbnail: string;
  bookmarkCount: number;
  isBookmarked: boolean;
}

export interface GuestbookReview {
  feelingId: number;
  content: string;
  createdAt: string;
  user: {
    userId: number;
    nickname: string;
  };
  reply: {
    content: string;
    createdAt: string;
  } | null;
}

export interface GuestbookQuestion {
  questionId: number;
  content: string;
  isPublic: boolean;
  createdAt: string;
  user: {
    userId: number;
    nickname: string;
  };
  reply: {
    content: string;
    createdAt: string;
  } | null;
}
