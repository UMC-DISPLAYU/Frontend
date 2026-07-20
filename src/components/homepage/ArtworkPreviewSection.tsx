import { useRef } from 'react';

import type { ArtworkPreviewItemDto } from '@/api/dto';
import { SectionHeader } from '@/components/homepage/SectionHeader';

type Props = {
  items: ArtworkPreviewItemDto[];
};

export function ArtworkPreviewSection({ items }: Props) {
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
      <SectionHeader title="작품 미리보기" />
      <div
        ref={scrollRef}
        onWheel={handleWheel}
        className="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-none"
      >
        {items.map((item) => (
          <div
            key={item.artworkId}
            className="relative shrink-0 w-34 h-55 rounded-xl overflow-hidden bg-box"
          >
            {item.artworkImageUrl && (
              <img
                src={item.artworkImageUrl}
                alt={item.artworkName}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/15 to-transparent" />

            <div className="absolute left-3 right-3 bottom-3">
              <p className="typo-body-sm-bold text-white">{item.artworkName}</p>
              <p className="typo-body-xs-regular text-faint">
                {item.exhibitionInfo.exhibitionPeriod}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
