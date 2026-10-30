import { useEffect, useRef, useState } from 'react';

import { useParams, useSearchParams } from 'react-router-dom';

import { ErrorView, LoadingView } from '@/components/common';
import {
  ArtworkTab,
  BottomFixedBar,
  DetailTabNav,
  DisplaySaveButton,
  ExhibitionMeta,
  HeroSlider,
  IntroTab,
  ReviewTab,
} from '@/components/displaydetailpage';
import { BackButton } from '@/components/ui/BackButton';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { useFlowBack } from '@/hooks/useFlowBack';
import type { DetailTabKey } from '@/types/exhibition';
import { getErrorMessage } from '@/utils/error';
import { parseDisplayId } from '@/utils/parseDisplayId';

export function DisplayDetailPage() {
  const flowBack = useFlowBack();
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const displayId = parseDisplayId(id);
  const tabNavRef = useRef<HTMLDivElement>(null);

  const tabParam = searchParams.get('tab') as DetailTabKey | null;
  const [activeTabState, setActiveTabState] = useState<DetailTabKey>('intro');
  const activeTab = tabParam ?? activeTabState;

  const handleTabChange = (key: DetailTabKey) => {
    setActiveTabState(key);
    setSearchParams({ tab: key }, { replace: true });
  };

  useEffect(() => {
    if (tabParam === 'artwork' || tabParam === 'review') {
      setTimeout(() => {
        tabNavRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [tabParam]);

  const { data: display, isPending, error, refetch } = useDisplayDetail(displayId ?? 0);

  if (isPending && displayId !== null) {
    return <LoadingView message="전시 정보를 불러오는 중..." />;
  }

  if (error || !display || displayId === null) {
    return (
      <ErrorView
        message={
          error
            ? getErrorMessage(error, '정보를 불러오지 못했어요. 다시 시도해주세요.')
            : '전시 정보를 찾을 수 없습니다'
        }
        onRetry={
          error
            ? () => {
                void refetch();
              }
            : () => flowBack()
        }
        retryLabel={error ? '다시 시도' : '뒤로가기'}
      />
    );
  }

  const heroImages = display.images?.map((img) => img.imageUrl) ?? [];

  return (
    <div className="w-full max-w-md mx-auto min-h-dvh bg-page relative">
      <div className="fixed top-4 left-1/2 z-30 w-full max-w-md -translate-x-1/2 px-4 pointer-events-none">
        <BackButton
          id="display-back-btn"
          onClick={() => flowBack()}
          className="pointer-events-auto"
        />
      </div>
      <HeroSlider images={heroImages} />
      <ExhibitionMeta display={display} />
      <div ref={tabNavRef} id="detail-tab-nav">
        <DetailTabNav activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
      {/* 하단 전시 저장 바에 콘텐츠 마지막 부분이 가려지지 않도록 여백을 확보합니다. */}
      {activeTab === 'intro' && (
        <div className="pb-bottom-bar-offset">
          <IntroTab display={display} />
        </div>
      )}
      {activeTab === 'artwork' && (
        <div className="pb-bottom-bar-offset">
          <ArtworkTab displayId={display.displayId} teamMembers={display.teamMembers} />
        </div>
      )}
      {activeTab === 'review' && <ReviewTab display={display} displayId={display.displayId} />}
      {/* 후기 탭은 하단에 댓글 입력바가 자리하므로 전시 저장 바를 띄우지 않습니다. */}
      {activeTab !== 'review' && (
        <BottomFixedBar
          button={
            <DisplaySaveButton displayId={display.displayId} saved={display.isArchived ?? false} />
          }
          shareTitle={display.title}
          shareDescription={display.subtitle ?? undefined}
          shareImageUrl={heroImages[0]}
        />
      )}
    </div>
  );
}
