import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import type { DisplayDetailDto } from '@/api/dto';
import { BottomCommentBar } from '@/components/common/BottomCommentBar';
import { COMMENT_REPORT_ENABLED, ReportReasonDialog } from '@/components/common/comment';
import { ErrorView } from '@/components/common/ErrorView';
import { Skeleton, SkeletonList, SkeletonText } from '@/components/ui/Skeleton';
import { useCreateDisplayReviewReply } from '@/hooks/queries/useDisplayReviewReplies';
import { useCreateDisplayReview, useDisplayReviews } from '@/hooks/queries/useDisplayReviews';
import { useUserMe } from '@/hooks/queries/useUserProfile';
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { useDisplayReviewPolicy, useDisplayReviewReplyPolicy } from '@/hooks/usePolicy';
import { useSkeleton } from '@/hooks/useSkeleton';
import { toast } from '@/stores/toastStore';
import { getErrorMessage } from '@/utils/error';
import { hasPermission } from '@/utils/hasPermission';

import { DisplayReviewCommentItem } from './DisplayReviewCommentItem';

const PLACEHOLDER = '글을 입력하세요.';

type Props = {
  display: DisplayDetailDto;
  /* 후기를 올린 뒤 탭 줄 아래로 올라가 새 후기가 보이게 한다 */
  onPosted?: () => void;
};

/* 프로토타입 .cm.fresh: 방금 올린 후기는 위에서 10px 내려오며 나타난다(0.42s) */
function FreshReview({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    ref.current?.animate(
      [
        { opacity: 0, transform: 'translateY(-10px)' },
        { opacity: 1, transform: 'none' },
      ],
      { duration: 420, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'backwards' },
    );
  }, []);

  return <div ref={ref}>{children}</div>;
}

function ReviewSkeleton() {
  return (
    <SkeletonList count={3}>
      {() => (
        <div className="flex gap-3 pt-4 pb-2">
          <Skeleton className="size-8 shrink-0 rounded-circle" />
          <div className="min-w-0 flex-1">
            <SkeletonText className="typography-body-lg-semibold min-h-6 w-1/3" />
            <SkeletonText className="typography-body-lg-regular mt-2 w-full" />
          </div>
        </div>
      )}
    </SkeletonList>
  );
}

/* 공개 전에는 후기를 부르지 않고, 입력바는 모양만 두고 막는다 */
export function PreviewReviewsPanel() {
  return (
    <section aria-label="전시 후기" className="px-gutter py-2 desktop:px-0">
      <p className="typography-body-lg-medium py-10 text-center text-tertiary">
        공개 전이라 후기가 없어요
      </p>
      <fieldset disabled className="m-0 min-w-0 border-0 p-0 opacity-45">
        <BottomCommentBar placement="page" placeholder={PLACEHOLDER} onSubmit={async () => false} />
      </fieldset>
    </section>
  );
}

export function ReviewsPanel({ display, onPosted }: Props) {
  const displayId = display.displayId;
  const {
    data,
    error,
    isPending,
    isError,
    isFetchNextPageError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useDisplayReviews(displayId);
  const { showSkeleton, skeletonProps } = useSkeleton(isPending);
  const { data: userMe } = useUserMe();
  const { loginModal, openLoginModal } = useLoginRequiredModal();
  const reviewPolicy = useDisplayReviewPolicy(display);
  const replyPolicy = useDisplayReviewReplyPolicy(display);

  const [replyState, setReplyState] = useState<{
    commentId: number;
    author: string;
    highlightId: string;
  } | null>(null);
  const clearReplyTarget = () => setReplyState(null);
  const handleReplyClick = useCallback((commentId: number, author: string, highlightId: string) => {
    setReplyState((prev) =>
      prev?.highlightId === highlightId ? null : { commentId, author, highlightId },
    );
  }, []);

  const [isReportOpen, setIsReportOpen] = useState(false);
  const isLoggedIn = hasPermission(reviewPolicy, 'like');
  const handleReport = useCallback(() => {
    if (isLoggedIn) setIsReportOpen(true);
    else openLoginModal();
  }, [isLoggedIn, openLoginModal]);

  const createReview = useCreateDisplayReview(displayId);
  const createReply = useCreateDisplayReviewReply(displayId, replyState?.commentId ?? 0);

  const reviews = (data?.pages.flatMap((page) => page.reviews) ?? []).filter(
    // 답글 없는 삭제된 후기는 빼고, 답글이 있으면 삭제 안내로 남긴다
    (review) => !(review.isDeleted && review.replyCount === 0),
  );

  // 올리기 직전에 있던 후기들. 목록 맨 위에 새로 생긴 후기만 등장 효과를 준다(뒤 페이지는 제외)
  const [knownIds, setKnownIds] = useState<Set<number> | null>(null);
  const firstKnownIndex = knownIds
    ? reviews.findIndex((review) => knownIds.has(review.displayReviewId))
    : 0;
  const freshCount = firstKnownIndex === -1 ? reviews.length : firstKnownIndex;

  const triggerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const element = triggerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // 다음 페이지 요청이 실패하면 자동으로 다시 부르지 않고 재시도 버튼에 맡긴다
        if (
          entries[0].isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage &&
          !isFetchNextPageError
        ) {
          void fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage]);

  return (
    <section aria-label="전시 후기" className="px-gutter py-2 desktop:px-0" {...skeletonProps}>
      {showSkeleton && <ReviewSkeleton />}

      {!showSkeleton && !isError && reviews.length === 0 && (
        <p className="typography-body-lg-medium py-10 text-center text-tertiary">
          아직 후기가 없어요
        </p>
      )}

      <div className="flex flex-col">
        {!showSkeleton &&
          reviews.map((review, index) => {
            const item = (
              <DisplayReviewCommentItem
                key={review.displayReviewId}
                display={display}
                displayId={displayId}
                review={review}
                myUserId={userMe?.id}
                activeReplyId={replyState?.highlightId ?? null}
                onReplyClick={handleReplyClick}
                onReport={COMMENT_REPORT_ENABLED ? handleReport : undefined}
              />
            );
            return index < freshCount ? (
              <FreshReview key={review.displayReviewId}>{item}</FreshReview>
            ) : (
              item
            );
          })}
      </div>

      <div ref={triggerRef} className="h-4" />
      {isFetchingNextPage && (
        <p className="typography-body-md-medium animate-pulse py-4 text-center text-tertiary">
          불러오는 중...
        </p>
      )}

      {isError && (
        <ErrorView
          fullScreen={false}
          message={getErrorMessage(error, '후기를 불러오지 못했어요.')}
          onRetry={() => {
            void (isFetchNextPageError ? fetchNextPage() : refetch());
          }}
          retryLabel="다시 시도"
        />
      )}

      <BottomCommentBar
        placement="page"
        placeholder={PLACEHOLDER}
        imageDomain="display-review"
        maxImages={4}
        isSubmitting={replyState ? createReply.isPending : createReview.isPending}
        replyingTo={replyState?.author}
        onCancelReply={clearReplyTarget}
        onSubmit={async ({ content, images }) => {
          const finalContent = content.trim() || '.';
          const formattedImages = images.map((image) => ({
            imageUrl: image.imageUrl,
            width: Math.round(image.width) || 0,
            height: Math.round(image.height) || 0,
          }));

          if (replyState) {
            if (!hasPermission(replyPolicy, 'reply.create')) {
              openLoginModal();
              return false;
            }
            await createReply.mutateAsync(
              { content: finalContent, images: formattedImages },
              { onSuccess: clearReplyTarget },
            );
            return;
          }

          if (!hasPermission(reviewPolicy, 'create')) {
            openLoginModal();
            return false;
          }

          const idsBeforePost = new Set(reviews.map((review) => review.displayReviewId));
          await createReview.mutateAsync({ content: finalContent, images: formattedImages });
          setKnownIds(idsBeforePost);
          onPosted?.();
        }}
      />
      {loginModal}
      <ReportReasonDialog
        open={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onSelect={() => {
          setIsReportOpen(false);
          toast('신고가 접수됐어요');
        }}
      />
    </section>
  );
}
