import { Bookmark, ChevronRight } from 'lucide-react';

import { FALLBACK_PROFILE_IMAGE } from '@/constants';
import type { ArtistItem } from '@/types/mypage';

interface ArtistCardProps {
  item: ArtistItem;
  onUnarchive?: (item: ArtistItem) => void;
}

export function ArtistCard({ item, onUnarchive }: ArtistCardProps) {
  return (
    <article className="w-full bg-card rounded-2xl shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)] overflow-hidden">
      <div className="flex items-center gap-3.5 px-3 py-3.5">
        <div className="size-12 rounded-full bg-neutral-200 overflow-hidden shrink-0">
          <img
            className="w-full h-full object-cover"
            src={item.thumbnail || FALLBACK_PROFILE_IMAGE}
            alt={item.name}
            onError={(event) => {
              event.currentTarget.src = FALLBACK_PROFILE_IMAGE;
            }}
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <div className="typo-body-sm-bold text-main truncate">{item.name}</div>
          <div className="typo-body-xs-regular text-hint truncate">
            {item.field} · 등록 작품 수 {item.registeration} · (전시 수 {item.exhibition})
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button type="button" aria-label="북마크 해제" onClick={() => onUnarchive?.(item)}>
            <Bookmark color="#D70004" fill="#D70004" className="size-4" />
          </button>
          <ChevronRight className="size-4 text-hint" />
        </div>
      </div>
    </article>
  );
}
