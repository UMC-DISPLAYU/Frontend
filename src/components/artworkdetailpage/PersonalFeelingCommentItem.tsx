import { memo, useCallback, useEffect, useMemo, useState } from 'react';

import type {
  PersonalArtworkFeelingResponseDataDto,
  PersonalArtworkResponseDataDto,
} from '@/api/dto';
import type { CommentData } from '@/components/common';
import { CommentItem } from '@/components/common';
import {
  useDeletePersonalArtworkFeeling,
  useDeletePersonalArtworkFeelingReply,
  usePersonalArtworkFeelingReplies,
  useTogglePersonalArtworkFeelingLike,
  useTogglePersonalArtworkFeelingReplyLike,
} from '@/hooks/queries/usePersonalArtwork';
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { usePersonalFeelingPolicy } from '@/hooks/usePolicy';
import { formatRelativeTime } from '@/utils/date';
import { hasPermission } from '@/utils/hasPermission';

type Props = {
  personalArtworkId: number;
  feeling: PersonalArtworkFeelingResponseDataDto;
  artwork: PersonalArtworkResponseDataDto;
  myUserId?: number;
  onReplyClick?: (commentId: number, author: string, highlightId: string) => void;
  activeReplyId?: string | null;
};

export const PersonalFeelingCommentItem = memo(function PersonalFeelingCommentItem({
  personalArtworkId,
  feeling,
  artwork,
  myUserId,
  onReplyClick,
  activeReplyId = null,
}: Props) {
  const [repliesOpen, setRepliesOpen] = useState(false);
  const { loginModal, openLoginModal } = useLoginRequiredModal();
  const feelingPolicy = usePersonalFeelingPolicy(feeling, artwork);
  /* like/unlike/create는 로그인 여부만 확인하면 됩니다. */
  const isLoggedIn = hasPermission(feelingPolicy, 'like');
  /* 삭제는 작성자 본인이거나, 이 작품의 주인(작가)이면 가능합니다. */
  const isOwner = Boolean(myUserId) && myUserId === artwork.userId;

  const isComposingReply = activeReplyId === `comment-${feeling.personalFeelingId}`;

  useEffect(() => {
    if (isComposingReply) {
      setRepliesOpen(true);
    }
  }, [isComposingReply]);

  const likeMutation = useTogglePersonalArtworkFeelingLike(personalArtworkId);
  const deleteMutation = useDeletePersonalArtworkFeeling(personalArtworkId);
  const likeReplyMutation = useTogglePersonalArtworkFeelingReplyLike(
    personalArtworkId,
    feeling.personalFeelingId,
  );
  const deleteReplyMutation = useDeletePersonalArtworkFeelingReply(
    personalArtworkId,
    feeling.personalFeelingId,
  );
  const isLikePending = likeMutation.isPending || likeReplyMutation.isPending;

  /* 개인 작품 답글 조회는 페이지네이션이 없어 한 번에 전부 불러옵니다. */
  const { data: repliesData } = usePersonalArtworkFeelingReplies(
    personalArtworkId,
    feeling.personalFeelingId,
  );

  const replies: CommentData[] = useMemo(
    () =>
      (repliesData?.replies ?? []).map((reply) => {
        const isMyComment = Boolean(myUserId) && reply.user?.userId === myUserId;
        return {
          id: String(reply.personalFeelingReplyId),
          author: reply.user?.nickname ?? '',
          avatarUrl: reply.user?.profileImageUrl,
          time: formatRelativeTime(reply.createdAt),
          content: reply.content,
          likeCount: reply.likeCount ?? 0,
          isLiked: reply.isLiked ?? false,
          isMyComment,
          canDelete: isMyComment || isOwner,
          images:
            reply.images && reply.images.length > 0
              ? reply.images.map((img) => img.imageUrl)
              : undefined,
        };
      }),
    [repliesData, myUserId, isOwner],
  );

  const isMyFeeling = Boolean(myUserId) && feeling.user?.userId === myUserId;
  const comment: CommentData = useMemo(
    () => ({
      id: String(feeling.personalFeelingId),
      author: feeling.user?.nickname ?? '',
      avatarUrl: feeling.user?.profileImageUrl,
      time: formatRelativeTime(feeling.createdAt),
      content: feeling.content,
      likeCount: feeling.likeCount ?? 0,
      isLiked: feeling.isLiked ?? false,
      isMyComment: isMyFeeling,
      canDelete: isMyFeeling || isOwner,
      replyCount: feeling.replyCount,
      images: feeling.images.length > 0 ? feeling.images.map((img) => img.imageUrl) : undefined,
    }),
    [feeling, isMyFeeling, isOwner],
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
        likeMutation.mutate(Number(commentId));
      }
    },
    [isLoggedIn, openLoginModal, likeReplyMutation, likeMutation],
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
        deleteMutation.mutate(Number(commentId));
      }
    },
    [isLoggedIn, openLoginModal, deleteReplyMutation, deleteMutation],
  );

  const handleToggleReplies = useCallback(() => setRepliesOpen((v) => !v), []);
  const handleReplyClick = useCallback(
    (commentId: string, author: string, highlightId: string) =>
      onReplyClick?.(Number(commentId), author, highlightId),
    [onReplyClick],
  );

  return (
    <>
      <CommentItem
        comment={comment}
        replies={replies}
        repliesOpen={repliesOpen}
        onToggleReplies={handleToggleReplies}
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
