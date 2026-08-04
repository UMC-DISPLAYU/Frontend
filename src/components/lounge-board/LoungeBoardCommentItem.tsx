import { useState } from 'react';

import { Heart } from 'lucide-react';

import defaultProfileIcon from '@/assets/DefaultProfileIcon.svg';
import {
  useDeleteLoungeComment,
  useLikeLoungeComment,
  useUnlikeLoungeComment,
} from '@/hooks/queries/useLoungeComments';
import { useLoungeReplies } from '@/hooks/queries/useLoungeReplies';
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { useLoungeCommentPolicy } from '@/hooks/usePolicy';
import type { LoungeBoardComment } from '@/types/exhibition';
import { formatLoungeTime } from '@/utils/date';
import { hasPermission } from '@/utils/hasPermission';

type Props = {
  postId: number;
  comment: LoungeBoardComment;
  isReply?: boolean;
  parentCommentId?: number;
  isDeleted?: boolean;
  onDelete?: () => void;
  onReplyClick?: (commentId: number, author: string, highlightId: number) => void;
  activeReplyId?: number | null;
};

export function LoungeBoardCommentItem({
  postId,
  comment,
  isReply = false,
  parentCommentId,
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
  const canLikeComment = hasPermission(loungeCommentPolicy, 'like');
  const canDeleteComment = hasPermission(loungeCommentPolicy, 'delete');

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
      images: reply.imageUrls.length > 0 ? reply.imageUrls : undefined,
    })) ?? []
  ).filter((reply) => !removedReplyIds.has(reply.id));

  const replyCount = comment.replyCount ?? 0;

  const handleLikeClick = () => {
    if (isLikeMutating) return;
    if (!canLikeComment) {
      openLoginModal();
      return;
    }

    if (comment.isLiked) {
      unlikeMutation.mutate({ postId, commentId, parentCommentId });
    } else {
      likeMutation.mutate({ postId, commentId, parentCommentId });
    }
  };

  const contentIndent = isReply ? 'pl-[72px]' : 'pl-9';

  // 하이라이트 박스는 프로필 사진 위로 12px, "답글달기" 아래로 12px 더 크게 번지되,
  // 같은 크기의 음수 margin으로 상쇄해서 실제 레이아웃(다음 요소와의 간격)은 그대로 유지한다.
  const bleedClasses = isComposingReply ? 'pt-3 -mt-3 pb-3 -mb-3' : '';

  return (
    <div className="w-full flex flex-col gap-2">
      <div
        className={`relative flex flex-col gap-2 -mx-5 px-5 ${bleedClasses} ${isComposingReply ? 'bg-box' : ''}`}
      >
        {isComposingReply && (
          <div className="absolute top-0 left-0 h-full w-[3px] rounded-r-full bg-[#8E8E93]" />
        )}
        <div className={`flex items-center gap-2 ${isReply ? 'pl-9' : ''}`}>
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

        <p className={`${contentIndent} typo-body-sm-regular text-sub600`}>
          {isDeleted ? '삭제된 글입니다.' : comment.content}
        </p>

        {!isDeleted && comment.images && comment.images.length > 0 && (
          <div className={`${contentIndent} flex gap-1 overflow-x-auto scrollbar-none`}>
            {comment.images.map((url) => (
              <div
                key={url}
                className="w-[106px] h-[129px] shrink-0 rounded-sm bg-gray-300 bg-cover bg-center"
                style={{ backgroundImage: `url(${url})` }}
              />
            ))}
          </div>
        )}

        <div className={`${contentIndent} flex items-center gap-2`}>
          {!isDeleted && (
            <button
              type="button"
              onClick={() =>
                onReplyClick?.(
                  isReply ? (parentCommentId ?? commentId) : commentId,
                  comment.author,
                  commentId,
                )
              }
              className={
                isComposingReply
                  ? 'text-[12px] font-bold text-[#3A3A3C]'
                  : 'typo-body-xs-regular text-faint'
              }
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
          {!isDeleted && canDeleteComment && (
            <button type="button" onClick={onDelete} className="typo-body-xs-regular text-faint">
              삭제
            </button>
          )}
        </div>
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
              activeReplyId={activeReplyId}
            />
          ))}
        </div>
      )}
      {loginModal}
    </div>
  );
}
