import { Link } from 'react-router-dom';

import type { ArtworkSearchItemDto } from '@/api/dto';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { Skeleton } from '@/components/ui';

import { CARD_CLASS, CARD_IMAGE_CLASS, CARD_TITLE_CLASS } from './exploreCardStyles';

const ARTWORK_FRAME_CLASS = 'aspect-161/215 w-full bg-[#f4f4f5]';

type ExploreArtworkCardProps = {
  artwork: ArtworkSearchItemDto;
};

export function ExploreArtworkCard({ artwork }: ExploreArtworkCardProps) {
  const artistNames = artwork.artists.map((artist) => artist.name);

  return (
    <Link className={CARD_CLASS} to={`/artwork/${artwork.artworkId}`}>
      <OptimizedImage
        alt={artwork.artworkName}
        className={CARD_IMAGE_CLASS}
        displayWidth={280}
        frameClassName={ARTWORK_FRAME_CLASS}
        skeleton
        src={artwork.artworkImageUrl}
      />
      <span className="block pt-2">
        <span className={CARD_TITLE_CLASS}>{artwork.artworkName}</span>
        <span className="block truncate text-[12px] leading-[1.4] font-medium tracking-[-0.03em] text-[#3f3f47]">
          {artistNames.join(', ')}
        </span>
      </span>
    </Link>
  );
}

export function ExploreArtworkCardSkeleton() {
  return (
    <>
      <Skeleton className={ARTWORK_FRAME_CLASS} />
      <Skeleton className="mt-2 h-5 w-3/4 rounded-4" />
      <Skeleton className="mt-0.5 h-4 w-1/2 rounded-4" />
    </>
  );
}
