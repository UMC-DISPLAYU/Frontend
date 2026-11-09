import { useCallback, useEffect, useRef, useState } from 'react';

import type { DisplayDetailDto } from '@/api/dto';
import { BottomCommentBar } from '@/components/common/BottomCommentBar';
import { ErrorView } from '@/components/common/ErrorView';
import { Skeleton, SkeletonList } from '@/components/ui/Skeleton';
import { useCreateDisplayReviewReply } from '@/hooks/queries/useDisplayReviewReplies';
import { useCreateDisplayReview, useDisplayReviews } from '@/hooks/queries/useDisplayReviews';
import { useUserMe } from '@/hooks/queries/useUserProfile';
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { useDisplayReviewPolicy, useDisplayReviewReplyPolicy } from '@/hooks/usePolicy';
import { getErrorMessage } from '@/utils/error';
import { hasPermission } from '@/utils/hasPermission';

import { DisplayReviewCommentItem } from './DisplayReviewCommentItem';

const PLACEHOLDER = '글을 입력하세요.';

type Props = {
  display: DisplayDetailDto;
};

function ReviewSkeleton() {
  return (
    <SkeletonList count={3}>
      {() => (
        <div className="flex gap-3 pt-4 pb-2">
          <Skeleton className="size-8 shrink-0 rounded-circle" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-5 w-1/3 rounded-4" />
            <Skeleton className="h-5 w-full rounded-4" />
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

export function ReviewsPanel({ display }: Props) {
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

  const createReview = useCreateDisplayReview(displayId);
  const createReply = useCreateDisplayReviewReply(displayId, replyState?.commentId ?? 0);

  const reviews = (data?.pages.flatMap((page) => page.reviews) ?? []).filter(
    // 답글 없는 삭제된 후기는 빼고, 답글이 있으면 삭제 안내로 남긴다
    (review) => !(review.isDeleted && review.replyCount === 0),
  );

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
    <section aria-label="전시 후기" className="px-gutter py-2 desktop:px-0">
      {isPending && <ReviewSkeleton />}

      {!isPending && !isError && reviews.length === 0 && (
        <p className="typography-body-lg-medium py-10 text-center text-tertiary">
          아직 후기가 없어요
        </p>
      )}

      <div className="flex flex-col">
        {reviews.map((review) => (
          <DisplayReviewCommentItem
            key={review.displayReviewId}
            display={display}
            displayId={displayId}
            review={review}
            myUserId={userMe?.id}
            activeReplyId={replyState?.highlightId ?? null}
            onReplyClick={handleReplyClick}
          />
        ))}
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

          await createReview.mutateAsync({ content: finalContent, images: formattedImages });
        }}
      />
      {loginModal}
    </section>
  );
}
