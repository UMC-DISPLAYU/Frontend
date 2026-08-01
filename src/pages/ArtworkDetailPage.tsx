import { useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { ArtworkGuestbookTab } from '@/components/artworkdetailpage/ArtworkGuestbookTab';
import { ArtworkIntroTab } from '@/components/artworkdetailpage/ArtworkIntroTab';
import { ArtworkMeta } from '@/components/artworkdetailpage/ArtworkMeta';
import { ArtworkSaveButton } from '@/components/artworkdetailpage/ArtworkSaveButton';
import { ArtworkTabNav } from '@/components/artworkdetailpage/ArtworkTabNav';
import { GuestbookInputBar } from '@/components/artworkdetailpage/GuestbookInputBar';
import { ErrorView } from '@/components/common';
import { BottomFixedBar } from '@/components/displaydetailpage/BottomFixedBar';
import { HeroSlider } from '@/components/displaydetailpage/HeroSlider';
import { useArtworkDetail } from '@/hooks/queries/useArtworkDetail';
import type { ArtworkGuestbookTab as ArtworkGuestbookSubTabType } from '@/types/exhibition';
import { mapArtworkDetailDto } from '@/utils/artworkMapper';
import { cn } from '@/utils/cn';

const containerClassName =
  'w-full max-w-md mx-auto min-h-dvh flex flex-col justify-center items-center';

export function ArtworkDetailPage() {
  const navigate = useNavigate();
  const { artworkId: artworkIdParam } = useParams<{ artworkId: string }>();
  const artworkId = Number(artworkIdParam);

  const [activeTab, setActiveTab] = useState<'intro' | 'guestbook'>('intro');
  const [activeSubTab, setActiveSubTab] = useState<ArtworkGuestbookSubTabType>('review');
  const [isArtistView, setIsArtistView] = useState(false);

  const { data: artworkDto, isPending, isError } = useArtworkDetail(artworkId);
  const artwork = artworkDto ? mapArtworkDetailDto(artworkDto) : undefined;

  // 유효하지 않은 artworkId 즉시 처리
  if (!Number.isFinite(artworkId) || artworkId <= 0) {
    return (
      <ErrorView
        title="작품 정보를 찾을 수 없습니다"
        message="요청하신 작품 정보가 존재하지 않거나 삭제되었습니다."
        onRetry={() => navigate(-1)}
      />
    );
  }

  if (isPending) {
    return (
      <div className={cn(containerClassName, 'bg-page')}>
        <p className="typo-body-sm-regular text-faint">불러오는 중...</p>
      </div>
    );
  }

  if (isError || !artwork) {
    return (
      <div className={cn(containerClassName, 'gap-3 bg-page')}>
        <p className="typo-body-sm-regular text-sub600">작품 정보를 불러오지 못했습니다.</p>
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

  const heroImages = artwork.images
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((img) => img.imageUrl);

  const handleSendGuestbook = () => {
    // TODO: createArtworkFeeling / createArtworkQuestion API 연동 예정
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-dvh bg-page relative">
      {/* 히어로 이미지 */}
      <HeroSlider images={heroImages} onBack={() => navigate(-1)} />

      {/* 작품 메타 (제목, 작가, 소속전시, 저장버튼) */}
      <ArtworkMeta artwork={artwork} />

      {/* 소개 / 방명록 탭 */}
      <ArtworkTabNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 탭 콘텐츠 */}
      {activeTab === 'intro' && <ArtworkIntroTab artwork={artwork} />}
      {activeTab === 'guestbook' && (
        <ArtworkGuestbookTab
          reviews={[]}
          questions={[]}
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
