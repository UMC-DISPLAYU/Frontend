import { useSwipeSlider } from '@/hooks/useSwipeSlider';
import { cn } from '@/utils/cn';

type Props = {
  images: string[];
};

export function HeroSlider({ images }: Props) {
  const { activeIndex, setActiveIndex, dragOffset, isDragging, handlers } = useSwipeSlider({
    itemCount: images.length,
  });

  return (
    <div
      {...handlers}
      className="relative w-full overflow-hidden bg-main select-none touch-pan-y cursor-grab active:cursor-grabbing"
      style={{ height: '568px' }}
    >
      <div
        className="flex h-full w-full"
        style={{
          transform: `translateX(calc(-${activeIndex * 100}% + ${dragOffset}px))`,
          transition: isDragging ? 'none' : 'transform 300ms ease-out',
        }}
      >
        {images.map((src, idx) => (
          <div key={src || idx} className="relative h-full w-full shrink-0">
            <img
              src={src}
              alt={`전시 이미지 ${idx + 1}`}
              draggable={false}
              className="h-full w-full object-cover select-none"
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`슬라이드 ${idx + 1}`}
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex(idx);
              }}
              className={cn(
                'w-1.75 h-1.75 rounded-full border-none p-0 cursor-pointer shrink-0 transition-all duration-200',
                idx === activeIndex ? 'bg-line-active' : 'bg-[#667281]',
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
