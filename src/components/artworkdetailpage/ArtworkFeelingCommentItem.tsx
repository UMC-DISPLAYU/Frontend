import { useState } from 'react';

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
import { formatRelativeTime } from '@/utils/date';

type Props = {
  artworkId: number;
  feeling: ArtworkFeelingDto;
  myUserId?: number;
  onReplyClick?: (commentId: number, author: string, highlightId: number) => void;
  activeReplyId?: number | null;
};

export function ArtworkFeelingCommentItem({
  artworkId,
  feeling,
  myUserId,
  onReplyClick,
  activeReplyId = null,
}: Props) {
  const [repliesOpen, setRepliesOpen] = useState(false);

  const isComposingReply = activeReplyId === feeling.feelingId;
  const [prevIsComposingReply, setPrevIsComposingReply] = useState(isComposingReply);
  if (isComposingReply !== prevIsComposingReply) {
    setPrevIsComposingReply(isComposingReply);
    if (isComposingReply) setRepliesOpen(true);
  }

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

  const replies: CommentData[] = (repliesData?.pages.flatMap((p) => p.replies) ?? []).map(
    (reply) => ({
      id: String(reply.feelingReplyId ?? 0),
      author: reply.user?.nickname ?? '',
      time: formatRelativeTime(reply.createdAt),
      content: reply.content,
      likeCount: reply.likeCount ?? 0,
      isLiked: false, // 목록 API에 "내가 눌렀는지"는 안 내려옴 (개수만 내려옴)
      isMyComment: Boolean(myUserId) && reply.user?.userId === myUserId,
    }),
  );

  const comment: CommentData = {
    id: String(feeling.feelingId),
    author: feeling.user?.nickname ?? '',
    time: formatRelativeTime(feeling.createdAt),
    content: feeling.content,
    likeCount: feeling.likeCount,
    isLiked: false, // 목록 API에 "내가 눌렀는지"는 안 내려옴 (개수만 내려옴)
    isMyComment: Boolean(myUserId) && (feeling.user?.userId ?? feeling.userId) === myUserId,
    replyCount: feeling.replyCount,
    images:
      feeling.images && feeling.images.length > 0
        ? feeling.images.map((img) => img.imageUrl)
        : undefined,
  };

  const handleLike = (commentId: string, parentCommentId?: string) => {
    if (parentCommentId) {
      likeReplyMutation.mutate(Number(commentId));
    } else {
      likeMutation.mutate({ artworkId, feelingId: Number(commentId) });
    }
  };

  const handleDelete = (commentId: string, parentCommentId?: string) => {
    if (parentCommentId) {
      deleteReplyMutation.mutate(Number(commentId));
    } else {
      deleteMutation.mutate({ artworkId, feelingId: Number(commentId) });
    }
  };

  return (
    <CommentItem
      comment={comment}
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
        onReplyClick?.(Number(commentId), author, Number(highlightId))
      }
      activeReplyId={activeReplyId !== null ? String(activeReplyId) : null}
      tightSpacing
      showDivider
    />
  );
}
