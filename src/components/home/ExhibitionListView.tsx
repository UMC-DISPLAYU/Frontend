import { Link } from 'react-router-dom';

import { OptimizedImage } from '@/components/common/OptimizedImage';
import type { HomeExhibitionCard } from '@/hooks/queries/useHome';
import { cn } from '@/utils/cn';

import { useCenteredScroll } from './useCenteredScroll';
import { useSwapIn } from './useSwapIn';

const COLUMN_SIZE = 3;

interface ExhibitionListViewProps {
  items: HomeExhibitionCard[];
  showRank: boolean;
  animateIn?: boolean;
}

/** 리스트형: 전시를 3개씩 세로로 묶은 열을 옆으로 넘긴다. 가운데 열만 선명하다 */
export function ExhibitionListView({ items, showRank, animateIn }: ExhibitionListViewProps) {
  const columns: HomeExhibitionCard[][] = [];
  for (let i = 0; i < items.length; i += COLUMN_SIZE) {
    columns.push(items.slice(i, i + COLUMN_SIZE));
  }
  const { ref, activeIndex, highlightIndex, scrollToIndex } = useCenteredScroll<HTMLDivElement>(
    columns.length,
  );
  useSwapIn(ref, animateIn);

  return (
    <div
      ref={ref}
      role="group"
      aria-label="전시 리스트"
      className="relative flex snap-x snap-mandatory items-start gap-3 overflow-x-auto overscroll-x-contain px-[calc(50%-var(--list-w)/2)] pt-4 [--list-w:min(340px,calc(100vw-var(--home-pad)*2))] [scrollbar-width:none] tablet:[--list-w:360px] [&::-webkit-scrollbar]:hidden"
    >
      {columns.map((column, columnIndex) => {
        const isActive = columnIndex === activeIndex;

        return (
          <div
            key={column[0].displayId}
            className={cn(
              'grid w-(--list-w) flex-none snap-center gap-3 transition-opacity duration-slow ease-standard',
              columnIndex !== highlightIndex && 'opacity-40',
            )}
          >
            {column.map((item, rowIndex) => {
              const rank = showRank ? columnIndex * COLUMN_SIZE + rowIndex + 1 : null;

              return (
                <Link
                  key={item.displayId}
                  to={`/display/${item.displayId}`}
                  aria-label={rank ? `순위 ${rank}: ${item.title}` : item.title}
                  tabIndex={isActive ? 0 : -1}
                  // 흐린 열은 상세로 가지 않고 먼저 가운데로 온다
                  onClick={(event) => {
                    if (isActive) return;
                    event.preventDefault();
                    scrollToIndex(columnIndex);
                  }}
                  className="relative grid h-31 grid-cols-[86px_minmax(0,1fr)] overflow-hidden border border-icon-secondary bg-interactive-primary text-quaternary shadow-card transition duration-fast ease-standard hover:border-secondary focus-visible:outline-2 focus-visible:outline-focus-inverse active:scale-99"
                >
                  <span className="relative bg-[#797979]">
                    <OptimizedImage
                      src={item.posterImageUrl}
                      alt=""
                      displayWidth={86}
                      className="absolute inset-0 size-full object-cover"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-primary-black [mask-image:linear-gradient(transparent_45%,rgb(0_0_0/0.75))]"
                    />
                    {rank && (
                      <span
                        aria-hidden="true"
                        className="typography-title-xl absolute -bottom-0.5 left-2.5 text-interactive-inverse"
                      >
                        {rank}
                      </span>
                    )}
                  </span>
                  <div className="flex min-w-0 flex-col justify-between p-3">
                    <div className="grid gap-0.5">
                      <span className="typography-body-xl-semibold truncate">{item.title}</span>
                      <span className="typography-body-md-medium truncate">
                        {item.organization}
                      </span>
                    </div>
                    <div className="grid gap-0.5 text-tertiary">
                      <p className="typography-body-md-regular2 truncate">{item.period}</p>
                      {item.place && (
                        <p className="typography-body-md-medium truncate">{item.place}</p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
