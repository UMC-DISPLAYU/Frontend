export interface CommentData {
  id: string;
  author: string;
  avatarUrl?: string | null;
  time: string;
  content: string;
  likeCount: number;
  isLiked: boolean;
  isMyComment?: boolean;
  replyCount?: number;
  images?: string[];
}
