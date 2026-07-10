import { useNavigate } from 'react-router-dom';

import type { ArtworkDetail } from '@/types/exhibition';

type Props = {
  artwork: ArtworkDetail;
};

export function ArtworkMeta({ artwork }: Props) {
  const navigate = useNavigate();

  return (
    <div className="bg-[#F0F0F3] px-5 pt-5 pb-4">
      {/* 제목 + 북마크 */}
      <div className="flex items-start justify-between gap-3 mb-1">
        <h1 className="text-[20px] font-bold text-[#111] leading-snug font-[Pretendard,sans-serif]">
          {artwork.artworkName}
        </h1>
        <div className="flex flex-col items-center shrink-0">
          <button type="button" aria-label="저장" className="cursor-pointer">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#888"
              strokeWidth="1.8"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
          <span className="text-[11px] text-[#888] mt-0.5 font-[Pretendard,sans-serif]">
            {artwork.bookmarkCount}
          </span>
        </div>
      </div>

      {/* 작가명 */}
      <p className="text-[14px] text-[#555] mb-4 font-[Pretendard,sans-serif]">{artwork.artist}</p>

      {/* 소속 전시 카드 */}
      <button
        type="button"
        onClick={() => navigate(`/display/${artwork.exhibitionId}`)}
        className="w-full flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 mb-4 cursor-pointer"
      >
        <div className="text-[10px] text-[#888] whitespace-nowrap font-[Pretendard,sans-serif] shrink-0">
          소속전시
        </div>
        <img
          src={artwork.exhibitionThumbnail}
          alt="전시 썸네일"
          className="w-10 h-8 object-cover rounded shrink-0"
        />
        <div className="flex flex-col min-w-0 text-left">
          <p className="text-[13px] font-bold text-[#111] truncate font-[Pretendard,sans-serif]">
            {artwork.exhibitionTitle}
          </p>
          <p className="text-[11px] text-[#666] truncate font-[Pretendard,sans-serif]">
            {artwork.exhibitionOrganizer}
          </p>
          <p className="text-[11px] text-[#aaa] font-[Pretendard,sans-serif]">
            🗓 {artwork.exhibitionPeriod}
          </p>
        </div>
        <svg
          className="shrink-0 ml-auto"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#bbb"
          strokeWidth="2"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* 작품 저장 버튼 */}
      <button
        type="button"
        className="w-full py-3.5 rounded-xl bg-white border border-[#e0e0e0] text-[#111] text-[15px] font-bold font-[Pretendard,sans-serif] flex items-center justify-center gap-2"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
        작품 저장
      </button>
    </div>
  );
}
