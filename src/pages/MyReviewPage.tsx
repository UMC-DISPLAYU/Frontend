import { useState } from 'react';

import { ChevronLeft } from 'lucide-react';

import type { MyArtworkFeelingDto, MyDisplayReviewDto } from '@/api/dto';
import { ErrorView, LoadingView } from '@/components/common';
import { useMyArtworkFeelings } from '@/hooks/queries/useMyArtworkFeelings';
import { useMyDisplayReviews } from '@/hooks/queries/useMyDisplayReviews';
import { useFlowBack } from '@/hooks/useFlowBack';

interface ReviewCardProps {
  title: string;
  content: string;
  createdAt: string;
}

function ReviewCard({ title, content, createdAt }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 30) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  return (
    <div className="w-full rounded-lg bg-card px-4 py-3.5 shadow-[8px_8px_18px_rgba(67,0,209,0.04)]">
      <div className="flex flex-col gap-1">
        <p className="typo-body-sm-semibold text-link">{title}</p>
        <p className="typo-body-sm-regular text-main line-clamp-2">{content}</p>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2 typo-body-xs-regular text-faint">
          <span>{formatDate(createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

const TABS = ['전시', '작품'];

export function MyReviewPage() {
  const flowBack = useFlowBack();
  const [activeTab, setActiveTab] = useState('전시');

  const {
    data: displayReviewsData,
    isLoading: isLoadingDisplayReviews,
    error: displayReviewsError,
    refetch: refetchDisplayReviews,
  } = useMyDisplayReviews({
    size: 50,
  });
  const {
    data: artworkFeelingsData,
    isLoading: isLoadingArtworkFeelings,
    error: artworkFeelingsError,
    refetch: refetchArtworkFeelings,
  } = useMyArtworkFeelings({ size: 50 });

  const displayReviews = displayReviewsData?.reviews ?? [];
  const artworkFeelings = artworkFeelingsData?.feelings ?? [];

  const isLoading = isLoadingDisplayReviews || isLoadingArtworkFeelings;
  const hasError = displayReviewsError || artworkFeelingsError;

  const handleRetry = () => {
    refetchDisplayReviews();
    refetchArtworkFeelings();
  };

  return (
    <div className="max-w-md mx-auto h-dvh bg-page flex flex-col">
      <header className="flex items-center gap-3 px-5 pt-4 pb-3">
        <button type="button" onClick={() => flowBack()} aria-label="뒤로가기" className="-ml-1">
          <ChevronLeft className="size-7 text-main" strokeWidth={2} />
        </button>
        <h1 className="typo-body-xl-bold text-main">내가 남긴 감상</h1>
      </header>

      <nav className="w-96 h-11 px-5 border-b border-line-soft flex items-center" role="tablist">
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab)}
              className={[
                'w-44 h-11 relative transition-colors',
                isActive ? 'border-b-2 border-bt-black -mb-px' : '',
              ].join(' ')}
            >
              <div className="absolute left-1/2 -translate-x-1/2 top-[12px]">
                <span
                  className={
                    isActive
                      ? 'typo-body-sm-bold text-main text-center'
                      : 'typo-body-sm-regular text-faint text-center'
                  }
                >
                  {tab}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      <section className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
        {hasError ? (
          <ErrorView
            fullScreen={false}
            message="감상 목록을 불러오지 못했습니다."
            onRetry={handleRetry}
          />
        ) : isLoading ? (
          <LoadingView fullScreen={false} />
        ) : activeTab === '전시' && displayReviews.length > 0 ? (
          <div className="flex flex-col gap-4">
            {displayReviews.map((review: MyDisplayReviewDto) => (
              <ReviewCard
                key={review.displayReviewId}
                title={review.displayName}
                content={review.content}
                createdAt={review.createdAt}
              />
            ))}
          </div>
        ) : activeTab === '작품' && artworkFeelings.length > 0 ? (
          <div className="flex flex-col gap-4">
            {artworkFeelings.map((feeling: MyArtworkFeelingDto, index: number) => (
              <ReviewCard
                key={`${feeling.artworkId}-${feeling.personalArtworkId}-${index}`}
                title={feeling.artworkName}
                content={feeling.content}
                createdAt={feeling.createdAt}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="typo-body-sm-regular text-faint">작성한 감상이 없습니다.</p>
          </div>
        )}
      </section>
    </div>
  );
}
