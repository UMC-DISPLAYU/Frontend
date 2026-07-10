import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { ArtworkTab } from '@/components/displaydetailpage/ArtworkTab';
import { BottomFixedBar } from '@/components/displaydetailpage/BottomFixedBar';
import { DetailTabNav } from '@/components/displaydetailpage/DetailTabNav';
import { ExhibitionMeta } from '@/components/displaydetailpage/ExhibitionMeta';
import { HeroSlider } from '@/components/displaydetailpage/HeroSlider';
import { IntroTab } from '@/components/displaydetailpage/IntroTab';
import { ReviewTab } from '@/components/displaydetailpage/ReviewTab';
import { ARTWORKS, EXHIBITION_DETAIL, REVIEWS } from '@/mocks/detail';
import type { DetailTabKey } from '@/types/detail';

export function DisplayDetailPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DetailTabKey>('intro');

  return (
    <div className="w-full max-w-md mx-auto min-h-dvh bg-[#F0F0F3] relative">
      {/* 히어로 슬라이더 (뒤로가기 버튼 포함) */}
      <HeroSlider images={EXHIBITION_DETAIL.heroImages} onBack={() => navigate(-1)} />

      {/* 전시 메타 정보 */}
      <ExhibitionMeta exhibition={EXHIBITION_DETAIL} />

      {/* 소개 / 작품 / 후기 탭 */}
      <DetailTabNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 탭 콘텐츠 */}
      {activeTab === 'intro' && <IntroTab exhibition={EXHIBITION_DETAIL} />}
      {activeTab === 'artwork' && <ArtworkTab artworks={ARTWORKS} />}
      {activeTab === 'review' && <ReviewTab reviews={REVIEWS} />}

      {/* 하단 고정: 공유 & 전시 저장 버튼 */}
      <BottomFixedBar />
    </div>
  );
}
