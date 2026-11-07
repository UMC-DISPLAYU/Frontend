import { Link } from 'react-router-dom';

import type { ArtworkPreviewItemDto } from '@/api/dto';
import ChevronMoreIcon from '@/assets/home/ChevronMoreIcon.svg';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { Skeleton, SkeletonList } from '@/components/ui';
import { cn } from '@/utils/cn';
import { staggerStyle } from '@/utils/stagger';

import { HOME_INNER } from './homeLayout';

const CARD_CLASS = 'w-43.75 flex-none snap-start rounded-12 tablet:w-50 min-[68.75rem]:w-55';

interface ArtworkSectionProps {
  artworks: ArtworkPreviewItemDto[] | undefined;
  isPending: boolean;
}

export function ArtworkSection({ artworks, isPending }: ArtworkSectionProps) {
  // 불러오지 못했거나 작품이 없으면 섹션째 숨긴다(홈의 보조 영역이라 빈 안내를 두지 않는다)
  if (!isPending && !artworks?.length) return null;

  return (
    <section aria-labelledby="home-artworks-title" className={cn(HOME_INNER, 'py-5')}>
      <div className="flex items-center justify-between">
        <h2 id="home-artworks-title" className="typography-body-xxl-semibold text-primary">
          ARTWORKS
        </h2>
        <Link
          to="/search?view=artwork"
          className="typography-body-md-medium -my-3 -mr-1 flex min-h-11 items-center rounded-4 pl-1 text-tertiary transition-colors duration-fast ease-standard hover:text-primary focus-visible:outline-2 focus-visible:outline-focus"
        >
          더보기
          <span className="grid size-4 place-items-center">
            <img src={ChevronMoreIcon} alt="" className="-rotate-90" />
          </span>
        </Link>
      </div>
      <p className="typography-body-md-medium mt-0.5 text-tertiary">전시 속 작품을 만나보세요</p>

      <ul className="-mr-(--home-pad) mt-4 flex snap-x snap-proximity gap-3 overflow-x-auto pr-(--home-pad) [scrollbar-width:none] tablet:mr-0 tablet:gap-4 tablet:pr-0 min-[68.75rem]:gap-6 [&::-webkit-scrollbar]:hidden">
        {isPending ? (
          <SkeletonList count={4}>
            {() => (
              <li aria-hidden="true" className={cn(CARD_CLASS, 'bg-primary-black p-1.75 pb-2.5')}>
                <Skeleton className="aspect-161/215 w-full rounded-12" />
                <Skeleton className="mt-2 h-4 w-2/3 rounded-4" />
              </li>
            )}
          </SkeletonList>
        ) : (
          artworks?.map((artwork, index) => (
            <li
              key={artwork.artworkId}
              className={cn(CARD_CLASS, 'animate-rise')}
              style={staggerStyle(index)}
            >
              <Link
                to={`/artwork/${artwork.artworkId}`}
                className="group block overflow-hidden rounded-12 bg-primary-black text-quaternary transition-transform duration-base ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-98"
              >
                <span className="block p-1.75">
                  <OptimizedImage
                    src={artwork.artworkImageUrl}
                    alt={`${artwork.artworkName} 작품`}
                    displayWidth={220}
                    skeleton
                    frameClassName="aspect-161/215 w-full rounded-12"
                    className="transition-transform duration-slow ease-standard group-hover:scale-103"
                  />
                </span>
                <span className="block px-3 pb-2.5">
                  <span className="typography-body-lg-semibold block truncate">
                    {artwork.artworkName}
                  </span>
                  <span className="typography-body-md-medium block truncate">
                    {artwork.artistName}
                  </span>
                </span>
              </Link>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
