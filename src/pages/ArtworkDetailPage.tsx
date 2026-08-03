import { useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { ArtworkGuestbookTab } from '@/components/artworkdetailpage/ArtworkGuestbookTab';
import { ArtworkIntroTab } from '@/components/artworkdetailpage/ArtworkIntroTab';
import { ArtworkMeta } from '@/components/artworkdetailpage/ArtworkMeta';
import { ArtworkSaveButton } from '@/components/artworkdetailpage/ArtworkSaveButton';
import { ArtworkTabNav } from '@/components/artworkdetailpage/ArtworkTabNav';
import { BottomCommentBar, ErrorView } from '@/components/common';
import { BottomFixedBar } from '@/components/displaydetailpage/BottomFixedBar';
import { HeroSlider } from '@/components/displaydetailpage/HeroSlider';
import type {
  ArtworkDetail,
  ArtworkGuestbookTab as ArtworkGuestbookSubTabType,
  GuestbookQuestion,
  GuestbookReview,
} from '@/types/exhibition';

function getArtworkDetailFromApiPlaceholder(): ArtworkDetail | undefined {
  return undefined;
}

export function ArtworkDetailPage() {
  const navigate = useNavigate();
  const { artworkId } = useParams<{ artworkId: string }>();
  const [activeTab, setActiveTab] = useState<'intro' | 'guestbook'>('intro');
  const [activeSubTab, setActiveSubTab] = useState<ArtworkGuestbookSubTabType>('review');
  const [isArtistView, setIsArtistView] = useState(false);

  const artwork = getArtworkDetailFromApiPlaceholder();

  const [prevArtworkId, setPrevArtworkId] = useState(artworkId);
  const [reviews, setReviews] = useState<GuestbookReview[]>(() => []);
  const [questions, setQuestions] = useState<GuestbookQuestion[]>(() => []);

  if (prevArtworkId !== artworkId) {
    setPrevArtworkId(artworkId);
    setReviews([]);
    setQuestions([]);
  }

  const handleSendGuestbook = (_payload: {
    content: string;
    imageUrls: string[];
    isPrivate: boolean;
  }) => {
    // TODO: 작품 방명록 작성 API 연결
  };

  if (!artwork) {
    return (
      <ErrorView
        title="작품 정보를 찾을 수 없습니다"
        message="요청하신 작품 정보가 존재하지 않거나 삭제되었습니다."
        onRetry={() => navigate(-1)}
      />
    );
  }

  return (
    <div className="w-full max-w-md mx-auto min-h-dvh bg-page relative">
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
      {activeTab === 'guestbook' && (
        <ArtworkGuestbookTab
          reviews={reviews}
          questions={questions}
          activeSubTab={activeSubTab}
          onSubTabChange={setActiveSubTab}
          isArtistView={isArtistView}
          onArtistViewChange={setIsArtistView}
        />
      )}

      {/* 하단 고정 바: 소개 탭은 저장버튼, 방명록 탭은 글쓰기 입력 바 */}
      {activeTab === 'intro' ? (
        <BottomFixedBar button={<ArtworkSaveButton className="w-full" />} />
      ) : (
        <BottomCommentBar
          /* 일반인 시점 질문 탭에서만 비공개로 남길 수 있습니다. */
          showPrivateOption={activeSubTab === 'question' && !isArtistView}
          onSubmit={handleSendGuestbook}
        />
      )}
    </div>
  );
}
