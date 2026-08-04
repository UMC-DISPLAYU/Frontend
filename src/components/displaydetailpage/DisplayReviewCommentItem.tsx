import { useState } from 'react';

import type { DisplayReviewDto } from '@/api/dto/display.dto';
import type { CommentData } from '@/components/common';
import { CommentItem } from '@/components/common';
import {
  useDeleteDisplayReviewReply,
  useDisplayReviewReplies,
  useToggleDisplayReviewReplyLike,
} from '@/hooks/queries/useDisplayReviewReplies';
import {
  useDeleteDisplayReview,
  useToggleDisplayReviewLike,
} from '@/hooks/queries/useDisplayReviews';

// ─── 날짜/시간 포맷 (24시간 미만: N시간, 24시간 이상: YYYY.MM.DD) ─────────────

function formatDateOrTime(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours >= 0 && diffHours < 24) {
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins <= 1 ? '방금 전' : `${diffMins}분`;
    }
    return `${diffHours}시간`;
  }

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

type Props = {
  displayId: number;
  review: DisplayReviewDto;
  myUserId?: number;
  onReplyClick?: (commentId: number, author: string, highlightId: number) => void;
  activeReplyId?: number | null;
};

export function DisplayReviewCommentItem({
  displayId,
  review,
  myUserId,
  onReplyClick,
  activeReplyId = null,
}: Props) {
  const [repliesOpen, setRepliesOpen] = useState(review.replyCount > 0);

  const likeMutation = useToggleDisplayReviewLike(displayId);
  const deleteMutation = useDeleteDisplayReview(displayId);
  const likeReplyMutation = useToggleDisplayReviewReplyLike(displayId, review.displayReviewId);
  const deleteReplyMutation = useDeleteDisplayReviewReply(displayId, review.displayReviewId);
  const isLikePending = likeMutation.isPending || likeReplyMutation.isPending;

  const { data: repliesData } = useDisplayReviewReplies(
    displayId,
    review.displayReviewId,
    repliesOpen,
  );

  const replies: CommentData[] = (repliesData?.pages.flatMap((p) => p.replies) ?? []).map(
    (reply) => ({
      id: String(reply.displayReviewReplyId),
      author: reply.user.nickname,
      avatarUrl: reply.user.profileImageUrl,
      time: formatDateOrTime(reply.createdAt),
      content: reply.content,
      likeCount: reply.likeCount,
      isLiked: false, // 답글 목록 API에 좋아요 여부가 내려오지 않음
      isMyComment: Boolean(myUserId) && reply.user.userId === myUserId,
    }),
  );

  const comment: CommentData = {
    id: String(review.displayReviewId),
    author: review.user.nickname,
    avatarUrl: review.user.profileImageUrl,
    time: formatDateOrTime(review.createdAt),
    content: review.content,
    likeCount: review.likeCount,
    isLiked: false, // 후기 목록 API에 좋아요 여부가 내려오지 않음
    isMyComment: Boolean(myUserId) && review.user.userId === myUserId,
    replyCount: review.replyCount,
    images: review.images.map((img) => img.imageUrl),
  };

  const handleLike = (commentId: string, parentCommentId?: string) => {
    if (parentCommentId) {
      likeReplyMutation.mutate(Number(commentId));
    } else {
      likeMutation.mutate(Number(commentId));
    }
  };

  const handleDelete = (commentId: string, parentCommentId?: string) => {
    if (parentCommentId) {
      deleteReplyMutation.mutate(Number(commentId));
    } else {
      deleteMutation.mutate(Number(commentId));
    }
  };

  return (
    <CommentItem
      comment={comment}
      replies={replies}
      repliesOpen={repliesOpen}
      onToggleReplies={() => setRepliesOpen((v) => !v)}
      onLike={handleLike}
      onUnlike={handleLike}
      isLikePending={isLikePending}
      onDelete={handleDelete}
      onReplyClick={(commentId, author, highlightId) =>
        onReplyClick?.(Number(commentId), author, Number(highlightId))
      }
      activeReplyId={activeReplyId !== null ? String(activeReplyId) : null}
      tightSpacing
      showDivider
    />
  );
}
