import { useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

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
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import type { DetailTabKey } from '@/types/exhibition';
import { parseDisplayId } from '@/utils/parseDisplayId';

export function DisplayDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const displayId = parseDisplayId(id);

  const [activeTab, setActiveTab] = useState<DetailTabKey>('intro');

  const { data: display, isPending, isError } = useDisplayDetail(displayId ?? 0);

  if (isPending) {
    return <LoadingView message="전시 정보를 불러오는 중..." />;
  }

  if (isError || !display || displayId === null) {
    return (
      <ErrorView
        title="전시 정보를 찾을 수 없습니다"
        message="요청하신 전시 정보가 존재하지 않거나 삭제되었습니다."
        onRetry={() => navigate(-1)}
      />
    );
  }

  const heroImages = display.images?.map((img) => img.imageUrl) ?? [];

  return (
    <div className="w-full max-w-md mx-auto min-h-dvh bg-page relative">
      <HeroSlider images={heroImages} onBack={() => navigate(-1)} />
      <ExhibitionMeta display={display} />
      <DetailTabNav activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'intro' && <IntroTab display={display} />}
      {activeTab === 'artwork' && <ArtworkTab displayId={display.displayId} />}
      {activeTab === 'review' && <ReviewTab displayId={display.displayId} />}
      {/* 후기 탭은 하단에 댓글 입력바가 자리하므로 전시 저장 바를 띄우지 않습니다. */}
      {activeTab !== 'review' && (
        <BottomFixedBar
          button={
            <DisplaySaveButton
              displayId={display.displayId}
              saved={display.isBookmarked ?? false}
            />
          }
        />
      )}
    </div>
  );
}
