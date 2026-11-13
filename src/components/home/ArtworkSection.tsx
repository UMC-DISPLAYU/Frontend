import { Link } from 'react-router-dom';

import type { ArtworkPreviewItemDto } from '@/api/dto';
import ChevronMoreIcon from '@/assets/home/ChevronMoreIcon.svg';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { Skeleton, SkeletonList } from '@/components/ui';
import { cn } from '@/utils/cn';
import { staggerStyle } from '@/utils/stagger';

import { ArtistByline } from './ArtistByline';
import { HOME_INNER } from './homeLayout';

// 폰에서는 2장 + 3번째가 조금 보이게(프로토타입 11-08): 폭 = (화면 폭 − 76px) / 2, 최대 175px
const CARD_CLASS =
  'w-[min(175px,calc((100vw-76px)/2))] flex-none snap-start tablet:w-50 min-[68.75rem]:w-55';

const IMAGE_FRAME_CLASS = 'aspect-161/215 w-full bg-secondary';

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
          className="typography-body-md-medium -my-3 flex min-h-11 items-center rounded-4 pl-1 text-tertiary transition-colors duration-fast ease-standard hover:text-primary focus-visible:outline-2 focus-visible:outline-focus"
        >
          더보기
          <span className="grid size-4 place-items-center">
            <img src={ChevronMoreIcon} alt="" />
          </span>
        </Link>
      </div>
      <p className="typography-body-md-medium mt-0.5 text-tertiary">전시 속 작품을 만나보세요</p>

      <ul className="-mr-(--home-pad) mt-4 flex snap-x snap-proximity gap-3 overflow-x-auto pr-(--home-pad) [scrollbar-width:none] tablet:mr-0 tablet:gap-4 tablet:pr-0 min-[68.75rem]:gap-6 [&::-webkit-scrollbar]:hidden">
        {isPending ? (
          <SkeletonList count={4}>
            {() => (
              <li aria-hidden="true" className={CARD_CLASS}>
                <Skeleton className={IMAGE_FRAME_CLASS} />
                <Skeleton className="mt-2 h-5 w-2/3 rounded-4" />
                <Skeleton className="mt-0.5 h-4 w-1/3 rounded-4" />
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
                className="group block text-primary transition-transform duration-base ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-98"
              >
                <OptimizedImage
                  src={artwork.artworkImageUrl}
                  alt={`${artwork.artworkName} 작품`}
                  displayWidth={220}
                  skeleton
                  frameClassName={IMAGE_FRAME_CLASS}
                  className="transition-transform duration-slow ease-standard group-hover:scale-103"
                />
                <span className="block pt-2">
                  <span className="typography-body-lg-semibold block truncate">
                    {artwork.artworkName}
                  </span>
                  <ArtistByline
                    names={
                      artwork.artists?.length
                        ? artwork.artists.map(({ name }) => name)
                        : [artwork.artistName]
                    }
                    className="typography-body-md-medium text-secondary"
                  />
                </span>
              </Link>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
