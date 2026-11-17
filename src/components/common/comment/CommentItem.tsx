import { memo, useEffect, useRef, useState } from 'react';

import { Heart } from 'lucide-react';

import { cn } from '@/utils/cn';

import { ImageModal } from '../ImageModal';
import { OptimizedImage } from '../OptimizedImage';
import { ProfileAvatar } from '../ProfileAvatar';

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
  /* 넘기면 지울 수 없는 남의 글 더보기 메뉴에 신고하기가 생긴다 */
  onReport?: (commentId: string, parentCommentId?: string) => void;
  onReplyClick?: (commentId: string, author: string, highlightId: string) => void;
  activeReplyId?: string | null;
  className?: string;
};

const ACTION_TEXT_CLASS = 'typography-body-md-medium text-secondary';

/* 프로토타입 i-dots: 24 칸에 채운 점 3개(지름 3.4), 글자색을 따른다 */
function DotsIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-current">
      <circle cx="5.5" cy="12" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="18.5" cy="12" r="1.7" />
    </svg>
  );
}

/*
 * 프로토타입 .dots · .menu(후기 · 방명록 같음): 32 원형 버튼(호버 #f0f0f3), 메뉴는 이름 줄 아래 36 · 오른쪽 끝에 맞춘다.
 * 감싼 칸이 -6 만큼 오른쪽으로 나가 있어 메뉴를 그만큼(right 6) 안으로 당기고, 위로 -4 나가 있어 top 은 40 이다
 */
function CommentMoreMenu({ label, onSelect }: { label: string; onSelect: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // 프로토타입처럼 메뉴를 열면 첫 항목으로 포커스를 옮긴다
    itemRef.current?.focus();

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
        className="grid size-8 cursor-pointer place-items-center rounded-circle text-[#18181b] transition-colors duration-fast ease-standard hover:bg-[#f0f0f3] focus-visible:outline-2 focus-visible:outline-focus"
      >
        <DotsIcon />
      </button>
      {isOpen && (
        <div
          role="menu"
          className="absolute top-10 right-1.5 z-10 min-w-28 rounded-12 border border-[#f0f0f3] bg-[#fff] p-1 shadow-[0_5px_50px_rgba(0,0,0,0.07)]"
        >
          <button
            ref={itemRef}
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              onSelect();
            }}
            className="h-10 w-full cursor-pointer rounded-8 px-3 text-left text-[14px] leading-[1.4] font-medium tracking-[-0.03em] text-[#18181b] transition-colors duration-fast ease-standard hover:bg-[#f0f0f3] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus"
          >
            {label}
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
  onReport,
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
          <ProfileAvatar className="size-8" displayWidth={32} src={comment.avatarUrl} />

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
              {canDelete ? (
                <CommentMoreMenu
                  label="삭제하기"
                  onSelect={() => onDelete?.(commentId, isReply ? parentCommentId : undefined)}
                />
              ) : (
                onReport && (
                  <CommentMoreMenu
                    label="신고하기"
                    onSelect={() => onReport(commentId, isReply ? parentCommentId : undefined)}
                  />
                )
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
              onReport={onReport}
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
