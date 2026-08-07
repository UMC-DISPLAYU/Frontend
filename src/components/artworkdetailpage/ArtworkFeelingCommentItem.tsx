import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import type { DisplayDetailDto } from '@/api/dto/display.dto';
import type { ArtworkFeelingDto } from '@/api/dto/displayArtwork.dto';
import type { CommentData } from '@/components/common';
import { CommentItem } from '@/components/common';
import {
  useArtworkFeelingReplies,
  useDeleteArtworkFeeling,
  useDeleteArtworkFeelingReply,
  useToggleArtworkFeelingLike,
  useToggleArtworkFeelingReplyLike,
} from '@/hooks/queries/useArtworkFeelings';
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { useDisplayPolicy, useFeelingPolicy } from '@/hooks/usePolicy';
import { formatRelativeTime } from '@/utils/date';
import { hasPermission } from '@/utils/hasPermission';

type Props = {
  artworkId: number;
  feeling: ArtworkFeelingDto;
  display: DisplayDetailDto;
  myUserId?: number;
  onReplyClick?: (commentId: number, author: string, highlightId: string) => void;
  activeReplyId?: string | null;
};

export const ArtworkFeelingCommentItem = memo(function ArtworkFeelingCommentItem({
  artworkId,
  feeling,
  display,
  myUserId,
  onReplyClick,
  activeReplyId = null,
}: Props) {
  const [repliesOpen, setRepliesOpen] = useState(false);
  const { loginModal, openLoginModal } = useLoginRequiredModal();
  const feelingPolicy = useFeelingPolicy(display);
  const displayPolicy = useDisplayPolicy(display);
  /* like/unlike/create는 로그인 여부만 확인하면 됩니다. */
  const isLoggedIn = hasPermission(feelingPolicy, 'like');
  /* 삭제는 작성자 본인이거나, 이 전시를 관리하는 작가(모더레이터)면 가능합니다. */
  const isModerator = hasPermission(displayPolicy, 'edit');

  const isComposingReply = activeReplyId === `comment-${feeling.feelingId}`;

  useEffect(() => {
    if (isComposingReply) {
      setRepliesOpen(true);
    }
  }, [isComposingReply]);

  const likeMutation = useToggleArtworkFeelingLike();
  const deleteMutation = useDeleteArtworkFeeling();
  const likeReplyMutation = useToggleArtworkFeelingReplyLike(artworkId, feeling.feelingId);
  const deleteReplyMutation = useDeleteArtworkFeelingReply(artworkId, feeling.feelingId);
  const isLikePending = likeMutation.isPending || likeReplyMutation.isPending;

  const {
    data: repliesData,
    hasNextPage: hasMoreReplies,
    fetchNextPage: fetchMoreReplies,
    isFetchingNextPage: isFetchingMoreReplies,
  } = useArtworkFeelingReplies(artworkId, feeling.feelingId, repliesOpen);

  const replies: CommentData[] = useMemo(
    () =>
      (repliesData?.pages.flatMap((p) => p.replies) ?? [])
        // feelingReplyId가 없는 답글은 식별자가 없어 목록 key/좋아요·삭제 대상으로 쓸 수 없으므로 제외합니다.
        .filter((reply) => reply.feelingReplyId != null)
        .map((reply) => {
          const isMyComment = Boolean(myUserId) && reply.user?.userId === myUserId;
          return {
            id: String(reply.feelingReplyId),
            author: reply.user?.nickname ?? '',
            avatarUrl: reply.user?.profileImageUrl,
            time: formatRelativeTime(reply.createdAt),
            content: reply.content,
            likeCount: reply.likeCount ?? 0,
            isLiked: reply.isLiked ?? false,
            isMyComment,
            canDelete: isMyComment || isModerator,
          };
        }),
    [repliesData, myUserId, isModerator],
  );

  const isMyFeeling =
    feeling.isMine ?? (Boolean(myUserId) && (feeling.user?.userId ?? feeling.userId) === myUserId);
  const comment: CommentData = useMemo(
    () => ({
      id: String(feeling.feelingId),
      author: feeling.user?.nickname ?? '',
      avatarUrl: feeling.user?.profileImageUrl,
      time: formatRelativeTime(feeling.createdAt),
      content: feeling.content,
      likeCount: feeling.likeCount,
      isLiked: feeling.isLiked ?? false,
      isMyComment: isMyFeeling,
      canDelete: isMyFeeling || isModerator,
      replyCount: feeling.replyCount,
      images:
        feeling.images && feeling.images.length > 0
          ? feeling.images.map((img) => img.imageUrl)
          : undefined,
    }),
    [feeling, isMyFeeling, isModerator],
  );

  const handleLike = useCallback(
    (commentId: string, parentCommentId?: string) => {
      if (!isLoggedIn) {
        openLoginModal();
        return;
      }
      if (parentCommentId) {
        likeReplyMutation.mutate(Number(commentId));
      } else {
        likeMutation.mutate({ artworkId, feelingId: Number(commentId) });
      }
    },
    [isLoggedIn, openLoginModal, likeReplyMutation, likeMutation, artworkId],
  );

  const handleDelete = useCallback(
    (commentId: string, parentCommentId?: string) => {
      if (!isLoggedIn) {
        openLoginModal();
        return;
      }
      if (parentCommentId) {
        deleteReplyMutation.mutate(Number(commentId));
      } else {
        deleteMutation.mutate({ artworkId, feelingId: Number(commentId) });
      }
    },
    [isLoggedIn, openLoginModal, deleteReplyMutation, deleteMutation, artworkId],
  );

  const handleToggleReplies = useCallback(() => setRepliesOpen((v) => !v), []);
  const handleLoadMoreReplies = useCallback(() => fetchMoreReplies(), [fetchMoreReplies]);
  const handleReplyClick = useCallback(
    (commentId: string, author: string, highlightId: string) =>
      onReplyClick?.(Number(commentId), author, highlightId),
    [onReplyClick],
  );

  return (
    <>
      <CommentItem
        comment={comment}
        isDeleted={feeling.isDeleted}
        replies={replies}
        repliesOpen={repliesOpen}
        onToggleReplies={handleToggleReplies}
        hasMoreReplies={hasMoreReplies}
        onLoadMoreReplies={handleLoadMoreReplies}
        isLoadingMoreReplies={isFetchingMoreReplies}
        onLike={handleLike}
        onUnlike={handleLike}
        isLikePending={isLikePending}
        onDelete={handleDelete}
        onReplyClick={handleReplyClick}
        activeReplyId={activeReplyId}
        tightSpacing
        showDivider
      />
      {loginModal}
    </>
  );
});
