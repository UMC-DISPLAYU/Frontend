import { Heart } from 'lucide-react';

import defaultProfileIcon from '@/assets/DefaultProfileIcon.svg';
import { cn } from '@/utils/cn';

import type { CommentData } from './types';

type Props = {
  comment: CommentData;
  isReply?: boolean;
  parentCommentId?: string;
  isDeleted?: boolean;
  replies?: CommentData[];
  repliesOpen?: boolean;
  onToggleReplies?: () => void;
  /** 답글이 더 있어서 "댓글 더보기" 버튼을 보여줄지 여부. */
  hasMoreReplies?: boolean;
  onLoadMoreReplies?: () => void;
  isLoadingMoreReplies?: boolean;
  onLike?: (commentId: string, parentCommentId?: string) => void;
  onUnlike?: (commentId: string, parentCommentId?: string) => void;
  isLikePending?: boolean;
  onDelete?: (commentId: string, parentCommentId?: string) => void;
  onReplyClick?: (commentId: string, author: string, highlightId: string) => void;
  activeReplyId?: string | null;
  className?: string;
  /** 줄마다 상하 12px 패딩으로 촘촘하게 쌓는 레이아웃. false면 gap 기반(간격 40px) 레이아웃. */
  tightSpacing?: boolean;
  /** tightSpacing일 때 각 줄 아래에 구분선을 그릴지 여부. */
  showDivider?: boolean;
};

export function CommentItem({
  comment,
  isReply = false,
  parentCommentId,
  isDeleted = false,
  replies = [],
  repliesOpen = false,
  onToggleReplies,
  hasMoreReplies = false,
  onLoadMoreReplies,
  isLoadingMoreReplies = false,
  onLike,
  onUnlike,
  isLikePending = false,
  onDelete,
  onReplyClick,
  activeReplyId = null,
  className,
  tightSpacing = false,
  showDivider = false,
}: Props) {
  const commentId = comment.id;
  const isComposingReply = activeReplyId === commentId;
  const replyCount = comment.replyCount ?? 0;

  const handleLikeClick = () => {
    if (isLikePending) return;
    const parentId = isReply ? parentCommentId : undefined;
    if (comment.isLiked) {
      onUnlike?.(commentId, parentId);
    } else {
      onLike?.(commentId, parentId);
    }
  };

  const handleDeleteClick = () => {
    onDelete?.(commentId, isReply ? parentCommentId : undefined);
  };

  const contentIndent = isReply ? 'pl-[72px]' : 'pl-9';

  // gap 기반 레이아웃(tightSpacing=false)은 기본 패딩이 없어서, 답글 작성 중 하이라이트일 때만
  // 음수 margin으로 상쇄하는 bleed 트릭으로 여백을 만든다. tightSpacing일 땐 각 줄에 항상
  // py-3가 있으므로 트릭 없이 배경색만 얹으면 된다.
  const bleedClasses = tightSpacing ? '' : isComposingReply ? 'pt-3 -mt-3 pb-3 -mb-3' : '';
  const dividerClasses = tightSpacing ? cn('py-3', showDivider && 'border-b border-line-soft') : '';

  return (
    <div className={cn('w-full flex flex-col', tightSpacing ? 'gap-0' : 'gap-2', className)}>
      <div
        className={`relative flex flex-col gap-2 -mx-5 px-5 ${dividerClasses} ${bleedClasses} ${isComposingReply ? 'bg-box' : ''}`}
      >
        {isComposingReply && (
          <div className="absolute top-0 left-0 h-full w-[3px] rounded-r-full bg-[#8E8E93]" />
        )}
        <div className={`flex items-center gap-2 ${isReply ? 'pl-9' : ''}`}>
          <img
            alt=""
            className="size-7 rounded-full shrink-0 object-cover"
            src={comment.avatarUrl || defaultProfileIcon}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = defaultProfileIcon;
            }}
          />
          <div className="flex-1 flex items-center gap-2">
            <span className="typo-body-sm-semibold text-main">{comment.author}</span>
            <span className="typo-body-xs-regular text-hint">{comment.time}</span>
          </div>
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

        <div className={`${contentIndent} flex items-center justify-between gap-2`}>
          <div className="flex items-center gap-2">
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
                onClick={() => onToggleReplies?.()}
                className="typo-body-xs-regular text-faint"
              >
                댓글{replyCount}
              </button>
            )}
            {!isDeleted && (comment.canDelete ?? comment.isMyComment) && (
              <button
                type="button"
                onClick={handleDeleteClick}
                className="typo-body-xs-regular text-faint"
              >
                삭제
              </button>
            )}
          </div>

          {!isDeleted && (
            <button
              type="button"
              onClick={handleLikeClick}
              disabled={isLikePending}
              aria-pressed={comment.isLiked}
              aria-label={`좋아요 ${comment.likeCount}개`}
              className="flex items-center gap-1 disabled:opacity-50"
            >
              <Heart
                className={`size-3.5 ${comment.isLiked ? 'fill-heart text-heart' : 'text-faint'}`}
                strokeWidth={1.5}
              />
              <span className="typo-body-xs-regular text-faint">{comment.likeCount}</span>
            </button>
          )}
        </div>
      </div>

      {!isReply && repliesOpen && replies.length > 0 && (
        <div className={tightSpacing ? 'flex flex-col' : 'mt-[32px] flex flex-col gap-[40px]'}>
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              isReply
              parentCommentId={commentId}
              onLike={onLike}
              onUnlike={onUnlike}
              isLikePending={isLikePending}
              onDelete={onDelete}
              onReplyClick={onReplyClick}
              activeReplyId={activeReplyId}
              tightSpacing={tightSpacing}
              showDivider={showDivider}
            />
          ))}
          {hasMoreReplies && (
            <button
              type="button"
              onClick={() => onLoadMoreReplies?.()}
              disabled={isLoadingMoreReplies}
              className="pl-9 typo-body-xs-regular text-faint disabled:opacity-50 text-left"
            >
              {isLoadingMoreReplies ? '댓글 불러오는 중...' : '댓글 더보기'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
