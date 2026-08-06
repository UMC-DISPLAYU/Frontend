import { useEffect, useRef, useState } from 'react';

import { Heart } from 'lucide-react';

import type {
  DisplayDetailDto,
  DisplayReviewDto,
  DisplayReviewReplyDto,
} from '@/api/dto/display.dto';
import { BottomCommentBar } from '@/components/common';
import { FALLBACK_PROFILE_IMAGE } from '@/constants';
import {
  useCreateDisplayReviewReply,
  useDeleteDisplayReviewReply,
  useDisplayReviewReplies,
  useToggleDisplayReviewReplyLike,
} from '@/hooks/queries/useDisplayReviewReplies';
import {
  useCreateDisplayReview,
  useDeleteDisplayReview,
  useDisplayReviews,
  useToggleDisplayReviewLike,
} from '@/hooks/queries/useDisplayReviews';
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { useDisplayReviewPolicy, useDisplayReviewReplyPolicy } from '@/hooks/usePolicy';
import { cn } from '@/utils/cn';
import { hasPermission } from '@/utils/hasPermission';

// ─── 날짜/시간 포맷 (24시간 미만: N시간, 24시간 이상: YYYY.MM.DD) ─────────────

function formatDateOrTime(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours >= 0 && diffHours < 24) {
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins <= 1 ? '방금 전' : `${diffMins}분`;
    }
    return `${diffHours}시간`;
  }

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

// ─── 단일 후기 댓글 (답글) 아이템 ───────────────────────────────────────────────

function ReplyItem({
  reply,
  canLike,
  display,
  openLoginModal,
  onLike,
  onDelete,
}: {
  reply: DisplayReviewReplyDto;
  canLike: boolean;
  display: DisplayDetailDto;
  openLoginModal: () => void;
  onLike?: () => void;
  onDelete?: () => void;
}) {
  const replyPolicy = useDisplayReviewReplyPolicy(display, reply);
  const canDelete = hasPermission(replyPolicy, 'reply.delete');

  const handleLike = () => {
    if (!canLike) {
      openLoginModal();
      return;
    }

    onLike?.();
  };

  const handleDelete = () => {
    if (!canDelete) return;

    onDelete?.();
  };

  return (
    <div className="-mx-5 pl-14 pr-5 py-3 border-b border-line">
      <div className="w-full inline-flex justify-start items-start gap-1.5">
        {/* 아바타 (size-7 = 28px) */}
        <div className="size-7 relative bg-box rounded-full border border-line overflow-hidden shrink-0">
          <img
            src={reply.user?.profileImageUrl || FALLBACK_PROFILE_IMAGE}
            alt={reply.user?.nickname || '사용자'}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = FALLBACK_PROFILE_IMAGE;
            }}
          />
        </div>

        {/* 컨텐츠 */}
        <div className="flex-1 inline-flex flex-col justify-start items-start gap-3 min-w-0">
          <div className="w-full flex flex-col justify-start items-start gap-1">
            <div className="w-full h-5 inline-flex justify-start items-center gap-2">
              <div className="flex justify-start items-center gap-2">
                <span className="typo-body-sm-bold text-main">{reply.user?.nickname}</span>
                {reply.isTeamMember && (
                  <span className="typo-body-xs-regular text-faint">전시팀원</span>
                )}
                <span className="typo-body-xs-regular text-faint">
                  {formatDateOrTime(reply.createdAt)}
                </span>
              </div>
            </div>

            <p className="w-full typo-body-xs-regular text-sub600 wrap-break-word whitespace-pre-line">
              {reply.content}
            </p>
          </div>

          <div className="w-full inline-flex justify-between items-center typo-body-xs-regular text-faint">
            <div className="flex items-center gap-2">
              {canDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="hover:text-main cursor-pointer"
                >
                  삭제
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleLike}
              id={`reply-like-${reply.displayReviewReplyId}`}
              className="flex items-center gap-1 hover:text-main text-faint cursor-pointer"
            >
              <Heart size={14} className="fill-none text-sub700" />
              <span>{reply.likeCount ?? 0}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 단일 후기 카드 ──────────────────────────────────────────────────────────

function ReviewCard({
  display,
  displayId,
  review,
  isReplyTarget = false,
  showReplies: showRepliesProp,
  canLike,
  canLikeReply,
  openLoginModal,
  onLike,
  onDelete,
  onReply,
}: {
  display: DisplayDetailDto;
  displayId: number;
  review: DisplayReviewDto;
  /* 하단 입력바가 이 후기를 답글 대상으로 잡고 있는지 여부 */
  isReplyTarget?: boolean;
  showReplies?: boolean;
  canLike: boolean;
  canLikeReply: boolean;
  openLoginModal: () => void;
  onLike?: () => void;
  onDelete?: () => void;
  onReply?: () => void;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const images = review.images ?? [];
  const reviewPolicy = useDisplayReviewPolicy(display, review);
  const canDelete = hasPermission(reviewPolicy, 'delete');

  const deleteReply = useDeleteDisplayReviewReply(displayId, review.displayReviewId);
  const likeReply = useToggleDisplayReviewReplyLike(displayId, review.displayReviewId);

  const handleLike = () => {
    if (!canLike) {
      openLoginModal();
      return;
    }

    onLike?.();
  };

  const handleDelete = () => {
    if (!canDelete) return;

    onDelete?.();
  };

  /* 답글을 남긴 직후에는 상위에서 목록을 펼치도록 신호를 보냅니다. */
  const repliesOpen = showReplies || showRepliesProp === true;

  const {
    data: repliesData,
    isPending: isRepliesPending,
    hasNextPage: hasMoreReplies,
    fetchNextPage: fetchMoreReplies,
    isFetchingNextPage: isFetchingMoreReplies,
  } = useDisplayReviewReplies(
    displayId,
    review.displayReviewId,
    // 목록이 화면에 보이는 조건과 맞춰야 불필요한 재요청이 생기지 않습니다.
    repliesOpen || review.replyCount > 0,
  );

  const replies = repliesData?.pages.flatMap((p) => p.replies) ?? [];

  return (
    <article
      className={cn(
        'w-full transition-colors',
        // 답글 대상으로 선택되면 어떤 후기에 답글을 다는지 드러나게 강조합니다.
        isReplyTarget && '-mx-5 w-[calc(100%+2.5rem)] bg-box100 px-5',
      )}
    >
      {/* 메인 후기 영역 */}
      <div className="-mx-5 px-5 py-3 border-b border-line">
        <div className="w-full inline-flex justify-start items-start gap-1.5">
          {/* 프로필 아바타 (size-7 = 28px) */}
          <div className="size-7 relative bg-box rounded-full border border-line overflow-hidden shrink-0">
            <img
              src={review.user?.profileImageUrl || FALLBACK_PROFILE_IMAGE}
              alt={review.user?.nickname || '사용자'}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = FALLBACK_PROFILE_IMAGE;
              }}
            />
          </div>

          {/* 우측 전체 컨텐츠 Column */}
          <div className="flex-1 inline-flex flex-col justify-start items-start gap-3 min-w-0">
            <div className="w-full flex flex-col justify-start items-start gap-3">
              <div className="w-full flex flex-col justify-start items-start gap-1">
                {/* 이름 & 전시팀원(선택) & 날짜 */}
                <div className="w-full h-5 inline-flex justify-start items-center gap-2">
                  <div className="flex justify-start items-center gap-2">
                    <span className="typo-body-sm-bold text-main">{review.user?.nickname}</span>
                    <span className="typo-body-xs-regular text-faint">
                      {formatDateOrTime(review.createdAt)}
                    </span>
                  </div>
                </div>

                {/* 첨부 이미지 목록 */}
                {images.length > 0 && (
                  <div
                    className="w-full inline-flex justify-start items-start gap-1 overflow-x-auto pb-1"
                    style={{ scrollbarWidth: 'none' }}
                  >
                    {images.map((img, index) => (
                      <div
                        key={img.imageId ?? `${img.imageUrl}-${index}`}
                        className="w-28 h-32 relative rounded-sm overflow-hidden shrink-0 bg-box"
                      >
                        <img
                          src={img.imageUrl}
                          alt={img.caption || '후기 이미지'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 후기 본문 */}
              <p className="w-full typo-body-xs-regular text-sub600 wrap-break-word whitespace-pre-line">
                {review.content}
              </p>
            </div>

            {/* 하단 액션: 답글달기 / 댓글 N / 삭제(작성자 전용) + 좋아요 */}
            <div className="w-full inline-flex justify-between items-center typo-body-xs-regular text-faint">
              <div className="flex justify-start items-center gap-2">
                <button type="button" onClick={onReply} className="hover:text-main cursor-pointer">
                  답글달기
                </button>
                {review.replyCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowReplies((prev) => !prev)}
                    className="hover:text-main cursor-pointer"
                  >
                    댓글 {review.replyCount}
                  </button>
                )}
                {canDelete && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="hover:text-main cursor-pointer"
                  >
                    삭제
                  </button>
                )}
              </div>

              <div className="flex justify-start items-center gap-1">
                <button
                  type="button"
                  onClick={handleLike}
                  id={`review-like-${review.displayReviewId}`}
                  className="flex items-center gap-1 hover:text-main text-hint cursor-pointer"
                >
                  <Heart size={14} className="fill-none text-hint" />
                  <span>{review.likeCount ?? 0}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 댓글 목록 표시 */}
      {(repliesOpen || review.replyCount > 0) && (
        <div>
          {isRepliesPending ? (
            <div className="pl-14 py-2 typo-body-xs-regular text-faint animate-pulse border-b border-line">
              댓글 불러오는 중...
            </div>
          ) : (
            <>
              {replies.map((reply) => (
                <ReplyItem
                  key={reply.displayReviewReplyId}
                  reply={reply}
                  canLike={canLikeReply}
                  display={display}
                  openLoginModal={openLoginModal}
                  onLike={() => likeReply.mutate(reply.displayReviewReplyId)}
                  onDelete={() => deleteReply.mutate(reply.displayReviewReplyId)}
                />
              ))}
              {hasMoreReplies && (
                <button
                  type="button"
                  onClick={() => fetchMoreReplies()}
                  disabled={isFetchingMoreReplies}
                  className="-mx-5 pl-14 pr-5 py-2 w-[calc(100%+2.5rem)] text-left typo-body-xs-regular text-faint hover:text-main border-b border-line cursor-pointer disabled:opacity-50"
                >
                  {isFetchingMoreReplies ? '댓글 불러오는 중...' : '댓글 더보기'}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </article>
  );
}

// ─── 스켈레톤 카드 ────────────────────────────────────────────────────────────

function ReviewSkeleton() {
  return (
    <div className="-mx-5 px-5 py-3 border-b border-line animate-pulse w-[calc(100%+2.5rem)]">
      <div className="w-full inline-flex justify-start items-start gap-1.5">
        <div className="size-7 rounded-full bg-box shrink-0" />
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex items-center gap-2 h-5">
            <div className="w-20 h-3 rounded bg-box" />
            <div className="w-14 h-2.5 rounded bg-box" />
          </div>
          <div className="space-y-1.5">
            <div className="w-full h-3 rounded bg-box" />
            <div className="w-4/5 h-3 rounded bg-box" />
          </div>
          <div className="w-24 h-3 rounded bg-box" />
        </div>
      </div>
    </div>
  );
}

// ─── ReviewTab ────────────────────────────────────────────────────────────────

type Props = {
  className?: string;
  display: DisplayDetailDto;
  displayId: number;
};

export function ReviewTab({ className, display, displayId }: Props) {
  const { data, isPending, isError, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useDisplayReviews(displayId);

  const likeReview = useToggleDisplayReviewLike(displayId);
  const deleteReview = useDeleteDisplayReview(displayId);
  const createReview = useCreateDisplayReview(displayId);
  const { loginModal, openLoginModal } = useLoginRequiredModal();
  const displayReviewPolicy = useDisplayReviewPolicy(display);
  const displayReviewReplyPolicy = useDisplayReviewReplyPolicy(display);

  /* 하단 입력바가 답글 모드일 때 대상 후기. null이면 새 후기를 작성합니다. */
  const [replyTarget, setReplyTarget] = useState<DisplayReviewDto | null>(null);
  /* 답글을 남긴 후기는 목록을 펼쳐 방금 쓴 답글이 보이게 합니다. */
  const [openedReplyIds, setOpenedReplyIds] = useState<number[]>([]);

  const createReply = useCreateDisplayReviewReply(displayId, replyTarget?.displayReviewId ?? 0);

  const reviews = data?.pages.flatMap((page) => page.reviews) ?? [];

  const triggerRef = useRef<HTMLDivElement | null>(null);

  // 무한 스크롤 감지
  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className={cn('px-5 py-6 pb-28 overflow-x-hidden', className)}>
      {/* 헤더 */}
      <h2 className="typo-body-xl-bold text-main mb-4">전시 후기</h2>

      {/* 로딩 스켈레톤 */}
      {isPending && (
        <div className="flex flex-col">
          {Array.from({ length: 3 }).map((_, i) => (
            <ReviewSkeleton key={i} />
          ))}
        </div>
      )}

      {/* 에러 */}
      {isError && (
        <div className="py-10 text-center text-sub600 typo-body-sm-regular">
          후기를 불러오지 못했습니다.
        </div>
      )}

      {/* 빈 상태 */}
      {!isPending && !isError && reviews.length === 0 && (
        <div className="py-10 text-center text-sub600 typo-body-sm-regular">
          등록된 후기가 없습니다.
        </div>
      )}

      {/* 후기 목록 */}
      {reviews.length > 0 && (
        <div className="flex flex-col">
          {reviews.map((review) => (
            <ReviewCard
              key={review.displayReviewId}
              display={display}
              displayId={displayId}
              review={review}
              isReplyTarget={replyTarget?.displayReviewId === review.displayReviewId}
              showReplies={openedReplyIds.includes(review.displayReviewId)}
              canLike={hasPermission(displayReviewPolicy, 'like')}
              canLikeReply={hasPermission(displayReviewReplyPolicy, 'reply.like')}
              openLoginModal={openLoginModal}
              onLike={() => likeReview.mutate(review.displayReviewId)}
              onDelete={() => deleteReview.mutate(review.displayReviewId)}
              onReply={() =>
                setReplyTarget((prev) =>
                  prev?.displayReviewId === review.displayReviewId ? null : review,
                )
              }
            />
          ))}

          {/* 무한 스크롤 감지 트리거 */}
          <div ref={triggerRef} className="h-4" />

          {isFetchingNextPage && (
            <div className="py-4 text-center text-sub600 typo-body-xs-regular animate-pulse">
              불러오는 중...
            </div>
          )}
        </div>
      )}

      <BottomCommentBar
        placeholder="글을 입력하세요."
        /* 답글에는 이미지를 첨부하지 않습니다. */
        imageDomain={replyTarget ? undefined : 'display-review'}
        isSubmitting={replyTarget ? createReply.isPending : createReview.isPending}
        replyingTo={replyTarget?.user?.nickname}
        onCancelReply={() => setReplyTarget(null)}
        onSubmit={({ content, imageUrls }) => {
          if (replyTarget) {
            if (!hasPermission(displayReviewReplyPolicy, 'reply.create')) {
              openLoginModal();
              return;
            }

            const targetId = replyTarget.displayReviewId;

            createReply.mutate(
              { content },
              {
                onSuccess: () => {
                  setReplyTarget(null);
                  setOpenedReplyIds((prev) =>
                    prev.includes(targetId) ? prev : [...prev, targetId],
                  );
                },
              },
            );
            return;
          }

          if (!hasPermission(displayReviewPolicy, 'create')) {
            openLoginModal();
            return;
          }

          createReview.mutate({
            content,
            images: imageUrls.map((imageUrl) => ({ imageUrl })),
          });
        }}
      />
      {loginModal}
    </div>
  );
}
