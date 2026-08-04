import { Bookmark } from 'lucide-react';

import type { SavedArtworkItem } from '@/types/mypage';

interface ArtworkCardProps {
  item: SavedArtworkItem;
  isArtistView?: boolean;
}

export function ArtworkCard({ item, isArtistView = false }: ArtworkCardProps) {
  return (
    <article className="bg-card rounded-2xl shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)] flex flex-col overflow-hidden">
      <div className="p-1.5 pb-0">
        <div className="relative rounded-xl overflow-hidden">
          <div className="w-full h-44 bg-box200">
            <img className="w-full h-full object-cover" src={item.thumbnail} alt={item.title} />
          </div>
          {!isArtistView && (
            <button type="button" aria-label="북마크" className="absolute bottom-2 right-2">
              <Bookmark fill="currentColor" className="size-4 text-heart" />
            </button>
          )}
        </div>
      </div>

      <div className="px-2.5 pt-2 pb-3 flex flex-col gap-1">
        <div className="typo-body-sm-bold text-main truncate">{item.title}</div>
        <div className="typo-body-xs-regular text-main truncate">{item.artist}</div>
      </div>
    </article>
  );
}
