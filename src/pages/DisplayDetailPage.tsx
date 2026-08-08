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
import { BackButton } from '@/components/ui/BackButton';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { useLoginRequiredModal } from '@/hooks/usePermissionRequiredModal';
import { useAuthStore } from '@/stores/authStore';
import type { DetailTabKey } from '@/types/exhibition';
import { parseDisplayId } from '@/utils/parseDisplayId';

export function DisplayDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const displayId = parseDisplayId(id);

  const [activeTab, setActiveTab] = useState<DetailTabKey>('intro');
  const accessToken = useAuthStore((state) => state.accessToken);
  const { loginModal, openLoginModal } = useLoginRequiredModal();

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
      {loginModal}
      <div className="fixed top-4 left-1/2 z-30 w-full max-w-md -translate-x-1/2 px-4 pointer-events-none">
        <BackButton
          id="display-back-btn"
          onClick={() => navigate(-1)}
          className="pointer-events-auto"
        />
      </div>
      <HeroSlider images={heroImages} />
      <ExhibitionMeta display={display} />
      <DetailTabNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'review' && !accessToken) {
            openLoginModal();
          } else {
            setActiveTab(tab);
          }
        }}
      />
      {/* 하단 전시 저장 바에 콘텐츠 마지막 부분이 가려지지 않도록 여백을 확보합니다. */}
      {activeTab === 'intro' && (
        <div className="pb-28">
          <IntroTab display={display} />
        </div>
      )}
      {activeTab === 'artwork' && (
        <div className="pb-28">
          <ArtworkTab displayId={display.displayId} />
        </div>
      )}
      {activeTab === 'review' && <ReviewTab display={display} displayId={display.displayId} />}
      {/* 후기 탭은 하단에 댓글 입력바가 자리하므로 전시 저장 바를 띄우지 않습니다. */}
      {activeTab !== 'review' && (
        <BottomFixedBar
          button={
            <DisplaySaveButton displayId={display.displayId} saved={display.isArchived ?? false} />
          }
        />
      )}
    </div>
  );
}
