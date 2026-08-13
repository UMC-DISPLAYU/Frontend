import { memo, useState } from 'react';

import { Heart } from 'lucide-react';

import defaultProfileIcon from '@/assets/common/DefaultProfileIcon.svg';
import { cn } from '@/utils/cn';

import { ImageModal } from '../ImageModal';

import type { CommentData } from './types';

type IconSize = { width: number; height: number };

type Props = {
  comment: CommentData;
  isReply?: boolean;
  parentCommentId?: string;
  isDeleted?: boolean;
  replies?: CommentData[];
  repliesOpen?: boolean;
  onToggleReplies?: () => void;
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
  /* 줄마다 상하 12px 패딩으로 촘촘하게 쌓는 레이아웃. false면 gap 기반(간격 40px) 레이아웃. */
  tightSpacing?: boolean;
  /* tightSpacing일 때 각 줄 아래에 구분선을 그릴지 여부. */
  showDivider?: boolean;
  likeIconSize?: IconSize;
  replyLikeIconSize?: IconSize;
  /** 좋아요 버튼 위치 */
  likePosition?: 'bottom' | 'top-right';
};

const DEFAULT_LIKE_ICON_SIZE: IconSize = { width: 12, height: 17 };

export const CommentItem = memo(function CommentItem({
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
  likeIconSize = DEFAULT_LIKE_ICON_SIZE,
  replyLikeIconSize = DEFAULT_LIKE_ICON_SIZE,
  likePosition = 'bottom',
}: Props) {
  const iconSize = isReply ? replyLikeIconSize : likeIconSize;
  const commentId = comment.id;
  /*
   * 최상위 댓글/후기와 답글은 서로 다른 id 시퀀스(예: displayReviewId vs
   * displayReviewReplyId)를 쓰기 때문에 숫자가 우연히 겹칠 수 있다. activeReplyId를
   * comment.id와 그냥 비교하면 답글 하나에 답글달기를 눌렀는데 우연히 id가 같은
   * 부모 댓글까지 같이 하이라이트되는 문제가 생겨서, isReply까지 합친 키로 비교한다.
   */
  const highlightKey = isReply ? `reply-${commentId}` : `comment-${commentId}`;
  const isComposingReply = activeReplyId === highlightKey;
  const replyCount = comment.replyCount ?? 0;

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  /* avatarUrl이 없거나 로드에 실패해 기본 프로필 이미지로 대체된 경우에만 테두리를 그립니다. */
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const isDefaultAvatar = !comment.avatarUrl || avatarLoadFailed;

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

  // gap 기반 레이아웃(tightSpacing=false)은 기본 패딩이 없어서, 답글 작성 중 하이라이트일 때만
  // 음수 margin으로 상쇄하는 bleed 트릭으로 여백을 만든다. tightSpacing일 땐 각 줄에 항상
  // py-3가 있으므로 트릭 없이 배경색만 얹으면 된다.
  const bleedClasses = tightSpacing ? '' : isComposingReply ? 'pt-3 -mt-3 pb-3 -mb-3' : '';
  const dividerClasses = tightSpacing ? cn('py-3', showDivider && 'border-b border-line-soft') : '';

  return (
    <div className={cn('w-full flex flex-col', tightSpacing ? 'gap-0' : 'gap-2', className)}>
      <div
        className={cn(
          'relative flex flex-col -mx-5 px-5',
          dividerClasses,
          bleedClasses,
          isComposingReply && 'bg-box',
        )}
      >
        {isComposingReply && (
          <div className="absolute top-0 left-0 h-full w-[3px] rounded-r-full bg-[#8E8E93]" />
        )}
        <div className={cn('flex items-start gap-1.5', isReply && 'pl-9')}>
          <img
            alt=""
            className={cn(
              'size-7 rounded-full shrink-0 object-cover',
              isDefaultAvatar && 'border border-[#C4C4C4]',
            )}
            src={comment.avatarUrl || defaultProfileIcon}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = defaultProfileIcon;
              setAvatarLoadFailed(true);
            }}
          />

          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-baseline gap-2 min-w-0">
                <span className="typo-body-sm-bold text-main truncate">{comment.author}</span>
                <span className="typo-body-xs-regular text-hint shrink-0">{comment.time}</span>
              </div>
              {likePosition === 'top-right' && !isDeleted && (
                <button
                  type="button"
                  onClick={handleLikeClick}
                  disabled={isLikePending}
                  aria-pressed={comment.isLiked}
                  aria-label={`좋아요 ${comment.likeCount}개`}
                  className="flex items-center gap-1 disabled:opacity-50 shrink-0"
                >
                  <Heart
                    width={iconSize.width}
                    height={iconSize.height}
                    className={comment.isLiked ? 'fill-heart text-heart' : 'text-faint'}
                    strokeWidth={1.5}
                  />
                  <span className="typo-body-xs-regular text-faint">{comment.likeCount}</span>
                </button>
              )}
            </div>

            <div className="mt-1 flex flex-col gap-1">
              {!isDeleted && comment.images && comment.images.length > 0 && (
                <div className="flex gap-1 overflow-x-auto scrollbar-none">
                  {comment.images.map((url) => (
                    <button
                      key={url}
                      type="button"
                      className="w-[106px] h-[129px] shrink-0 rounded-sm bg-gray-300 bg-cover bg-center cursor-pointer"
                      style={{ backgroundImage: `url(${url})` }}
                      onClick={() => setSelectedImage(url)}
                      aria-label="이미지 크게 보기"
                    />
                  ))}
                </div>
              )}

              <p className="typo-body-sm-regular text-sub600">
                {isDeleted ? '삭제된 글입니다.' : comment.content}
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {!isDeleted && (
                  <button
                    type="button"
                    onClick={() =>
                      onReplyClick?.(
                        isReply ? (parentCommentId ?? commentId) : commentId,
                        comment.author,
                        highlightKey,
                      )
                    }
                    className={
                      isComposingReply
                        ? 'typo-body-xs-bold text-[#3A3A3C]'
                        : 'typo-body-xs-regular text-hint'
                    }
                  >
                    답글달기
                  </button>
                )}
                {!isReply && replyCount > 0 && (
                  <button
                    type="button"
                    onClick={() => onToggleReplies?.()}
                    className="typo-body-xs-regular text-hint"
                  >
                    댓글{replyCount}
                  </button>
                )}
                {!isDeleted && (comment.canDelete ?? comment.isMyComment) && (
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="typo-body-xs-regular text-hint"
                  >
                    삭제
                  </button>
                )}
              </div>

              {likePosition === 'bottom' && !isDeleted && (
                <button
                  type="button"
                  onClick={handleLikeClick}
                  disabled={isLikePending}
                  aria-pressed={comment.isLiked}
                  aria-label={`좋아요 ${comment.likeCount}개`}
                  className="flex min-w-[28px] items-center gap-1 disabled:opacity-50"
                >
                  <Heart
                    width={iconSize.width}
                    height={iconSize.height}
                    className={cn(
                      'shrink-0',
                      comment.isLiked ? 'fill-heart text-heart' : 'text-hint',
                    )}
                    strokeWidth={1}
                  />
                  <span className="typo-body-xs-regular text-hint">{comment.likeCount}</span>
                </button>
              )}
            </div>
          </div>
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
              likeIconSize={likeIconSize}
              replyLikeIconSize={replyLikeIconSize}
              likePosition={likePosition}
            />
          ))}
          {hasMoreReplies && (
            <button
              type="button"
              onClick={() => onLoadMoreReplies?.()}
              disabled={isLoadingMoreReplies}
              className={cn(
                '-mx-5 w-[calc(100%+2.5rem)] pl-[90px] typo-body-xs-regular text-hint disabled:opacity-50 text-left',
                dividerClasses,
              )}
            >
              {isLoadingMoreReplies ? '댓글 불러오는 중...' : '댓글 더보기'}
            </button>
          )}
        </div>
      )}

      <ImageModal
        imageUrl={selectedImage}
        isOpen={selectedImage !== null}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
});
