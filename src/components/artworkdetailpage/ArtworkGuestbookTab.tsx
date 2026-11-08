import { useCallback, useEffect, useRef, useState } from 'react';

import type { DisplayDetailDto } from '@/api/dto';
import { BottomCommentBar } from '@/components/common/BottomCommentBar';
import { ErrorView } from '@/components/common/ErrorView';
import { Skeleton, SkeletonList } from '@/components/ui/Skeleton';
import {
  useArtworkFeelings,
  useCreateArtworkFeeling,
  useCreateArtworkFeelingReply,
} from '@/hooks/queries/useArtworkFeelings';
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { useFeelingPolicy, useFeelingReplyPolicy } from '@/hooks/usePolicy';
import { getErrorMessage } from '@/utils/error';
import { hasPermission } from '@/utils/hasPermission';

import { ArtworkFeelingCommentItem } from './ArtworkFeelingCommentItem';

type Props = {
  artworkId: number;
  display: DisplayDetailDto;
  myUserId?: number;
};

export function GuestbookSkeleton() {
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

export function ArtworkGuestbookTab({ artworkId, display, myUserId }: Props) {
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
  } = useArtworkFeelings(artworkId);
  const createFeeling = useCreateArtworkFeeling();
  const { loginModal, openLoginModal } = useLoginRequiredModal();
  const feelingPolicy = useFeelingPolicy(display, undefined);
  const feelingReplyPolicy = useFeelingReplyPolicy(display);

  const [replyTarget, setReplyTarget] = useState<{ commentId: number; author: string } | null>(
    null,
  );
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const createFeelingReply = useCreateArtworkFeelingReply(artworkId, replyTarget?.commentId ?? 0);

  const clearReplyTarget = () => {
    setReplyTarget(null);
    setActiveReplyId(null);
  };
  const handleReplyClick = useCallback((commentId: number, author: string, highlightId: string) => {
    setReplyTarget({ commentId, author });
    setActiveReplyId(highlightId);
  }, []);

  const feelings = (data?.pages.flatMap((page) => page.feelings) ?? []).filter(
    // 답글 없는 삭제된 감상은 목록에서 완전히 제외 (답글이 있으면 삭제 안내로 표시)
    (feeling) => !(feeling.isDeleted && feeling.replyCount === 0),
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
    <div className="px-gutter py-2 desktop:px-0">
      {isPending && <GuestbookSkeleton />}

      {!isPending && !isError && feelings.length === 0 && (
        <p className="typography-body-lg-medium py-10 text-center text-tertiary">
          아직 방명록이 없어요
        </p>
      )}

      <div className="flex flex-col">
        {feelings.map((feeling) => (
          <ArtworkFeelingCommentItem
            key={feeling.feelingId}
            artworkId={artworkId}
            feeling={feeling}
            display={display}
            myUserId={myUserId}
            activeReplyId={activeReplyId}
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
          message={getErrorMessage(error, '방명록을 불러오지 못했어요.')}
          onRetry={() => {
            void (isFetchNextPageError ? fetchNextPage() : refetch());
          }}
          retryLabel="다시 시도"
        />
      )}

      <BottomCommentBar
        placement="page"
        imageDomain="artwork-feeling"
        isSubmitting={replyTarget ? createFeelingReply.isPending : createFeeling.isPending}
        replyingTo={replyTarget?.author}
        onCancelReply={clearReplyTarget}
        onSubmit={async ({ content, images }) => {
          const finalContent = content.trim() || '.';
          const formattedImages = images.map((image, index) => ({
            imageUrl: image.imageUrl,
            width: Math.round(image.width) || 0,
            height: Math.round(image.height) || 0,
            sortOrder: index + 1,
          }));

          if (replyTarget) {
            if (!hasPermission(feelingReplyPolicy, 'reply.create')) {
              openLoginModal();
              return false;
            }
            await createFeelingReply.mutateAsync(
              { content: finalContent, images: formattedImages },
              { onSuccess: clearReplyTarget },
            );
            return;
          }

          if (!hasPermission(feelingPolicy, 'create')) {
            openLoginModal();
            return false;
          }

          await createFeeling.mutateAsync({
            artworkId,
            body: { content: finalContent, images: formattedImages },
          });
        }}
      />
      {loginModal}
    </div>
  );
}
