import { useState } from 'react';

import { Heart } from 'lucide-react';

import defaultProfileIcon from '@/assets/DefaultProfileIcon.svg';
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
  isReply?: boolean;
  parentCommentId?: number;
  isDeleted?: boolean;
  onDelete?: () => void;
  onReplyClick?: (commentId: number, author: string) => void;
  isComposingReply?: boolean;
};

export function LoungeBoardCommentItem({
  postId,
  comment,
  isReply = false,
  parentCommentId,
  isDeleted = false,
  onDelete,
  onReplyClick,
  isComposingReply = false,
}: Props) {
  const [repliesOpen, setRepliesOpen] = useState(false);
  const [removedReplyIds, setRemovedReplyIds] = useState<Set<string>>(new Set());
  const commentId = Number(comment.id);

  const [prevIsComposingReply, setPrevIsComposingReply] = useState(isComposingReply);
  if (isComposingReply !== prevIsComposingReply) {
    setPrevIsComposingReply(isComposingReply);
    if (isComposingReply) setRepliesOpen(true);
  }

  const likeMutation = useLikeLoungeComment();
  const unlikeMutation = useUnlikeLoungeComment();
  const deleteReplyMutation = useDeleteLoungeComment();
  const isLikeMutating = likeMutation.isPending || unlikeMutation.isPending;

  const { data: repliesData } = useLoungeReplies(
    commentId,
    {},
    { enabled: !isReply && repliesOpen },
  );

  const replies: LoungeBoardComment[] = (
    repliesData?.replies.map((reply) => ({
      id: String(reply.loungeCommentId),
      author: reply.writer.nickname,
      time: formatLoungeTime(reply.createdAt),
      content: reply.content,
      likeCount: reply.likeCount,
      isLiked: reply.isLiked,
      isMyComment: reply.isMyComment,
    })) ?? []
  ).filter((reply) => !removedReplyIds.has(reply.id));

  const replyCount = comment.replyCount ?? 0;

  const handleLikeClick = () => {
    if (isLikeMutating) return;
    if (comment.isLiked) {
      unlikeMutation.mutate({ postId, commentId, parentCommentId });
    } else {
      likeMutation.mutate({ postId, commentId, parentCommentId });
    }
  };

  return (
    <div className={`w-full flex flex-col gap-2 ${isReply ? 'pl-9' : ''}`}>
      <div className="flex items-center gap-2">
        <img alt="" className="size-7 rounded-full shrink-0" src={defaultProfileIcon} />
        <div className="flex-1 flex items-center gap-2">
          <span className="typo-body-sm-semibold text-main">{comment.author}</span>
          <span className="typo-body-xs-regular text-hint">{comment.time}</span>
        </div>
        {!isDeleted && (
          <button
            type="button"
            onClick={handleLikeClick}
            disabled={isLikeMutating}
            className="w-10 h-7 px-2 py-1 rounded-sm flex items-center justify-center gap-0.5 disabled:opacity-50"
          >
            <Heart
              className={`size-3 ${comment.isLiked ? 'fill-heart text-heart' : 'text-faint'}`}
              strokeWidth={1.5}
            />
            <span className="typo-body-xs-regular text-faint">{comment.likeCount}</span>
          </button>
        )}
      </div>

      <p className="pl-9 typo-body-sm-regular text-sub600">
        {isDeleted ? '삭제된 글입니다.' : comment.content}
      </p>

      <div className="pl-9 flex items-center gap-2">
        {!isDeleted && (
          <button
            type="button"
            onClick={() =>
              onReplyClick?.(isReply ? (parentCommentId ?? commentId) : commentId, comment.author)
            }
            className="typo-body-xs-regular text-faint"
          >
            답글달기
          </button>
        )}
        {!isReply && replyCount > 0 && (
          <button
            type="button"
            onClick={() => setRepliesOpen((v) => !v)}
            className="typo-body-xs-regular text-faint"
          >
            댓글{replyCount}
          </button>
        )}
        {!isDeleted && comment.isMyComment && (
          <button type="button" onClick={onDelete} className="typo-body-xs-regular text-faint">
            삭제
          </button>
        )}
      </div>

      {!isReply && repliesOpen && replies.length > 0 && (
        <div className="mt-[32px] flex flex-col gap-[40px]">
          {replies.map((reply) => (
            <LoungeBoardCommentItem
              key={reply.id}
              postId={postId}
              comment={reply}
              isReply
              parentCommentId={commentId}
              onDelete={() => {
                deleteReplyMutation.mutate({
                  postId,
                  commentId: Number(reply.id),
                  parentCommentId: commentId,
                });
                setRemovedReplyIds((prev) => new Set(prev).add(reply.id));
              }}
              onReplyClick={onReplyClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
