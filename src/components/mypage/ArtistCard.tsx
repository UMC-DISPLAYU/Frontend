import { Bookmark, ChevronRight } from 'lucide-react';

import { OptimizedImage } from '@/components/common/OptimizedImage';
import { FALLBACK_PROFILE_IMAGE } from '@/constants';
import type { ArtistItem } from '@/types/mypage';

interface ArtistCardProps {
  item: ArtistItem;
  onUnarchive?: (item: ArtistItem) => void;
  onOpen?: (item: ArtistItem) => void;
}

export function ArtistCard({ item, onUnarchive, onOpen }: ArtistCardProps) {
  const openHandlers = onOpen
    ? {
        role: 'button' as const,
        tabIndex: 0,
        onClick: () => onOpen(item),
        onKeyDown: (event: React.KeyboardEvent) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;

          event.preventDefault();
          onOpen(item);
        },
      }
    : {};

  return (
    <article className="w-full bg-card rounded-2xl overflow-hidden">
      <div
        {...openHandlers}
        className={`flex items-center gap-3.5 px-3 py-3.5 ${onOpen ? 'cursor-pointer' : ''}`}
      >
        <div className="size-12 rounded-full bg-box200 overflow-hidden shrink-0">
          <OptimizedImage
            className="w-full h-full object-cover"
            src={item.thumbnail || FALLBACK_PROFILE_IMAGE}
            displayWidth={48}
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
          <button
            type="button"
            aria-label="북마크 해제"
            onClick={(event) => {
              event.stopPropagation();
              onUnarchive?.(item);
            }}
          >
            <Bookmark fill="currentColor" className="size-4 text-bookmark" />
          </button>
          <ChevronRight className="size-4 text-hint" />
        </div>
      </div>
    </article>
  );
}
