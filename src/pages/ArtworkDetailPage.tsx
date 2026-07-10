import { useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { ArtworkGuestbookTab } from '@/components/artworkdetailpage/ArtworkGuestbookTab';
import { ArtworkIntroTab } from '@/components/artworkdetailpage/ArtworkIntroTab';
import { ArtworkMeta } from '@/components/artworkdetailpage/ArtworkMeta';
import { ArtworkTabNav } from '@/components/artworkdetailpage/ArtworkTabNav';
import { BottomFixedBar } from '@/components/displaydetailpage/BottomFixedBar';
import { HeroSlider } from '@/components/displaydetailpage/HeroSlider';
import { ARTWORK_DETAILS, GUESTBOOK_QUESTIONS, GUESTBOOK_REVIEWS } from '@/mocks/exhibition';

export function ArtworkDetailPage() {
  const navigate = useNavigate();
  const { artworkId } = useParams<{ artworkId: string }>();
  const [activeTab, setActiveTab] = useState<'intro' | 'guestbook'>('intro');

  const artwork = artworkId ? ARTWORK_DETAILS[artworkId] : undefined;

  if (!artwork) {
    return (
      <div className="w-full max-w-md mx-auto min-h-dvh flex flex-col items-center justify-center gap-3 bg-[#F0F0F3]">
        <p className="text-neutral-500 text-sm font-[Pretendard,sans-serif]">
          작품 정보를 찾을 수 없습니다.
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

  const reviews = artworkId ? GUESTBOOK_REVIEWS[artworkId] || [] : [];
  const questions = artworkId ? GUESTBOOK_QUESTIONS[artworkId] || [] : [];

  return (
    <div className="w-full max-w-md mx-auto min-h-dvh bg-[#F0F0F3] relative">
      {/* 히어로 이미지 */}
      <HeroSlider
        images={[artwork.images.find((img) => img.isThumbnail)?.imageUrl || '']}
        onBack={() => navigate(-1)}
      />

      {/* 작품 메타 (제목, 작가, 소속전시, 저장버튼) */}
      <ArtworkMeta artwork={artwork} />

      {/* 소개 / 방명록 탭 */}
      <ArtworkTabNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 탭 콘텐츠 */}
      {activeTab === 'intro' && <ArtworkIntroTab artwork={artwork} />}
      {activeTab === 'guestbook' && <ArtworkGuestbookTab reviews={reviews} questions={questions} />}

      {/* 하단 고정 바 */}
      <BottomFixedBar />
    </div>
  );
}
