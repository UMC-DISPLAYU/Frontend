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

const formatRelativeTime = (createdAt: string) => {
  const diff = Date.now() - new Date(createdAt).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
};

type Props = {
  postId: number;
  comment: LoungeBoardComment;
  isReply?: boolean;
  parentCommentId?: number;
  onDelete?: () => void;
  onReplyClick?: (commentId: number, author: string) => void;
  isComposingReply?: boolean;
};

export function LoungeBoardCommentItem({
  postId,
  comment,
  isReply = false,
  parentCommentId,
  onDelete,
  onReplyClick,
  isComposingReply = false,
}: Props) {
  const [repliesOpen, setRepliesOpen] = useState(false);
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

  const replies: LoungeBoardComment[] =
    repliesData?.replies.map((reply) => ({
      id: String(reply.loungeCommentId),
      author: reply.writer.nickname,
      time: formatRelativeTime(reply.createdAt),
      content: reply.content,
      likeCount: reply.likeCount,
      isLiked: reply.isLiked,
      isMyComment: reply.isMyComment,
    })) ?? [];

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
      </div>

      <p className="pl-9 typo-body-sm-regular text-sub600">{comment.content}</p>

      <div className="pl-9 flex items-center gap-2">
        <button
          type="button"
          onClick={() =>
            onReplyClick?.(isReply ? (parentCommentId ?? commentId) : commentId, comment.author)
          }
          className="typo-body-xs-regular text-faint"
        >
          답글달기
        </button>
        {!isReply && replyCount > 0 && (
          <button
            type="button"
            onClick={() => setRepliesOpen((v) => !v)}
            className="typo-body-xs-regular text-faint"
          >
            댓글{replyCount}
          </button>
        )}
        {comment.isMyComment && (
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
              onDelete={() =>
                deleteReplyMutation.mutate({
                  postId,
                  commentId: Number(reply.id),
                  parentCommentId: commentId,
                })
              }
              onReplyClick={onReplyClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
