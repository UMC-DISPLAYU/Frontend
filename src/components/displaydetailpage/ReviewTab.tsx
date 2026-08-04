import { useEffect, useRef, useState } from 'react';

import { CommentInputBar } from '@/components/common';
import { useCreateDisplayReviewReply } from '@/hooks/queries/useDisplayReviewReplies';
import { useCreateDisplayReview, useDisplayReviews } from '@/hooks/queries/useDisplayReviews';
import { useUserMe } from '@/hooks/queries/useUserProfile';
import { cn } from '@/utils/cn';

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
  displayId: number;
};

export function ReviewTab({ className, displayId }: Props) {
  const { data, isPending, isError, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useDisplayReviews(displayId);

  const { data: userMe } = useUserMe();
  const myUserId = userMe?.id;

  const [replyTarget, setReplyTarget] = useState<{ commentId: number; author: string } | null>(
    null,
  );
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const clearReplyTarget = () => {
    setReplyTarget(null);
    setActiveReplyId(null);
  };

  const createReview = useCreateDisplayReview(displayId);
  const createReply = useCreateDisplayReviewReply(displayId, replyTarget?.commentId ?? 0);

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
            <DisplayReviewCommentItem
              key={review.displayReviewId}
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

      <CommentInputBar
        replyTarget={replyTarget}
        onCancelReply={clearReplyTarget}
        onSubmitComment={(content, imageUrls) =>
          createReview.mutateAsync({
            content,
            images: imageUrls.map((imageUrl) => ({ imageUrl })),
          })
        }
        onSubmitReply={(commentId, content) =>
          // 전시 후기 답글 API는 이미지 첨부를 지원하지 않음
          createReply.mutateAsync({ content }, { onSuccess: clearReplyTarget })
        }
        imageUploadDomain="display-review"
      />
    </div>
  );
}
