import { Link } from 'react-router-dom';

import type { ArtworkSearchItemDto } from '@/api/dto';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { Skeleton, SkeletonText } from '@/components/ui';

import {
  ARTWORK_HOVER_GRADIENT,
  CARD_CLASS,
  CARD_HOVER_CLASS,
  CARD_HOVER_TITLE_CLASS,
  CARD_IMAGE_CLASS,
  CARD_PHOTO_WRAP_CLASS,
  CARD_SKELETON_TEXT_CLASS,
  CARD_TEXT_CLASS,
  CARD_TITLE_CLASS,
} from './exploreCardStyles';
import { usePhotoPending } from './usePhotoPending';

const ARTWORK_FRAME_CLASS = 'aspect-161/215 w-full bg-[#f4f4f5]';

type ExploreArtworkCardProps = {
  artwork: ArtworkSearchItemDto;
};

export function ExploreArtworkCard({ artwork }: ExploreArtworkCardProps) {
  const artistNames = artwork.artists?.length
    ? artwork.artists.map((artist) => artist.name).join(', ')
    : artwork.artistName;
  const { photoPending, onPhotoSettle } = usePhotoPending(artwork.artworkImageUrl);

  return (
    <Link
      className={CARD_CLASS}
      data-photo-pending={photoPending || undefined}
      to={`/artwork/${artwork.artworkId}`}
    >
      <span className={CARD_PHOTO_WRAP_CLASS}>
        <OptimizedImage
          alt={artwork.artworkName}
          className={CARD_IMAGE_CLASS}
          displayWidth={280}
          frameClassName={ARTWORK_FRAME_CLASS}
          onError={onPhotoSettle}
          onLoad={onPhotoSettle}
          skeleton
          src={artwork.artworkImageUrl}
        />
        <span
          aria-hidden="true"
          className={CARD_HOVER_CLASS}
          style={{ backgroundImage: ARTWORK_HOVER_GRADIENT }}
        >
          <span className={CARD_HOVER_TITLE_CLASS}>{artwork.artworkName}</span>
          <span className="block truncate text-[12px] leading-[1.4] font-medium">
            {artistNames}
          </span>
        </span>
      </span>
      <span className={CARD_TEXT_CLASS} data-card-text>
        <span className={CARD_TITLE_CLASS}>{artwork.artworkName}</span>
        <span className="block truncate text-[12px] leading-[1.4] font-medium tracking-[-0.03em] text-[#3f3f47]">
          {artistNames}
        </span>
      </span>
    </Link>
  );
}

export function ExploreArtworkCardSkeleton() {
  return (
    <>
      <Skeleton className={ARTWORK_FRAME_CLASS} />
      <div className={CARD_SKELETON_TEXT_CLASS}>
        <SkeletonText className="typography-body-lg-semibold w-7/10" />
        <SkeletonText className="typography-body-md-medium w-1/2" />
      </div>
    </>
  );
}
