import type { KeyboardEvent, MouseEvent } from 'react';
import { Link } from 'react-router-dom';

import { FitImage } from '@/components/common/FitImage';
import { Skeleton, SkeletonList, SkeletonText } from '@/components/ui';
import type { HomeExhibitionCard } from '@/hooks/queries/useHome';
import { cn } from '@/utils/cn';
import { POSTER_FIT_RULE } from '@/utils/imageFit';

import { HomePosterVideo } from './HomePosterVideo';
import { useCenteredScroll } from './useCenteredScroll';
import { usePosterSlideMotion } from './usePosterSlideMotion';
import { useSwapIn } from './useSwapIn';

// 포스터 폭(--poster-w)은 ExhibitionShowcase 가 브레이크포인트별로 정한다
const RAIL_CLASS =
  'relative flex items-start gap-3 overflow-x-auto overscroll-x-contain px-[calc(50%-var(--poster-w)/2)] pt-4 [scrollbar-width:none] tablet:gap-4 min-[68.75rem]:gap-6 [&::-webkit-scrollbar]:hidden';

// 프로토타입 .shade-active(11-14 D안): 포스터 60%부터 아주 옅게 시작해 맨 아래까지 계속 어두워지는 곡선(사인 ease-in, 점 11개)
const ACTIVE_SHADE_GRADIENT =
  'linear-gradient(rgb(0 0 0 / 0) 60%, rgb(0 0 0 / 0.012) 64%, rgb(0 0 0 / 0.049) 68%, rgb(0 0 0 / 0.109) 72%, rgb(0 0 0 / 0.191) 76%, rgb(0 0 0 / 0.293) 80%, rgb(0 0 0 / 0.412) 84%, rgb(0 0 0 / 0.546) 88%, rgb(0 0 0 / 0.691) 92%, rgb(0 0 0 / 0.844) 96%, #000)';

interface PosterCarouselProps {
  items: HomeExhibitionCard[];
  showRank: boolean;
  /** 탭을 바꿔 새로 그린 목록이면 앞 5칸이 차례로 올라오며 나타난다 */
  animateIn?: boolean;
}

export function PosterCarousel({ items, showRank, animateIn }: PosterCarouselProps) {
  const { ref, activeIndex, highlightIndex, scrollToIndex } = useCenteredScroll<HTMLDivElement>(
    items.length,
  );
  usePosterSlideMotion(ref, items.map(({ displayId }) => displayId).join());
  useSwapIn(ref, animateIn);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    scrollToIndex(activeIndex + (event.key === 'ArrowRight' ? 1 : -1));
  };

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="캐러셀"
      aria-label="전시 포스터"
      tabIndex={0}
      onKeyDown={onKeyDown}
      className={cn(
        RAIL_CLASS,
        'snap-x snap-mandatory focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-inverse',
      )}
    >
      {items.map((item, index) => {
        const isActive = index === activeIndex;
        // 글자 색 · 순위는 한 프레임 뒤에 강조해 탭을 바꿀 때 페이드인 · 아래로 내려오며 나타난다
        const isHighlighted = index === highlightIndex;
        const rank = showRank ? index + 1 : null;
        // 옆 포스터는 상세로 가지 않고 먼저 가운데로 온다
        const openOrCenter = (event: MouseEvent) => {
          if (isActive) return;
          event.preventDefault();
          scrollToIndex(index);
        };

        return (
          <article
            key={item.displayId}
            aria-label={rank ? `순위 ${rank}: ${item.title}` : item.title}
            aria-current={isActive || undefined}
            className="flex w-(--poster-w) flex-none snap-center snap-always flex-col items-center"
          >
            <Link
              to={`/display/${item.displayId}`}
              aria-label={`전시 상세 보기: ${item.title}`}
              tabIndex={isActive ? 0 : -1}
              onClick={openOrCenter}
              data-slide-part="poster"
              className={cn(
                // 옆 칸 모습은 usePosterSlideMotion 이 스크롤에 맞춰 덮어쓴다. 클래스는 첫 화면 · 동작 줄이기용이다.
                // 어둡게 덮는 막이 포스터 밖으로 2px 나가야 하므로 overflow 를 자르지 않는다(아래 막 주석 참고)
                'relative block aspect-402/568 w-full origin-top bg-[#797979] will-change-transform focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-inverse',
                !isActive && '[transform:translateY(calc(var(--poster-w)*14/232))_scale(0.9138)]',
              )}
            >
              {/* 링크는 어둡게 덮는 막 때문에 자르지 않으므로, 고른 부분만 보이게 사진은 따로 자른다 */}
              <span className="absolute inset-0 overflow-hidden">
                <FitImage
                  src={item.posterImageUrl}
                  alt=""
                  displayWidth={320}
                  loading={index < 3 ? 'eager' : 'lazy'}
                  crop={item.posterCrop}
                  fit={item.posterVideoUrl ? 'FILL' : item.posterFit}
                  rule={POSTER_FIT_RULE}
                  fitClassName="bg-secondary"
                  fitColor={item.posterEdgeColor}
                  className="absolute inset-0 size-full object-cover"
                />
              </span>
              {item.posterVideoUrl && (
                <HomePosterVideo src={item.posterVideoUrl} isActive={isActive} />
              )}
              {/*
                  옆 칸을 어둡게 하는 막(프로토타입 .dim · .shade-side). 막은 포스터와 따로 그려지는 레이어라,
                  축소된 포스터 가장자리 픽셀을 반만 덮어 사진 밝기가 1px 테두리처럼 새어 나온다.
                  막을 2px 바깥까지 넓혀 가장자리를 다 덮는다(바깥은 검은 배경이라 보이지 않는다).
                  그라데이션은 2px 안쪽부터 시작해 포스터 위에서는 프로토타입 값과 같다
                */}
              <span
                aria-hidden="true"
                data-slide-part="dim"
                className={cn(
                  'absolute -inset-0.5 bg-[rgb(0_0_0/0.6)] will-change-[opacity]',
                  isActive && 'opacity-0',
                )}
              />
              <span
                aria-hidden="true"
                data-slide-part="side-shade"
                className={cn(
                  'absolute -inset-0.5 bg-[linear-gradient(rgb(0_0_0/0.5)_2px,#000_calc(100%-2px))] will-change-[opacity]',
                  isActive && 'opacity-0',
                )}
              />
              <span
                aria-hidden="true"
                data-slide-part="active-shade"
                className={cn('absolute inset-0 will-change-[opacity]', !isActive && 'opacity-0')}
                style={{ backgroundImage: ACTIVE_SHADE_GRADIENT }}
              />
              {rank && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'typography-title-xl absolute bottom-3 left-4 [text-shadow:0_0_20px_rgb(0_0_0/0.25)] [transition:color_0.2s_ease-out,translate_0.25s_var(--ease-standard)]',
                    isHighlighted ? 'translate-y-1.5 text-quaternary' : 'text-tertiary',
                  )}
                >
                  {rank}
                </span>
              )}
            </Link>
            <div
              data-slide-part="info"
              className={cn(
                'grid w-full gap-2 pt-3.5 text-center will-change-transform',
                !isActive && '[transform:translateY(calc(var(--poster-w)*-14/232))]',
              )}
            >
              <div
                className={cn(
                  'grid gap-0.5 transition-colors duration-fast ease-out',
                  isHighlighted ? 'text-quaternary' : 'text-tertiary',
                )}
              >
                {/* 포스터와 같은 링크라 탭 순서에서는 뺀다 */}
                <Link
                  to={`/display/${item.displayId}`}
                  tabIndex={-1}
                  onClick={openOrCenter}
                  className={cn(
                    'typography-body-xl-semibold block truncate decoration-1 underline-offset-3',
                    isActive && 'hover:underline',
                  )}
                >
                  {item.title}
                </Link>
                <p className="typography-body-md-medium truncate">{item.organization}</p>
              </div>
              <div className="grid gap-0.5 text-tertiary">
                <p className="typography-body-md-regular2 truncate">{item.period}</p>
                {item.place && <p className="typography-body-md-medium truncate">{item.place}</p>}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function PosterCarouselSkeleton() {
  return (
    <div
      aria-hidden="true"
      className={cn(RAIL_CLASS, 'skeleton-inverse justify-center overflow-hidden px-0')}
    >
      <SkeletonList count={3}>
        {(index) => (
          <div
            className={cn(
              'flex w-(--poster-w) flex-none flex-col items-center',
              index !== 1 &&
                'origin-top [transform:translateY(calc(var(--poster-w)*14/232))_scale(0.9138)] opacity-40',
            )}
          >
            <Skeleton className="aspect-402/568 w-full" />
            <div className="grid w-full gap-2 pt-3.5">
              <div className="grid gap-0.5">
                <SkeletonText className="typography-body-xl-semibold mx-auto w-2/3" />
                <SkeletonText className="typography-body-md-medium mx-auto w-1/2" />
              </div>
              <div className="grid gap-0.5">
                <SkeletonText className="typography-body-md-regular2 mx-auto w-3/5" />
                <SkeletonText className="typography-body-md-medium mx-auto w-2/5" />
              </div>
            </div>
          </div>
        )}
      </SkeletonList>
    </div>
  );
}
