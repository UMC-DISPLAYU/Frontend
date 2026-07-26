import { useRef } from 'react';

import { Heart } from 'lucide-react';

import type { DisplayReviewDto } from '@/api/dto/display.dto';
import { useDisplayReviews } from '@/hooks/queries/useDisplayReviews';
import { cn } from '@/utils/cn';

import defaultProfileIcon from '../../assets/DefaultProfileIcon.svg';

// ─── 날짜 포맷 ───────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

// ─── 단일 후기 카드 ──────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: DisplayReviewDto }) {
  const images = review.images ?? [];

  return (
    <article className="py-3 border-b border-line last:border-0">
      <div className="w-full inline-flex justify-start items-start gap-1.5">
        {/* 프로필 아바타 (size-7 = 28px) */}
        <div className="size-7 relative bg-box rounded-full border border-line overflow-hidden shrink-0">
          <img
            src={review.user?.profileImageUrl || defaultProfileIcon}
            alt={review.user?.nickname || '사용자'}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = defaultProfileIcon;
            }}
          />
        </div>

        {/* 우측 전체 컨텐츠 Column */}
        <div className="flex-1 inline-flex flex-col justify-start items-start gap-3 min-w-0">
          <div className="w-full flex flex-col justify-start items-start gap-3">
            <div className="w-full flex flex-col justify-start items-start gap-1">
              {/* 이름 & 날짜 */}
              <div className="w-full h-5 inline-flex justify-start items-center gap-2">
                <div className="flex justify-start items-center gap-2">
                  <span className="typo-body-sm-bold text-main">{review.user?.nickname}</span>
                  <span className="typo-body-xs-regular text-faint">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
              </div>

              {/* 첨부 이미지 목록 */}
              {images.length > 0 && (
                <div
                  className="w-full inline-flex justify-start items-start gap-1 overflow-x-auto pb-1"
                  style={{ scrollbarWidth: 'none' }}
                >
                  {images.map((img) => (
                    <div
                      key={img.imageId}
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

          {/* 하단 액션: 답글달기 / 댓글 N / 삭제 + 좋아요 */}
          <div className="w-full inline-flex justify-between items-center typo-body-xs-regular text-faint">
            <div className="flex justify-start items-center gap-2">
              <button type="button" className="hover:text-main cursor-pointer">
                답글달기
              </button>
              {review.replyCount > 0 && <span>댓글 {review.replyCount}</span>}
              <button type="button" className="hover:text-main cursor-pointer">
                삭제
              </button>
            </div>

            <div className="flex justify-start items-center gap-1">
              <button
                type="button"
                id={`review-like-${review.displayReviewId}`}
                className="flex items-center gap-1 hover:text-main text-faint cursor-pointer"
              >
                <Heart size={14} className="fill-none text-sub700" />
                <span>{review.likeCount ?? 0}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── 스켈레톤 카드 ────────────────────────────────────────────────────────────

function ReviewSkeleton() {
  return (
    <div className="py-3 border-b border-line animate-pulse">
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

  const reviews = data?.pages.flatMap((page) => page.reviews) ?? [];

  const observerRef = useRef<HTMLDivElement | null>(null);

  // 무한 스크롤 감지
  const setObserverRef = (el: HTMLDivElement | null) => {
    if (observerRef.current) return;
    if (!el) return;
    observerRef.current = el;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
  };

  return (
    <div className={cn('px-5 py-6 pb-28', className)}>
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
            <ReviewCard key={review.displayReviewId} review={review} />
          ))}

          {/* 무한 스크롤 감지 트리거 */}
          <div ref={setObserverRef} className="h-4" />

          {isFetchingNextPage && (
            <div className="py-4 text-center text-sub600 typo-body-xs-regular animate-pulse">
              불러오는 중...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
