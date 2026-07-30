import { useEffect, useState } from 'react';

import { Calendar, ChevronRight, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ArtworkSaveButton } from '@/components/artworkdetailpage/ArtworkSaveButton';
import type { ArtworkDetail } from '@/types/exhibition';

type Props = {
  artwork: ArtworkDetail;
};

export function ArtworkMeta({ artwork }: Props) {
  const navigate = useNavigate();
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY <= 10);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-page px-5 pt-5 pb-6">
      {/* 제목/하트 */}
      <div className="flex items-start justify-between gap-3">
        <h1 className="typo-body-2xl-bold text-main">{artwork.artworkName}</h1>
        <div className="flex flex-col items-center shrink-0">
          <button type="button" aria-label="좋아요" className="cursor-pointer">
            <Heart strokeWidth={1.2} className="size-6" />
          </button>
          <span className="typo-body-xs-regular text-main mt-1">{artwork.bookmarkCount}</span>
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

      {!isAtTop && <ArtworkSaveButton />}
    </div>
  );
}
