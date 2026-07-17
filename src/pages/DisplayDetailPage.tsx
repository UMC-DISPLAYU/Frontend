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
    <div className="w-full max-w-md mx-auto min-h-dvh bg-[#F0F0F3] relative">
      {/* 히어로 슬라이더 (뒤로가기 버튼 포함) */}
      <HeroSlider images={exhibition.heroImages} onBack={() => navigate(-1)} />

      {/* 전시 메타 정보 */}
      <ExhibitionMeta exhibition={exhibition} />

      {/* 소개 / 작품 / 후기 탭 */}
      <DetailTabNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 탭 콘텐츠 */}
      {activeTab === 'intro' && <IntroTab exhibition={exhibition} />}
      {activeTab === 'artwork' && <ArtworkTab artworks={id ? ARTWORKS[id] || [] : []} />}
      {activeTab === 'review' && <ReviewTab reviews={id ? REVIEWS[id] || [] : []} />}

      {/* 하단 고정: 공유 & 전시 저장 버튼 */}
      <BottomFixedBar />
    </div>
  );
}
