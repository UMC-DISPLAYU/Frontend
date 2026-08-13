import { useRef } from 'react';

import { Link } from 'react-router-dom';

import type { ArtworkPreviewItemDto } from '@/api/dto';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { SectionHeader } from '@/components/homepage/SectionHeader';

type Props = {
  items: ArtworkPreviewItemDto[];
  onMoreClick?: () => void;
};

export function ArtworkPreviewSection({ items, onMoreClick }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.shiftKey) {
      e.preventDefault();
      if (scrollRef.current) {
        scrollRef.current.scrollLeft += e.deltaY;
      }
    }
  };

  return (
    <section className="mb-7">
      <SectionHeader title="작품 미리보기" onLinkClick={onMoreClick} />
      <div
        ref={scrollRef}
        onWheel={handleWheel}
        className="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-none"
      >
        {items.map((item) => (
          <Link
            key={item.artworkId}
            to={`/artwork/${item.artworkId}`}
            className="relative shrink-0 w-34 h-55 rounded-xl overflow-hidden bg-box200 cursor-pointer hover:opacity-90 active:scale-95 transition-all block focus:outline-none focus-visible:ring-2 focus-visible:ring-main"
          >
            <OptimizedImage
              src={item.artworkImageUrl}
              displayWidth={136}
              alt={item.artworkName}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/15 to-transparent" />

            <div className="absolute left-3 right-3 bottom-3">
              <p className="typo-body-sm-bold text-white">{item.artworkName}</p>
              <p className="typo-body-xxs-regular text-bt-gray">{item.artistName}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
