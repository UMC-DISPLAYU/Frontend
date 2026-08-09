import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import type { LoungeCommentDto } from '@/api/dto/lounge.dto';
import type { CommentData } from '@/components/common';
import { CommentItem } from '@/components/common';
import {
  useDeleteLoungeComment,
  useLikeLoungeComment,
  useUnlikeLoungeComment,
} from '@/hooks/queries/useLoungeComments';
import { useLoungeReplies } from '@/hooks/queries/useLoungeReplies';
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { useLoungeCommentPolicy } from '@/hooks/usePolicy';
import { formatRelativeTime } from '@/utils/date';
import { hasPermission } from '@/utils/hasPermission';

type Props = {
  postId: number;
  comment: LoungeCommentDto;
  isDeleted?: boolean;
  onDelete?: (commentId: string) => void;
  onReplyClick?: (commentId: number, author: string, highlightId: string) => void;
  activeReplyId?: string | null;
};

export const LoungeBoardCommentItem = memo(function LoungeBoardCommentItem({
  postId,
  comment,
  isDeleted = false,
  onDelete,
  onReplyClick,
  activeReplyId = null,
}: Props) {
  const [repliesOpen, setRepliesOpen] = useState(false);
  const [removedReplyIds, setRemovedReplyIds] = useState<Set<string>>(new Set());
  const { loginModal, openLoginModal } = useLoginRequiredModal();
  const loungeCommentPolicy = useLoungeCommentPolicy({
    isMyComment: Boolean(comment.isMyComment),
  });
  /* like/unlike/delete는 로그인 여부만 확인하면 됩니다 — 삭제 버튼 자체는
   * CommentItem이 isMyComment일 때만 노출하므로 소유권 재검증은 불필요합니다. */
  const isLoggedIn = hasPermission(loungeCommentPolicy, 'like');
  const commentId = Number(comment.loungeCommentId);
  const isComposingReply = activeReplyId === `comment-${commentId}`;

  useEffect(() => {
    if (isComposingReply) {
      setRepliesOpen(true);
    }
  }, [isComposingReply]);

  const likeMutation = useLikeLoungeComment();
  const unlikeMutation = useUnlikeLoungeComment();
  const deleteReplyMutation = useDeleteLoungeComment();
  const isLikeMutating = likeMutation.isPending || unlikeMutation.isPending;

  const {
    data: repliesData,
    hasNextPage: hasMoreReplies,
    fetchNextPage: fetchMoreReplies,
    isFetchingNextPage: isFetchingMoreReplies,
  } = useLoungeReplies(commentId, {}, { enabled: repliesOpen });

  const replies: CommentData[] = useMemo(
    () =>
      (
        repliesData?.pages
          .flatMap((page) => page.replies)
          .map((reply) => ({
            id: String(reply.loungeCommentId),
            author: reply.writer.nickname,
            avatarUrl: reply.writer.profileImageUrl,
            time: formatRelativeTime(reply.createdAt),
            content: reply.content,
            likeCount: reply.likeCount,
            isLiked: reply.isLiked,
            isMyComment: reply.isMyComment,
            images: reply.imageUrls.length > 0 ? reply.imageUrls : undefined,
          })) ?? []
      ).filter((reply) => !removedReplyIds.has(reply.id)),
    [repliesData, removedReplyIds],
  );

  const commentData: CommentData = useMemo(
    () => ({
      id: String(comment.loungeCommentId),
      author: comment.writer.nickname,
      avatarUrl: comment.writer.profileImageUrl,
      time: formatRelativeTime(comment.createdAt),
      content: comment.content,
      likeCount: comment.likeCount,
      isLiked: comment.isLiked,
      isMyComment: comment.isMyComment,
      replyCount: comment.replyCount,
      images: comment.imageUrls.length > 0 ? comment.imageUrls : undefined,
    }),
    [comment],
  );

  const handleLike = useCallback(
    (targetCommentId: string, parentCommentId?: string) => {
      if (!isLoggedIn) {
        openLoginModal();
        return;
      }
      likeMutation.mutate({
        postId,
        commentId: Number(targetCommentId),
        parentCommentId: parentCommentId ? Number(parentCommentId) : undefined,
      });
    },
    [isLoggedIn, openLoginModal, likeMutation, postId],
  );

  const handleUnlike = useCallback(
    (targetCommentId: string, parentCommentId?: string) => {
      if (!isLoggedIn) {
        openLoginModal();
        return;
      }
      unlikeMutation.mutate({
        postId,
        commentId: Number(targetCommentId),
        parentCommentId: parentCommentId ? Number(parentCommentId) : undefined,
      });
    },
    [isLoggedIn, openLoginModal, unlikeMutation, postId],
  );

  const handleDelete = useCallback(
    (targetCommentId: string, parentCommentId?: string) => {
      if (!isLoggedIn) {
        openLoginModal();
        return;
      }
      if (!parentCommentId) {
        onDelete?.(targetCommentId);
        return;
      }
      deleteReplyMutation.mutate(
        {
          postId,
          commentId: Number(targetCommentId),
          parentCommentId: Number(parentCommentId),
        },
        {
          onSuccess: () => {
            setRemovedReplyIds((prev) => new Set(prev).add(targetCommentId));
          },
        },
      );
    },
    [isLoggedIn, openLoginModal, onDelete, deleteReplyMutation, postId],
  );

  const handleToggleReplies = useCallback(() => setRepliesOpen((v) => !v), []);
  const handleLoadMoreReplies = useCallback(() => fetchMoreReplies(), [fetchMoreReplies]);
  const handleReplyClick = useCallback(
    (replyCommentId: string, author: string, highlightId: string) =>
      onReplyClick?.(Number(replyCommentId), author, highlightId),
    [onReplyClick],
  );

  return (
    <>
      <CommentItem
        comment={commentData}
        isDeleted={isDeleted}
        replies={replies}
        repliesOpen={repliesOpen}
        onToggleReplies={handleToggleReplies}
        hasMoreReplies={hasMoreReplies}
        onLoadMoreReplies={handleLoadMoreReplies}
        isLoadingMoreReplies={isFetchingMoreReplies}
        onLike={handleLike}
        onUnlike={handleUnlike}
        isLikePending={isLikeMutating}
        onDelete={handleDelete}
        onReplyClick={handleReplyClick}
        activeReplyId={activeReplyId}
        tightSpacing
        likePosition="top-right"
      />
      {loginModal}
    </>
  );
});
