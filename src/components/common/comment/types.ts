export interface CommentData {
  id: string;
  author: string;
  avatarUrl?: string | null;
  time: string;
  content: string;
  likeCount: number;
  isLiked: boolean;
  isMyComment?: boolean;
  /** 삭제 버튼 노출 여부. 넘기지 않으면 isMyComment를 그대로 씁니다(모더레이션이 없는 도메인용). */
  canDelete?: boolean;
  replyCount?: number;
  images?: string[];
}
