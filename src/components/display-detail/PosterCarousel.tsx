import { type KeyboardEvent, useRef, useState } from 'react';

import { OptimizedImage } from '@/components/common/OptimizedImage';
import { cn } from '@/utils/cn';

import { PlayMarkIcon, PosterVideoSlide } from './PosterVideoSlide';

/** src 는 보일 이미지(영상이면 썸네일), videoSrc 는 영상 포스터의 영상 주소 */
export type PosterSlide = { src: string; videoSrc?: string };

type Props = {
  posters: PosterSlide[];
  title: string;
};

const POSTER_IMAGE_WIDTH = 1080;

const scrollBehavior = (): ScrollBehavior =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

/*
 * 포스터는 자르지 않고 전체를 보여주고(contain), 남는 곳은 연한 회색으로 채운다.
 * 여러 장이면 옆으로 넘기고 오른쪽 위에 장수를 보인다.
 * 900px 이상은 포스터 아래에 썸네일 목록이 가로로 붙는다. 프로토타입은 왼쪽 세로 목록이지만,
 * 그만큼 포스터가 작아져서 아래 가로 줄로 옮겼다(PM/FE 2차 회의 2026-11-16)
 */
export function PosterCarousel({ posters, title }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const hasMultiple = posters.length > 1;

  const goTo = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const next = Math.max(0, Math.min(posters.length - 1, index));
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
    <div className="relative desktop:sticky desktop:top-[calc(var(--detail-top)+2rem)] desktop:flex desktop:flex-col desktop:gap-3">
      <div className="relative aspect-402/568 overflow-hidden bg-secondary min-[37.5rem]:mx-auto min-[37.5rem]:mt-6 min-[37.5rem]:max-w-120 desktop:mx-0 desktop:mt-0 desktop:max-w-none">
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
          {posters.map(({ src, videoSrc }, index) => (
            <div
              key={`${src}-${index}`}
              aria-label={`포스터 ${index + 1} / ${posters.length}${videoSrc ? ', 영상' : ''}`}
              className="h-full w-full shrink-0 snap-center"
            >
              {videoSrc ? (
                <PosterVideoSlide src={videoSrc} thumbnailSrc={src} trackRef={trackRef} />
              ) : (
                <OptimizedImage
                  src={src}
                  displayWidth={POSTER_IMAGE_WIDTH}
                  alt={`${title} 포스터 ${index + 1}`}
                  draggable={false}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  className="size-full object-contain select-none"
                />
              )}
            </div>
          ))}
        </div>

        {hasMultiple && (
          <span
            aria-hidden="true"
            className="typography-body-sm-medium absolute top-4 right-4 rounded-circle bg-base-black/60 px-2 py-0.75 text-base-white tabular-nums"
          >
            {current + 1} / {posters.length}
          </span>
        )}
      </div>

      {hasMultiple && (
        <div
          role="group"
          aria-label="포스터 목록"
          className="hidden gap-1.5 overflow-x-auto [scrollbar-width:none] desktop:flex [&::-webkit-scrollbar]:hidden"
        >
          {posters.map(({ src, videoSrc }, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              aria-label={videoSrc ? '영상 포스터 보기' : `포스터 ${index + 1} 보기`}
              aria-current={index === current}
              onClick={() => goTo(index)}
              className={cn(
                'relative h-16 w-12 shrink-0 cursor-pointer overflow-hidden border-2 transition-opacity duration-fast ease-standard hover:opacity-100',
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
              {videoSrc && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-0.5 left-0.5 grid size-4 place-items-center rounded-circle bg-[rgba(0,0,0,0.6)] text-base-white"
                >
                  <PlayMarkIcon className="size-2" />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
