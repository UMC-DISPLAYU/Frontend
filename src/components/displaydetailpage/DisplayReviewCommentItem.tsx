import { useState } from 'react';

import type { DisplayDetailDto, DisplayReviewDto } from '@/api/dto/display.dto';
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
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { useDisplayPolicy, useDisplayReviewPolicy } from '@/hooks/usePolicy';
import { formatRelativeTime } from '@/utils/date';
import { hasPermission } from '@/utils/hasPermission';

type Props = {
  display: DisplayDetailDto;
  displayId: number;
  review: DisplayReviewDto;
  myUserId?: number;
  onReplyClick?: (commentId: number, author: string, highlightId: string) => void;
  activeReplyId?: string | null;
};

export function DisplayReviewCommentItem({
  display,
  displayId,
  review,
  myUserId,
  onReplyClick,
  activeReplyId = null,
}: Props) {
  const [repliesOpen, setRepliesOpen] = useState(false);
  const { loginModal, openLoginModal } = useLoginRequiredModal();
  const reviewPolicy = useDisplayReviewPolicy(display);
  const displayPolicy = useDisplayPolicy(display);
  /* like/unlike/create는 로그인 여부만 확인하면 됩니다. */
  const isLoggedIn = hasPermission(reviewPolicy, 'like');
  /* 삭제는 작성자 본인이거나, 이 전시를 관리하는 작가(모더레이터)면 가능합니다. */
  const isModerator = hasPermission(displayPolicy, 'edit');

  const isComposingReply = activeReplyId === `comment-${review.displayReviewId}`;
  const [prevIsComposingReply, setPrevIsComposingReply] = useState(isComposingReply);
  if (isComposingReply !== prevIsComposingReply) {
    setPrevIsComposingReply(isComposingReply);
    if (isComposingReply) setRepliesOpen(true);
  }

  const likeMutation = useToggleDisplayReviewLike(displayId);
  const deleteMutation = useDeleteDisplayReview(displayId);
  const likeReplyMutation = useToggleDisplayReviewReplyLike(displayId, review.displayReviewId);
  const deleteReplyMutation = useDeleteDisplayReviewReply(displayId, review.displayReviewId);
  const isLikePending = likeMutation.isPending || likeReplyMutation.isPending;

  const {
    data: repliesData,
    hasNextPage: hasMoreReplies,
    fetchNextPage: fetchMoreReplies,
    isFetchingNextPage: isFetchingMoreReplies,
  } = useDisplayReviewReplies(displayId, review.displayReviewId, repliesOpen);

  const replies: CommentData[] = (repliesData?.pages.flatMap((p) => p.replies) ?? []).map(
    (reply) => {
      const isMyComment = Boolean(myUserId) && reply.user.userId === myUserId;
      return {
        id: String(reply.displayReviewReplyId),
        author: reply.user.nickname,
        avatarUrl: reply.user.profileImageUrl,
        time: formatRelativeTime(reply.createdAt),
        content: reply.content,
        likeCount: reply.likeCount,
        isLiked: reply.isLiked,
        isMyComment,
        canDelete: isMyComment || isModerator,
        images:
          reply.images && reply.images.length > 0
            ? reply.images.map((img) => img.imageUrl)
            : undefined,
      };
    },
  );

  const isMyReview = review.isMine;
  const comment: CommentData = {
    id: String(review.displayReviewId),
    author: review.user.nickname,
    avatarUrl: review.user.profileImageUrl,
    time: formatRelativeTime(review.createdAt),
    content: review.content,
    likeCount: review.likeCount,
    isLiked: review.isLiked,
    isMyComment: isMyReview,
    canDelete: isMyReview || isModerator,
    replyCount: review.replyCount,
    images: review.images.length > 0 ? review.images.map((img) => img.imageUrl) : undefined,
  };

  const handleLike = (commentId: string, parentCommentId?: string) => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    if (parentCommentId) {
      likeReplyMutation.mutate(Number(commentId));
    } else {
      likeMutation.mutate(Number(commentId));
    }
  };

  const handleDelete = (commentId: string, parentCommentId?: string) => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    if (parentCommentId) {
      deleteReplyMutation.mutate(Number(commentId));
    } else {
      deleteMutation.mutate(Number(commentId));
    }
  };

  return (
    <>
      <CommentItem
        comment={comment}
        isDeleted={review.isDeleted}
        replies={replies}
        repliesOpen={repliesOpen}
        onToggleReplies={() => setRepliesOpen((v) => !v)}
        hasMoreReplies={hasMoreReplies}
        onLoadMoreReplies={() => fetchMoreReplies()}
        isLoadingMoreReplies={isFetchingMoreReplies}
        onLike={handleLike}
        onUnlike={handleLike}
        isLikePending={isLikePending}
        onDelete={handleDelete}
        onReplyClick={(commentId, author, highlightId) =>
          onReplyClick?.(Number(commentId), author, highlightId)
        }
        activeReplyId={activeReplyId}
        tightSpacing
        showDivider
      />
      {loginModal}
    </>
  );
}
