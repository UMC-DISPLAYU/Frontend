import { Bookmark, ChevronRight } from 'lucide-react';

import type { ArtistItem } from '@/types/mypage';

interface ArtistCardProps {
  item: ArtistItem;
}

export function ArtistCard({ item }: ArtistCardProps) {
  return (
    <article className="w-full bg-card rounded-2xl shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)] overflow-hidden">
      <div className="flex items-center gap-3.5 px-3 py-3.5">
        <div className="size-12 rounded-full bg-box overflow-hidden shrink-0">
          <img
            className="w-full h-full object-cover"
            src={item.thumbnail}
            alt={item.name}
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <div className="text-main typo-body-md-bold leading-5 truncate">
            {item.name}
          </div>
          <div className="text-sub typo-body-xs-regular leading-4 truncate">
            {item.field} · 등록 작품 수 {item.registeration} · (전시 수{' '}
            {item.exhibition})
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button type="button" aria-label="북마크">
            <Bookmark className="size-4 text-error fill-error" />
          </button>
          <ChevronRight className="size-4 text-hint" />
        </div>
      </div>
    </article>
  );
}
