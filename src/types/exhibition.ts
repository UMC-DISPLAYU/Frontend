import type { ArtworkQuestionDto } from '@/api/dto';
import type { LoungeCategoryKey } from '@/constants/loungeCategories';

// ─── Home Types ────────────────────────────────────────────────────────────

export interface DuPickItem {
  id?: number | string;
  title: string;
  name?: string;
  date: string;
  location: string;
  bannerImageUrl?: string;
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
  isMyComment?: boolean;
  replyCount?: number;
  commentStatus?: string;
  images?: string[];
  replies?: LoungeBoardComment[];
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
  isMyPost?: boolean;
  images?: string[];
  comments: LoungeBoardComment[];
}

// ─── Work Management Types ────────────────────────────────────────────────────

export type InteriorPhotos = { id: number; url: string }[];

export interface WorkContent {
  id: string;
  title: string;
  meta: string;
  photos?: InteriorPhotos;
}

export interface ArtworkItemInWork {
  id: string;
  title: string;
  artist: string;
  image: string | null;
}

export interface WorkData {
  contents: WorkContent[];
  artworks: ArtworkItemInWork[];
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
  isArchived: boolean;
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
  imageType: string;
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
  isArchived: boolean;
  isLiked?: boolean;
  likeCount?: number;
}

export interface GuestbookReviewReply {
  replyId: number;
  content: string;
  createdAt: string;
  user: {
    userId: number;
    nickname: string;
    profileImageUrl?: string;
  };
  isArtist?: boolean;
  isMyReply?: boolean;
  likeCount?: number;
  isLiked?: boolean;
}

export interface GuestbookReview {
  feelingId: number;
  content: string;
  createdAt: string;
  user: {
    userId: number;
    nickname: string;
    profileImageUrl?: string;
  };
  reply: {
    content: string;
    createdAt: string;
  } | null;
  replies?: GuestbookReviewReply[];
  images?: string[];
  likeCount?: number;
  isLiked?: boolean;
  isArtist?: boolean;
  isMyReview?: boolean;
  commentCount?: number;
}

export interface GuestbookQuestion extends ArtworkQuestionDto {
  user: (NonNullable<ArtworkQuestionDto['user']> & { profileImageUrl?: string }) | null;
  commentCount?: number;
  isLiked?: boolean;
  isMyQuestion?: boolean;
}
