import { memo, useEffect, useRef, useState } from 'react';

import { Heart } from 'lucide-react';

import dotsIcon from '@/assets/comment/DotsIcon.svg';
import userIcon from '@/assets/comment/UserIcon.svg';
import { cn } from '@/utils/cn';

import { ImageModal } from '../ImageModal';
import { OptimizedImage } from '../OptimizedImage';

import type { CommentData } from './types';

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
};

const ACTION_TEXT_CLASS = 'typography-body-md-medium text-secondary';

function CommentAvatar({ url }: { url?: string | null }) {
  const [loadFailed, setLoadFailed] = useState(false);

  if (url && !loadFailed) {
    return (
      <img
        alt=""
        src={url}
        className="size-8 shrink-0 rounded-circle object-cover"
        onError={() => setLoadFailed(true)}
      />
    );
  }

  return (
    <span className="relative size-8 shrink-0 overflow-hidden rounded-circle bg-tertiary">
      <span className="absolute top-[calc(50%+3px)] right-[-3.13%] left-[-3.13%] aspect-square -translate-y-1/2">
        <img alt="" src={userIcon} className="absolute inset-[12.5%_15%_10%_15%] size-auto" />
      </span>
    </span>
  );
}

function CommentMoreMenu({ onDelete }: { onDelete: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('pointerdown', closeOnOutsidePress);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePress);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative -my-1 -mr-1.5 ml-auto shrink-0">
      <button
        type="button"
        aria-label="더보기"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="grid size-8 cursor-pointer place-items-center rounded-circle transition-colors duration-fast ease-standard hover:bg-tertiary focus-visible:outline-2 focus-visible:outline-focus"
      >
        <img alt="" src={dotsIcon} className="max-w-none" />
      </button>
      {isOpen && (
        <div
          role="menu"
          className="absolute top-9 right-0 z-10 min-w-28 rounded-12 border border-bg-tertiary bg-primary-white p-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              onDelete();
            }}
            className="typography-body-lg-medium h-10 w-full cursor-pointer rounded-8 px-3 text-left text-primary transition-colors duration-fast ease-standard hover:bg-tertiary"
          >
            삭제하기
          </button>
        </div>
      )}
    </div>
  );
}

function CommentPhotos({ urls, onOpen }: { urls: string[]; onOpen: (url: string) => void }) {
  // 4장 이상이면 3장 + 4번째가 조금 보여서 옆으로 넘길 수 있다는 걸 알린다
  const isScrollable = urls.length > 3;

  return (
    <div
      className={cn(
        'mt-2 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        isScrollable && '-mr-5 snap-x snap-proximity pr-5 desktop:mr-0 desktop:pr-0',
      )}
    >
      {urls.map((url) => (
        <button
          key={url}
          type="button"
          aria-label="이미지 크게 보기"
          onClick={() => onOpen(url)}
          className={cn(
            'min-w-24 shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-focus',
            isScrollable
              ? 'basis-[calc((100%-30px)/3)] snap-start desktop:basis-[calc((100%-50px)/3)]'
              : 'basis-[calc((100%-16px)/3)]',
          )}
        >
          <OptimizedImage
            src={url}
            displayWidth={240}
            alt="댓글 이미지"
            skeleton
            frameClassName="aspect-5/6 w-full bg-secondary"
          />
        </button>
      ))}
    </div>
  );
}

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
}: Props) {
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

  const trimmedContent = comment.content?.trim() ?? '';
  // 사진·그림만 올린 글은 서버 필수값을 채우려고 '.'으로 저장된다
  const hasText = trimmedContent.length > 0 && trimmedContent !== '.';
  const canDelete = comment.canDelete ?? comment.isMyComment;

  const handleLikeClick = () => {
    if (isLikePending) return;
    const parentId = isReply ? parentCommentId : undefined;
    if (comment.isLiked) {
      onUnlike?.(commentId, parentId);
    } else {
      onLike?.(commentId, parentId);
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {isDeleted ? (
        <p className="typography-body-lg-regular pt-5 pl-11 text-tertiary">삭제된 댓글이에요</p>
      ) : (
        <div
          className={cn(
            'flex gap-3 pt-4 pb-2 transition-colors duration-fast ease-standard',
            isComposingReply && '-mx-2 rounded-8 bg-secondary px-2',
          )}
        >
          <CommentAvatar url={comment.avatarUrl} />

          <div className="min-w-0 flex-1">
            <div className="flex min-h-6 items-center gap-2">
              <span className="typography-body-lg-semibold min-w-0 truncate text-primary">
                {comment.author}
              </span>
              {comment.authorLabel && (
                <span className="typography-body-sm-medium shrink-0 rounded-4 bg-secondary px-1.5 py-0.5 text-secondary">
                  {comment.authorLabel}
                </span>
              )}
              <span className="typography-body-md-medium shrink-0 text-tertiary">
                {comment.time}
              </span>
              {canDelete && (
                <CommentMoreMenu
                  onDelete={() => onDelete?.(commentId, isReply ? parentCommentId : undefined)}
                />
              )}
            </div>

            {comment.images && comment.images.length > 0 && (
              <CommentPhotos urls={comment.images} onOpen={setSelectedImage} />
            )}

            {hasText && (
              <p className="typography-body-lg-regular mt-2 break-words whitespace-pre-line text-primary">
                {comment.content}
              </p>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleLikeClick}
                disabled={isLikePending}
                aria-pressed={comment.isLiked}
                aria-label={`좋아요 ${comment.likeCount}개`}
                className="flex h-8 cursor-pointer items-center gap-1 pr-1 disabled:opacity-50"
              >
                <Heart
                  size={16}
                  strokeWidth={1.7}
                  className={cn(
                    'shrink-0 text-icon-primary transition-transform duration-base ease-standard',
                    comment.isLiked && 'scale-112 fill-current',
                  )}
                />
                <span className={ACTION_TEXT_CLASS}>{comment.likeCount}</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  onReplyClick?.(
                    isReply ? (parentCommentId ?? commentId) : commentId,
                    comment.author,
                    highlightKey,
                  )
                }
                className={cn(ACTION_TEXT_CLASS, 'h-8 cursor-pointer pr-1')}
              >
                답글 달기
              </button>
            </div>
          </div>
        </div>
      )}

      {!isReply && repliesOpen && replies.length > 0 && (
        <div className="ml-6">
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
            />
          ))}
        </div>
      )}

      {!isReply && repliesOpen && hasMoreReplies && (
        <button
          type="button"
          onClick={() => onLoadMoreReplies?.()}
          disabled={isLoadingMoreReplies}
          className={cn(
            ACTION_TEXT_CLASS,
            'mt-1 ml-11 block h-8 cursor-pointer disabled:opacity-50',
          )}
        >
          {isLoadingMoreReplies ? '답글 불러오는 중...' : '답글 더 보기'}
        </button>
      )}

      {!isReply && replyCount > 0 && (
        <button
          type="button"
          onClick={() => onToggleReplies?.()}
          aria-expanded={repliesOpen}
          className={cn(ACTION_TEXT_CLASS, 'mt-1 ml-11 block h-8 cursor-pointer')}
        >
          {repliesOpen ? '답글 접기' : `답글 ${replyCount}개 더 보기`}
        </button>
      )}

      <ImageModal
        imageUrl={selectedImage}
        isOpen={selectedImage !== null}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
});
