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
    <section className="px-5 pt-6 pb-4 font-[Pretendard,sans-serif]">
      {/* 제목/하트 */}
      <div className="flex items-start justify-between gap-2">
        <h1 className="flex-1 typo-body-xl-bold text-main">{ex.title}</h1>
        <button
          type="button"
          id="meta-heart-btn"
          onClick={() => setBookmarked((v) => !v)}
          className="flex flex-col items-center gap-0.5 shrink-0 pt-0.5 transition-all duration-200 active:scale-95"
        >
          <Heart
            size={17}
            fill={bookmarked ? '#c32427' : 'none'}
            color={bookmarked ? '#c32427' : '#888'}
          />
          <span className="typo-body-xs-regular text-main">{likeCount}</span>
        </button>
      </div>
      <p className="typo-body-sm-regular text-sub600">{ex.subtitle}</p>

      {/* 일정/운영/장소 */}
      <div className="mt-5 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 typo-body-sm-regular">
          <Calendar size={13} className="text-faint shrink-0" />
          <span className="text-faint font-medium w-6 shrink-0">일정</span>
          <span>{ex.period}</span>
        </div>
        <div className="flex items-center gap-2 typo-body-sm-regular">
          <Clock size={13} className="text-faint shrink-0" />
          <span className="text-faint font-medium w-6 shrink-0">운영</span>
          <span>{ex.hours}</span>
        </div>
        <div className="flex items-center gap-2 typo-body-sm-regular">
          <MapPin size={13} className="text-faint shrink-0" />
          <span className="text-faint font-medium w-6 shrink-0">장소</span>
          <span>{ex.location}</span>
        </div>
      </div>
      <div className="px-1 pt-10">
        <DisplaySaveButton />
      </div>
    </section>
  );
}
