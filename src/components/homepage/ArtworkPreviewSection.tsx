import { useRef } from 'react';

import { SectionHeader } from '@/components/homepage/SectionHeader';
import type { ArtworkPreviewItem } from '@/types/exhibition';

type Props = {
  items: ArtworkPreviewItem[];
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
            key={item.id}
            className="relative shrink-0 w-34 h-55 rounded-xl overflow-hidden bg-box"
          >
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/15 to-transparent" />

            <div className="absolute left-3 right-3 bottom-3">
              <p className="typo-body-sm-bold text-white">{item.name}</p>
              <p className="typo-body-xs-regular text-faint">{item.date}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
