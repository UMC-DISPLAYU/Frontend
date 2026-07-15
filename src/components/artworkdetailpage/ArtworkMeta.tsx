import { Calendar, ChevronRight, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ArtworkSaveButton } from '@/components/artworkdetailpage/ArtworkSaveButton';
import type { ArtworkDetail } from '@/types/exhibition';

type Props = {
  artwork: ArtworkDetail;
};

export function ArtworkMeta({ artwork }: Props) {
  const navigate = useNavigate();

  return (
    <div className="bg-[#F0F0F3] px-5 pt-5 pb-6">
      {/* 제목/하트 */}
      <div className="flex items-start justify-between gap-3">
        <h1 className="typo-body-2xl-bold text-main">{artwork.artworkName}</h1>
        <div className="flex flex-col items-center shrink-0">
          <button type="button" aria-label="좋아요" className="cursor-pointer">
            <Heart strokeWidth={1.2} className="size-6" />
          </button>
          <span className="typo-body-xs-regualr text-main">{artwork.bookmarkCount}</span>
        </div>
      </div>

      {/* 작가명 */}
      <p className="typo-body-sm-regular text-main mb-4 -mt-1.5">{artwork.artist}</p>

      {/* 소속 전시 카드 */}
      <button
        type="button"
        onClick={() => navigate(`/display/${artwork.exhibitionId}`)}
        className="w-full flex items-center p-3 bg-[#F0F0F3] rounded-xl mb-4 cursor-pointer"
        style={{
          boxShadow:
            '8px 8px 18px 0px rgba(67, 0, 209, 0.04), inset 2.5px 2.5px 4px 0px rgba(0, 0, 0, 0.15), inset -2.5px -2.5px 4px 0px rgba(255, 255, 255, 1.00)',
        }}
      >
        <div className="flex items-center gap-3 w-full min-w-0">
          {/* 썸네일 이미지 */}
          <div className="w-15.25 h-21.5 shrink-0 rounded-sm overflow-hidden bg-gray-200">
            <img
              src={artwork.exhibitionThumbnail}
              alt="전시 썸네일"
              className="w-full h-full object-cover"
            />
          </div>

          {/* 텍스트 영역 */}
          <div className="flex flex-col justify-start items-start gap-2 min-w-0 flex-1 text-left">
            {/* 소속전시 배지 */}
            <div className="px-2 py-0.5 bg-[#DEDEE6] rounded-sm inline-flex justify-start items-start">
              <span className="text-sky-600 text-[10px] font-bold font-['Pretendard']">
                소속전시
              </span>
            </div>

            {/* 제목, 설명, 날짜 */}
            <div className="self-stretch flex flex-col justify-start items-start gap-1.5 min-w-0">
              <div className="self-stretch flex flex-col justify-start items-start gap-0.5 min-w-0">
                <h2 className="self-stretch text-neutral-900 text-sm font-bold font-['Pretendard'] leading-5 truncate">
                  {artwork.exhibitionTitle}
                </h2>
                <p className="self-stretch text-neutral-600 text-xs font-normal font-['Pretendard'] leading-4 truncate">
                  {artwork.exhibitionOrganizer}
                </p>
              </div>
              <div className="self-stretch flex justify-start items-center gap-1 text-neutral-400">
                <Calendar size={12} className="shrink-0" />
                <span className="text-[10px] font-normal font-['Pretendard'] leading-3">
                  {artwork.exhibitionPeriod}
                </span>
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <ChevronRight size={25} className="text-[#0068D9]" strokeWidth={2} />
          </div>
        </div>
      </button>

      <ArtworkSaveButton />
    </div>
  );
}
