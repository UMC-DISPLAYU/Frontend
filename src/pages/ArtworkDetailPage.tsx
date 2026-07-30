import { useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { ArtworkGuestbookTab } from '@/components/artworkdetailpage/ArtworkGuestbookTab';
import { ArtworkIntroTab } from '@/components/artworkdetailpage/ArtworkIntroTab';
import { ArtworkMeta } from '@/components/artworkdetailpage/ArtworkMeta';
import { ArtworkSaveButton } from '@/components/artworkdetailpage/ArtworkSaveButton';
import { ArtworkTabNav } from '@/components/artworkdetailpage/ArtworkTabNav';
import { GuestbookInputBar } from '@/components/artworkdetailpage/GuestbookInputBar';
import { BottomFixedBar } from '@/components/displaydetailpage/BottomFixedBar';
import { HeroSlider } from '@/components/displaydetailpage/HeroSlider';
import { ARTWORK_DETAILS, GUESTBOOK_QUESTIONS, GUESTBOOK_REVIEWS } from '@/mocks/exhibition';
import type {
  ArtworkGuestbookTab as ArtworkGuestbookSubTabType,
  GuestbookQuestion,
  GuestbookReview,
} from '@/types/exhibition';

export function ArtworkDetailPage() {
  const navigate = useNavigate();
  const { artworkId } = useParams<{ artworkId: string }>();
  const [activeTab, setActiveTab] = useState<'intro' | 'guestbook'>('intro');
  const [activeSubTab, setActiveSubTab] = useState<ArtworkGuestbookSubTabType>('review');
  const [isArtistView, setIsArtistView] = useState(false);

  const artwork = artworkId ? ARTWORK_DETAILS[artworkId] : undefined;

  const [prevArtworkId, setPrevArtworkId] = useState(artworkId);
  const [reviews, setReviews] = useState<GuestbookReview[]>(() =>
    artworkId ? GUESTBOOK_REVIEWS[artworkId] || [] : [],
  );
  const [questions, setQuestions] = useState<GuestbookQuestion[]>(() =>
    artworkId ? GUESTBOOK_QUESTIONS[artworkId] || [] : [],
  );

  if (prevArtworkId !== artworkId) {
    setPrevArtworkId(artworkId);
    setReviews(artworkId ? GUESTBOOK_REVIEWS[artworkId] || [] : []);
    setQuestions(artworkId ? GUESTBOOK_QUESTIONS[artworkId] || [] : []);
  }

  const handleSendGuestbook = (content: string, isPrivate: boolean) => {
    if (activeSubTab === 'review') {
      const newReview: GuestbookReview = {
        feelingId: Date.now(),
        user: { userId: 99, nickname: isArtistView ? artwork?.artist || '작가' : '나' },
        createdAt: '방금 전',
        content,
        reply: null,
        isArtist: isArtistView,
        isMyReview: true,
        likeCount: 0,
      };
      setReviews((prev) => [newReview, ...prev]);
    } else {
      const newQuestion: GuestbookQuestion = {
        questionId: Date.now(),
        user: { userId: 99, nickname: '나' },
        createdAt: '방금 전',
        content,
        isPublic: !isPrivate,
        reply: null,
        isMyQuestion: true,
        likeCount: 0,
      };
      setQuestions((prev) => [newQuestion, ...prev]);
    }
  };

  if (!artwork) {
    return (
      <div className="w-full max-w-md mx-auto min-h-dvh flex flex-col items-center justify-center gap-3 bg-page">
        <p className="typo-body-sm-regular text-sub600">작품 정보를 찾을 수 없습니다.</p>
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

  return (
    <div className="w-full max-w-md mx-auto min-h-dvh bg-page relative pb-24">
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
        <GuestbookInputBar
          activeSubTab={activeSubTab}
          isArtistView={isArtistView}
          onSend={handleSendGuestbook}
        />
      )}
    </div>
  );
}
