import { useState } from 'react';

import type { CommentData } from '@/components/common';
import { CommentItem } from '@/components/common';
import {
  useDeleteLoungeComment,
  useLikeLoungeComment,
  useUnlikeLoungeComment,
} from '@/hooks/queries/useLoungeComments';
import { useLoungeReplies } from '@/hooks/queries/useLoungeReplies';
import type { LoungeBoardComment } from '@/types/exhibition';
import { formatLoungeTime } from '@/utils/date';

type Props = {
  postId: number;
  comment: LoungeBoardComment;
  isDeleted?: boolean;
  onDelete?: () => void;
  onReplyClick?: (commentId: number, author: string, highlightId: number) => void;
  activeReplyId?: number | null;
};

export function LoungeBoardCommentItem({
  postId,
  comment,
  isDeleted = false,
  onDelete,
  onReplyClick,
  activeReplyId = null,
}: Props) {
  const [repliesOpen, setRepliesOpen] = useState(false);
  const [removedReplyIds, setRemovedReplyIds] = useState<Set<string>>(new Set());
  const commentId = Number(comment.id);
  const isComposingReply = activeReplyId === commentId;

  const [prevIsComposingReply, setPrevIsComposingReply] = useState(isComposingReply);
  if (isComposingReply !== prevIsComposingReply) {
    setPrevIsComposingReply(isComposingReply);
    if (isComposingReply) setRepliesOpen(true);
  }

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

  const replies: CommentData[] = (
    repliesData?.pages
      .flatMap((page) => page.replies)
      .map((reply) => ({
        id: String(reply.loungeCommentId),
        author: reply.writer.nickname,
        avatarUrl: reply.writer.profileImageUrl,
        time: formatLoungeTime(reply.createdAt),
        content: reply.content,
        likeCount: reply.likeCount,
        isLiked: reply.isLiked,
        isMyComment: reply.isMyComment,
        images: reply.imageUrls.length > 0 ? reply.imageUrls : undefined,
      })) ?? []
  ).filter((reply) => !removedReplyIds.has(reply.id));

  const handleLike = (targetCommentId: string, parentCommentId?: string) => {
    likeMutation.mutate({
      postId,
      commentId: Number(targetCommentId),
      parentCommentId: parentCommentId ? Number(parentCommentId) : undefined,
    });
  };

  const handleUnlike = (targetCommentId: string, parentCommentId?: string) => {
    unlikeMutation.mutate({
      postId,
      commentId: Number(targetCommentId),
      parentCommentId: parentCommentId ? Number(parentCommentId) : undefined,
    });
  };

  const handleDelete = (targetCommentId: string, parentCommentId?: string) => {
    if (!parentCommentId) {
      onDelete?.();
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
  };

  return (
    <CommentItem
      comment={comment}
      isDeleted={isDeleted}
      replies={replies}
      repliesOpen={repliesOpen}
      onToggleReplies={() => setRepliesOpen((v) => !v)}
      hasMoreReplies={hasMoreReplies}
      onLoadMoreReplies={() => fetchMoreReplies()}
      isLoadingMoreReplies={isFetchingMoreReplies}
      onLike={handleLike}
      onUnlike={handleUnlike}
      isLikePending={isLikeMutating}
      onDelete={handleDelete}
      onReplyClick={(replyCommentId, author, highlightId) =>
        onReplyClick?.(Number(replyCommentId), author, Number(highlightId))
      }
      activeReplyId={activeReplyId !== null ? String(activeReplyId) : null}
      tightSpacing
    />
  );
}
