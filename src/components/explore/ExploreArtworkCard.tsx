import { Link } from 'react-router-dom';

import type { ArtworkSearchItemDto } from '@/api/dto';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { Skeleton, SkeletonText } from '@/components/ui';

import { ArtistByline } from './ArtistByline';
import { CARD_CLASS, CARD_IMAGE_CLASS, CARD_TITLE_CLASS } from './exploreCardStyles';

const ARTWORK_FRAME_CLASS = 'aspect-161/215 w-full bg-[#f4f4f5]';

type ExploreArtworkCardProps = {
  artwork: ArtworkSearchItemDto;
};

export function ExploreArtworkCard({ artwork }: ExploreArtworkCardProps) {
  const artistNames = artwork.artists?.length
    ? artwork.artists.map((artist) => artist.name)
    : [artwork.artistName];

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
        <ArtistByline
          className="text-[12px] leading-[1.4] font-medium tracking-[-0.03em] text-[#3f3f47]"
          names={artistNames}
        />
      </span>
    </Link>
  );
}

export function ExploreArtworkCardSkeleton() {
  return (
    <>
      <Skeleton className={ARTWORK_FRAME_CLASS} />
      <div className="pt-2">
        <SkeletonText className="typography-body-lg-semibold w-7/10" />
        <SkeletonText className="typography-body-md-medium w-1/2" />
      </div>
    </>
  );
}
