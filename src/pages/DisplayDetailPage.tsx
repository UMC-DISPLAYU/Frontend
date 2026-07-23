import { useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { ArtworkTab } from '@/components/displaydetailpage/ArtworkTab';
import { BottomFixedBar } from '@/components/displaydetailpage/BottomFixedBar';
import { DetailTabNav } from '@/components/displaydetailpage/DetailTabNav';
import { ExhibitionMeta } from '@/components/displaydetailpage/ExhibitionMeta';
import { HeroSlider } from '@/components/displaydetailpage/HeroSlider';
import { IntroTab } from '@/components/displaydetailpage/IntroTab';
import { ReviewTab } from '@/components/displaydetailpage/ReviewTab';
import { ARTWORKS, EXHIBITION_DETAILS, REVIEWS } from '@/mocks/exhibition';
import type { DetailTabKey } from '@/types/exhibition';

export function DisplayDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<DetailTabKey>('intro');

  const exhibition = id ? EXHIBITION_DETAILS[id] : undefined;

  if (!exhibition) {
    return (
      <div className="w-full max-w-md mx-auto min-h-dvh flex flex-col items-center justify-center gap-3 bg-[#F0F0F3]">
        <p className="text-neutral-500 text-sm font-[Pretendard,sans-serif]">
          전시 정보를 찾을 수 없습니다.
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm text-neutral-400 underline font-[Pretendard,sans-serif]"
        >
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto min-h-dvh bg-bg relative">
      <HeroSlider images={exhibition.heroImages} onBack={() => navigate(-1)} />
      <ExhibitionMeta exhibition={exhibition} />
      <DetailTabNav activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'intro' && <IntroTab exhibition={exhibition} />}
      {activeTab === 'artwork' && <ArtworkTab artworks={id ? ARTWORKS[id] || [] : []} />}
      {activeTab === 'review' && <ReviewTab reviews={id ? REVIEWS[id] || [] : []} />}
      <BottomFixedBar />
    </div>
  );
}
