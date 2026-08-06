import { useEffect, useRef, useState } from 'react';

import type { DisplayDetailDto } from '@/api/dto/display.dto';
import { BottomCommentBar } from '@/components/common';
import { useCreateDisplayReviewReply } from '@/hooks/queries/useDisplayReviewReplies';
import { useCreateDisplayReview, useDisplayReviews } from '@/hooks/queries/useDisplayReviews';
import { useUserMe } from '@/hooks/queries/useUserProfile';
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { useDisplayReviewPolicy, useDisplayReviewReplyPolicy } from '@/hooks/usePolicy';
import { cn } from '@/utils/cn';
import { hasPermission } from '@/utils/hasPermission';

import { DisplayReviewCommentItem } from './DisplayReviewCommentItem';

// ─── 스켈레톤 카드 ────────────────────────────────────────────────────────────

function ReviewSkeleton() {
  return (
    <div className="-mx-5 px-5 py-3 border-b border-line-soft animate-pulse w-[calc(100%+2.5rem)]">
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

  const { data: userMe } = useUserMe();
  const myUserId = userMe?.id;

  const { loginModal, openLoginModal } = useLoginRequiredModal();
  const reviewPolicy = useDisplayReviewPolicy(display);
  const replyPolicy = useDisplayReviewReplyPolicy(display);

  const [replyTarget, setReplyTarget] = useState<{ commentId: number; author: string } | null>(
    null,
  );
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const clearReplyTarget = () => {
    setReplyTarget(null);
    setActiveReplyId(null);
  };

  const createReview = useCreateDisplayReview(displayId);
  const createReply = useCreateDisplayReviewReply(displayId, replyTarget?.commentId ?? 0);

  const reviews = (data?.pages.flatMap((page) => page.reviews) ?? []).filter(
    // 답글 없는 삭제된 후기는 목록에서 완전히 제외 (답글이 있으면 "삭제된 글입니다"로 표시)
    (review) => !(review.isDeleted && review.replyCount === 0),
  );

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
            <DisplayReviewCommentItem
              key={review.displayReviewId}
              display={display}
              displayId={displayId}
              review={review}
              myUserId={myUserId}
              activeReplyId={activeReplyId}
              onReplyClick={(commentId, author, highlightId) => {
                setReplyTarget({ commentId, author });
                setActiveReplyId(highlightId);
              }}
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
        imageDomain="display-review"
        isSubmitting={replyTarget ? createReply.isPending : createReview.isPending}
        replyingTo={replyTarget?.author}
        onCancelReply={clearReplyTarget}
        onSubmit={({ content, images }) => {
          if (replyTarget) {
            if (!hasPermission(replyPolicy, 'reply.create')) {
              openLoginModal();
              return;
            }
            createReply.mutate({ content, images }, { onSuccess: clearReplyTarget });
            return;
          }

          if (!hasPermission(reviewPolicy, 'create')) {
            openLoginModal();
            return;
          }

          createReview.mutate({ content, images });
        }}
      />
      {loginModal}
    </div>
  );
}
