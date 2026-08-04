export interface CommentData {
  id: string;
  author: string;
  time: string;
  content: string;
  likeCount: number;
  isLiked: boolean;
  isMyComment?: boolean;
  replyCount?: number;
  images?: string[];
}
