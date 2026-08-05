import { useEffect, useState } from 'react';

import { Calendar, ChevronRight, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ArtworkSaveButton } from '@/components/artworkdetailpage/ArtworkSaveButton';
import { LoginConfirmModal } from '@/components/common/LoginConfirmModal';
import { useToggleArtworkLike } from '@/hooks/queries/useArtworkDetail';
import { useAuthStore } from '@/stores/authStore';
import type { ArtworkDetail } from '@/types/exhibition';
import { cn } from '@/utils/cn';

type Props = {
  artwork: ArtworkDetail;
};

export function ArtworkMeta({ artwork }: Props) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const navigate = useNavigate();
  const [isAtTop, setIsAtTop] = useState(true);

  /* 좋아요 상태와 개수는 작품 상세 응답을 그대로 씁니다. */
  const liked = artwork.isBookmarked ?? false;
  const likeCount = artwork.bookmarkCount ?? 0;
  const toggleLike = useToggleArtworkLike(artwork.artworkId);

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY <= 10);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLike = () => {
    if (!accessToken) {
      setIsLoginModalOpen(true);
      return;
    }
    if (toggleLike.isPending) return;
    toggleLike.mutate(liked);
  };

  return (
    <div className="bg-page px-5 pt-5 pb-6">
      <LoginConfirmModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      {/* 제목/하트 */}
      <div className="flex items-start justify-between gap-3">
        <h1 className="typo-body-2xl-bold text-main">{artwork.artworkName}</h1>
        <div className="flex flex-col items-center shrink-0">
          <button
            type="button"
            aria-label="좋아요"
            onClick={handleLike}
            className="cursor-pointer active:scale-95 transition-transform"
          >
            <Heart
              strokeWidth={1.2}
              className={cn(
                'size-6 transition-colors duration-200',
                liked ? 'fill-heart text-heart' : 'fill-none text-main',
              )}
            />
          </button>
          <span
            className={cn('typo-body-xs-regular mt-1 transition-colors duration-200', 'text-main')}
          >
            {likeCount}
          </span>
        </div>
      </div>

      {/* 작가명 */}
      <p className="typo-body-sm-regular text-main mb-4 -mt-1.5">{artwork.artist}</p>

      {/* 소속 전시 카드 */}
      <button
        type="button"
        onClick={() => navigate(`/display/${artwork.exhibitionId}`)}
        className="w-full flex items-center gap-3 pl-3.5 pr-1.5 py-3.5 bg-page rounded-xl mb-4 cursor-pointer text-left"
        style={{
          boxShadow:
            '8px 8px 18px 0px rgba(67, 0, 209, 0.04), inset 2.5px 2.5px 4px 0px rgba(0, 0, 0, 0.15), inset -2.5px -2.5px 4px 0px rgba(255, 255, 255, 1.00)',
        }}
      >
        {/* 썸네일 이미지 */}
        <div className="w-18 h-24 shrink-0 rounded-sm overflow-hidden bg-box200">
          <img
            src={artwork.exhibitionThumbnail}
            alt="전시 썸네일"
            className="w-full h-full object-cover"
          />
        </div>

        {/* 텍스트 영역 */}
        <div className="flex flex-col justify-between h-24 min-w-0 flex-1 py-0.5">
          {/* 제목, 설명 */}
          <div className="flex flex-col justify-start items-start gap-1 min-w-0">
            <h2 className="w-full typo-body-sm-bold text-main truncate">
              {artwork.exhibitionTitle}
            </h2>
            <p className="w-full typo-body-xs-regular text-sub600 truncate">
              {artwork.exhibitionOrganizer}
            </p>
          </div>

          {/* 날짜 */}
          <div className="flex items-center gap-1.5 text-faint">
            <Calendar size={12} className="shrink-0 text-faint" strokeWidth={1.5} />
            <span className="typo-body-xxs-regular text-faint">{artwork.exhibitionPeriod}</span>
          </div>
        </div>

        {/* 오른쪽 화살표 */}
        <div className="shrink-0 -mr-0.5">
          <ChevronRight size={28} className="text-faint" strokeWidth={1.8} />
        </div>
      </button>

      {!isAtTop && (
        <ArtworkSaveButton artworkId={artwork.artworkId} saved={artwork.isBookmarked ?? false} />
      )}
    </div>
  );
}
