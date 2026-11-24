import { type KeyboardEvent, useRef, useState } from 'react';

import type { ImageFitDto, PosterCropDto } from '@/api/dto';
import { FitImage } from '@/components/common/FitImage';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { cn } from '@/utils/cn';
import { POSTER_FIT_RULE } from '@/utils/imageFit';

import { PlayMarkIcon, PosterVideoSlide } from './PosterVideoSlide';

/** src 는 보일 이미지(영상이면 썸네일), videoSrc 는 영상 포스터의 영상 주소 */
export type PosterSlide = { src: string; videoSrc?: string };

type Props = {
  posters: PosterSlide[];
  title: string;
  /** 대표 포스터(첫 장)의 보이는 방식. 전체 보이기면 남는 곳을 가장자리 색으로 칠한다 */
  representativeFit?: {
    crop?: PosterCropDto | null;
    fit?: ImageFitDto | null;
    edgeColor?: string | null;
  };
};

const POSTER_IMAGE_WIDTH = 1080;

const scrollBehavior = (): ScrollBehavior =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

/*
 * 포스터는 자르지 않고 전체를 보여주고(contain), 남는 곳은 연한 회색으로 채운다.
 * 여러 장이면 옆으로 넘기고 오른쪽 위에 장수를 보인다.
 * 900px 이상은 포스터 아래에 썸네일 목록이 가로로 붙는다. 프로토타입은 왼쪽 세로 목록이지만,
 * 그만큼 포스터가 작아져서 아래 가로 줄로 옮겼다(PM/FE 2차 회의 2026-11-16). 1장이면 썸네일 줄을 숨긴다
 *
 * 900px 이상 포스터 칸은 창 높이로 막지 않고 칸 폭에 맞춘 402:568 그대로 둔다(세로 포스터 양옆 회색 없애기, #676).
 * 그래서 포스터 열이 창보다 길 수 있어, 붙는 위치(top)를 창 높이 − 열 높이까지 올려 열 아래끝(썸네일 줄)이
 * 화면 안에서 멈추게 한다. 열 폭은 DisplayDetailView 그리드(@container)의 40%(최소 320)다
 */
export function PosterCarousel({ posters, title, representativeFit }: Props) {
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
    <div
      className={cn(
        'relative desktop:sticky desktop:top-[min(calc(var(--detail-top)+2rem),calc(100dvh-var(--poster-column-h)-2rem))] desktop:flex desktop:flex-col desktop:gap-3',
        hasMultiple
          ? 'desktop:[--poster-column-h:calc(max(320px,40cqw)*568/402+4.75rem)]'
          : 'desktop:[--poster-column-h:calc(max(320px,40cqw)*568/402)]',
      )}
    >
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
                <FitImage
                  src={src}
                  displayWidth={POSTER_IMAGE_WIDTH}
                  alt={`${title} 포스터 ${index + 1}`}
                  draggable={false}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  detail
                  crop={representativeFit?.crop}
                  // 대표 포스터만 보이는 방식을 따르고, 나머지는 지금처럼 전체 + 연한 회색
                  fit={index === 0 ? representativeFit?.fit : 'FILL'}
                  rule={POSTER_FIT_RULE}
                  fitClassName="bg-secondary"
                  fitColor={representativeFit?.edgeColor}
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
