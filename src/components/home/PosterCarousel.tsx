import type { KeyboardEvent, MouseEvent } from 'react';
import { Link } from 'react-router-dom';

import ChevronArrowIcon from '@/assets/home/ChevronArrowIcon.svg';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { CardMetaList, Skeleton, SkeletonList } from '@/components/ui';
import type { HomeExhibitionCard } from '@/hooks/queries/useHome';
import { cn } from '@/utils/cn';

import { useCenteredScroll } from './useCenteredScroll';

// 포스터 폭(--poster-w)은 ExhibitionShowcase 가 브레이크포인트별로 정한다
const RAIL_CLASS =
  'relative flex items-start gap-3 overflow-x-auto overscroll-x-contain px-[calc(50%-var(--poster-w)/2)] pt-4 [scrollbar-width:none] tablet:gap-4 min-[68.75rem]:gap-6 [&::-webkit-scrollbar]:hidden';

const ARROW_CLASS =
  'absolute top-47.5 z-10 hidden size-11 place-items-center rounded-circle border border-icon-secondary bg-primary-black text-quaternary transition duration-fast ease-standard hover:bg-interactive-primary focus-visible:outline-2 focus-visible:outline-focus-inverse active:scale-96 disabled:invisible min-[68.75rem]:grid';

interface PosterCarouselProps {
  items: HomeExhibitionCard[];
  showRank: boolean;
}

export function PosterCarousel({ items, showRank }: PosterCarouselProps) {
  const { ref, activeIndex, scrollToIndex } = useCenteredScroll<HTMLDivElement>(items.length);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    scrollToIndex(activeIndex + (event.key === 'ArrowRight' ? 1 : -1));
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="이전 전시"
        disabled={activeIndex === 0}
        onClick={() => scrollToIndex(activeIndex - 1)}
        className={cn(ARROW_CLASS, 'left-(--home-pad)')}
      >
        <img src={ChevronArrowIcon} alt="" className="-scale-x-100" />
      </button>
      <button
        type="button"
        aria-label="다음 전시"
        disabled={activeIndex === items.length - 1}
        onClick={() => scrollToIndex(activeIndex + 1)}
        className={cn(ARROW_CLASS, 'right-(--home-pad)')}
      >
        <img src={ChevronArrowIcon} alt="" />
      </button>

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
                className={cn(
                  'relative block aspect-232/329 w-full origin-top overflow-hidden rounded-12 bg-primary-400 transition-transform duration-base ease-standard focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-inverse',
                  !isActive && 'translate-y-3.5 scale-91',
                )}
              >
                <OptimizedImage
                  src={item.posterImageUrl}
                  alt=""
                  displayWidth={320}
                  skeleton
                  loading={index < 3 ? 'eager' : 'lazy'}
                  frameClassName="absolute inset-0"
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-0 bg-primary-black transition-opacity duration-base ease-standard [mask-image:linear-gradient(rgb(0_0_0/0.8),#000)]',
                    isActive && 'opacity-0',
                  )}
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-0 bg-primary-black transition-opacity duration-base ease-standard [mask-image:linear-gradient(transparent_56.5%,#000)]',
                    !isActive && 'opacity-0',
                  )}
                />
                {rank && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      'typography-title-xl absolute bottom-3 left-4 transition duration-fast ease-standard',
                      isActive ? 'translate-y-1.5 text-quaternary' : 'text-tertiary',
                    )}
                  >
                    {rank}
                  </span>
                )}
              </Link>
              <div
                className={cn(
                  'grid w-full gap-2 pt-3.5 text-center transition-transform duration-base ease-standard',
                  !isActive && '-translate-y-3.5',
                )}
              >
                <div
                  className={cn(
                    'grid gap-0.5 transition-colors duration-fast ease-out',
                    isActive ? 'text-quaternary' : 'text-tertiary',
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
                <CardMetaList period={item.period} location={item.place} className="items-center" />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function PosterCarouselSkeleton() {
  return (
    <div aria-hidden="true" className={cn(RAIL_CLASS, 'justify-center overflow-hidden px-0')}>
      <SkeletonList count={3}>
        {(index) => (
          <div
            className={cn(
              'flex w-(--poster-w) flex-none flex-col items-center gap-2',
              index !== 1 && 'translate-y-3.5 scale-91 opacity-40',
            )}
          >
            <Skeleton className="aspect-232/329 w-full rounded-12" />
            <Skeleton className="mt-1.5 h-5 w-2/3 rounded-4" />
            <Skeleton className="h-4 w-1/2 rounded-4" />
          </div>
        )}
      </SkeletonList>
    </div>
  );
}
