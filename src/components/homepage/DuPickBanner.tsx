import { useEffect } from 'react';

import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import type { DuPickDto } from '@/api/dto';
import { useSwipeSlider } from '@/hooks/useSwipeSlider';

type Props = {
  items: DuPickDto[];
};

export function DuPickBanner({ items }: Props) {
  const navigate = useNavigate();
  const { activeIndex, setActiveIndex, dragOffset, isDragging, handlers } = useSwipeSlider({
    itemCount: items.length,
  });

  useEffect(() => {
    if (items.length === 0 || isDragging) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [items.length, activeIndex, isDragging, setActiveIndex]);

  if (items.length === 0) return null;

  return (
    <section className="pb-7">
      <div className="px-4 mb-2.5 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 typo-heading-3xl text-main">
          <span>DU Pick</span>
        </h2>
        <button
          type="button"
          aria-label="전시 등록 버튼"
          onClick={() => navigate('/exhibition-register')}
          className="cursor-pointer border-none bg-transparent p-0"
        >
          <Plus strokeWidth={1.5} className="size-8" />
        </button>
      </div>

      <div className="px-4">
        <div
          {...handlers}
          className="relative h-128.25 overflow-hidden bg-[#D1D5DB] select-none touch-pan-y cursor-grab active:cursor-grabbing"
        >
          <div
            className="flex h-full w-full"
            style={{
              transform: `translateX(calc(-${activeIndex * 100}% + ${dragOffset}px))`,
              transition: isDragging ? 'none' : 'transform 300ms ease-out',
            }}
          >
            {items.map((item, i) => (
              <div key={item.duPickId || i} className="relative h-full w-full shrink-0">
                {item.bannerImageUrl && (
                  <img
                    src={item.bannerImageUrl}
                    alt={item.title}
                    draggable={false}
                    className="absolute inset-0 h-full w-full object-cover select-none"
                  />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/20 to-transparent pointer-events-none" />

                <div className="absolute bottom-9 left-7 right-4 pointer-events-none">
                  <p className="mb-1.5 typo-body-xl-bold text-white">{item.title}</p>
                  <p className="typo-body-xs-regular text-faint">{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="absolute bottom-3.5 inset-x-0 z-10 flex items-center justify-center gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`슬라이드 ${i + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex(i);
                }}
                className={`w-1.75 h-1.75 rounded-full border-none p-0 cursor-pointer shrink-0 transition-all duration-200 ${
                  i === activeIndex ? 'bg-line-active' : 'bg-[#667281]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
