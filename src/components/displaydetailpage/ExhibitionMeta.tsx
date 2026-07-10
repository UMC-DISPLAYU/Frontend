import { useState } from 'react';

import { Calendar, Clock, Heart, MapPin } from 'lucide-react';

import type { ExhibitionDetail } from '@/types/exhibition';

import { DisplaySaveButton } from './DisplaySaveButton';

type Props = {
  exhibition: ExhibitionDetail;
};

export function ExhibitionMeta({ exhibition: ex }: Props) {
  const [bookmarked, setBookmarked] = useState(ex.isBookmarked);
  const likeCount = ex.bookmarkCount;

  return (
    <section className="px-5 pt-4 pb-4 font-[Pretendard,sans-serif]">
      {/* 제목 + 하트 */}
      <div className="flex items-start justify-between gap-2">
        <h1 className="flex-1 text-neutral-900 text-xl font-bold leading-snug">{ex.title}</h1>
        <button
          type="button"
          id="meta-heart-btn"
          onClick={() => setBookmarked((v) => !v)}
          className="flex flex-col items-center gap-0.5 shrink-0 pt-0.5 transition-all duration-200 active:scale-95"
        >
          <Heart
            size={17}
            fill={bookmarked ? '#ef4444' : 'none'}
            color={bookmarked ? '#ef4444' : '#888'}
          />
          <span className="text-[13px] text-[#888]">{likeCount}</span>
        </button>
      </div>
      <p className="mt-0.5 text-neutral-600 text-sm">{ex.subtitle}</p>

      {/* 메타 정보 행: 일정/운영/장소 라벨 포함 */}
      <div className="mt-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-[13px] text-[#444]">
          <Calendar size={13} className="text-[#888] shrink-0" />
          <span className="text-[#999] font-medium w-6 shrink-0">일정</span>
          <span>{ex.period}</span>
        </div>
        <div className="flex items-center gap-2 text-[13px] text-[#444]">
          <Clock size={13} className="text-[#888] shrink-0" />
          <span className="text-[#999] font-medium w-6 shrink-0">운영</span>
          <span>{ex.hours}</span>
        </div>
        <div className="flex items-center gap-2 text-[13px] text-[#444]">
          <MapPin size={13} className="text-[#888] shrink-0" />
          <span className="text-[#999] font-medium w-6 shrink-0">장소</span>
          <span>{ex.location}</span>
        </div>
      </div>
      <div className="px-1 pt-10">
        <DisplaySaveButton />
      </div>
    </section>
  );
}
