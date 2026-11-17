import { Link } from 'react-router-dom';

import type { ArtworkSearchItemDto } from '@/api/dto';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { Skeleton, SkeletonText } from '@/components/ui';
import { cn } from '@/utils/cn';
import {
  croppedDisplayWidth,
  FIT_THUMBNAIL_IMAGE_CLASS,
  resolveSavedThumbnail,
  savedCropImageStyle,
} from '@/utils/cropBox';

import { ArtistByline } from './ArtistByline';
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
    ? artwork.artists.map((artist) => artist.name)
    : [artwork.artistName];
  const { photoPending, onPhotoSettle } = usePhotoPending(artwork.artworkImageUrl);
  const thumbnail = resolveSavedThumbnail(artwork.artworkCrop, artwork.artworkFitMode);

  return (
    <Link
      className={CARD_CLASS}
      data-photo-pending={photoPending || undefined}
      to={`/artwork/${artwork.artworkId}`}
    >
      <span className={CARD_PHOTO_WRAP_CLASS}>
        <OptimizedImage
          alt={artwork.artworkName}
          className={cn(CARD_IMAGE_CLASS, thumbnail.isFit && FIT_THUMBNAIL_IMAGE_CLASS)}
          displayWidth={croppedDisplayWidth(280, thumbnail.crop)}
          frameClassName={ARTWORK_FRAME_CLASS}
          onError={onPhotoSettle}
          onLoad={onPhotoSettle}
          skeleton
          src={artwork.artworkImageUrl}
          style={savedCropImageStyle(thumbnail.crop)}
        />
        <span
          aria-hidden="true"
          className={CARD_HOVER_CLASS}
          style={{ backgroundImage: ARTWORK_HOVER_GRADIENT }}
        >
          <span className={CARD_HOVER_TITLE_CLASS}>{artwork.artworkName}</span>
          <ArtistByline className="text-[12px] leading-[1.4] font-medium" names={artistNames} />
        </span>
      </span>
      <span className={CARD_TEXT_CLASS} data-card-text>
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
      <div className={CARD_SKELETON_TEXT_CLASS}>
        <SkeletonText className="typography-body-lg-semibold w-7/10" />
        <SkeletonText className="typography-body-md-medium w-1/2" />
      </div>
    </>
  );
}
