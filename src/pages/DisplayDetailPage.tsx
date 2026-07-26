import { useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import {
  ArtworkTab,
  BottomFixedBar,
  DetailTabNav,
  ExhibitionMeta,
  HeroSlider,
  IntroTab,
  ReviewTab,
} from '@/components/displaydetailpage';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import type { DetailTabKey } from '@/types/exhibition';
import { cn } from '@/utils/cn';

export function DisplayDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const displayId = id ? Number(id) : 0;

  const [activeTab, setActiveTab] = useState<DetailTabKey>('intro');

  const { data: display, isPending, isError } = useDisplayDetail(displayId);

  const containerClassName =
    'w-full max-w-md mx-auto min-h-dvh flex flex-col justify-center items-center';

  if (isPending) {
    return (
      <div className={cn(containerClassName, 'bg-page')}>
        <p className="typo-body-sm-regular text-faint">불러오는 중...</p>
      </div>
    );
  }

  if (isError || !display) {
    return (
      <div className={cn(containerClassName, 'gap-3 bg-page')}>
        <p className="typo-body-sm-regular text-sub600">전시 정보를 찾을 수 없습니다.</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="typo-body-sm-regular text-faint underline cursor-pointer"
        >
          돌아가기
        </button>
      </div>
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
      <BottomFixedBar />
    </div>
  );
}
