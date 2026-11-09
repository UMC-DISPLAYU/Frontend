import { type KeyboardEvent, useRef, useState } from 'react';

import { DetailBackButton } from '@/components/common/detail';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { cn } from '@/utils/cn';

type Props = {
  images: string[];
  title: string;
  onBack: () => void;
  /* 900px 이상은 서비스 헤더가 있어 뒤로가기를 빼지만, 미리보기는 포스터 위에 둔다 */
  isPreview?: boolean;
};

const POSTER_IMAGE_WIDTH = 1080;

const scrollBehavior = (): ScrollBehavior =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

/*
 * 포스터는 자르지 않고 전체를 보여주고(contain), 남는 곳은 연한 회색으로 채운다.
 * 여러 장이면 옆으로 넘기고 오른쪽 위에 장수를 보인다. 900px 이상은 왼쪽에 세로 썸네일 목록이 붙는다.
 */
export function PosterCarousel({ images, title, onBack, isPreview = false }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const hasMultiple = images.length > 1;

  const goTo = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const next = Math.max(0, Math.min(images.length - 1, index));
    track.scrollTo({ left: next * track.clientWidth, behavior: scrollBehavior() });
  };

  const handleScroll = () => {
    const track = trackRef.current;
    if (track && track.clientWidth > 0)
      setCurrent(Math.round(track.scrollLeft / track.clientWidth));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') goTo(current + 1);
    if (event.key === 'ArrowLeft') goTo(current - 1);
  };

  return (
    <div className="relative desktop:sticky desktop:top-[calc(var(--detail-top)+2rem)] desktop:flex desktop:items-start desktop:gap-3">
      {hasMultiple && (
        <div
          role="group"
          aria-label="포스터 목록"
          className="hidden max-h-[calc(100dvh-8.75rem)] shrink-0 flex-col gap-1.5 overflow-y-auto [scrollbar-width:none] desktop:flex [&::-webkit-scrollbar]:hidden"
        >
          {images.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              aria-label={`포스터 ${index + 1} 보기`}
              aria-current={index === current}
              onClick={() => goTo(index)}
              className={cn(
                'h-16 w-12 shrink-0 cursor-pointer overflow-hidden rounded-6 border-2 transition-opacity duration-fast ease-standard hover:opacity-100',
                index === current
                  ? 'border-bg-primary-black opacity-100'
                  : 'border-transparent opacity-55',
              )}
            >
              <OptimizedImage
                src={src}
                displayWidth={96}
                alt=""
                draggable={false}
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <div className="relative aspect-402/568 overflow-hidden bg-secondary min-[37.5rem]:mx-auto min-[37.5rem]:mt-6 min-[37.5rem]:max-w-120 min-[37.5rem]:rounded-16 desktop:mx-0 desktop:mt-0 desktop:max-w-none desktop:min-w-0 desktop:flex-1">
        <div
          ref={trackRef}
          role="group"
          aria-roledescription="캐러셀"
          aria-label="전시 포스터"
          tabIndex={hasMultiple ? 0 : undefined}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          className="flex h-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus [&::-webkit-scrollbar]:hidden"
        >
          {images.map((src, index) => (
            <div
              key={`${src}-${index}`}
              aria-label={`포스터 ${index + 1} / ${images.length}`}
              className="h-full w-full shrink-0 snap-center"
            >
              <OptimizedImage
                src={src}
                displayWidth={POSTER_IMAGE_WIDTH}
                alt={`${title} 포스터 ${index + 1}`}
                draggable={false}
                loading={index === 0 ? 'eager' : 'lazy'}
                className="size-full object-contain select-none"
              />
            </div>
          ))}
        </div>

        {hasMultiple && (
          <span
            aria-hidden="true"
            className="typography-body-sm-medium absolute top-4 right-4 rounded-circle bg-base-black/60 px-2 py-0.75 text-base-white tabular-nums"
          >
            {current + 1} / {images.length}
          </span>
        )}

        {/* 900px 미만은 화면을 따라 내려오는 뒤로가기를 DisplayDetailView 가 따로 둔다 */}
        {isPreview && (
          <DetailBackButton onBack={onBack} className="absolute top-5 left-5 hidden desktop:grid" />
        )}
      </div>
    </div>
  );
}
