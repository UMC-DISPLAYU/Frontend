import type { PersonalArtworkResponseDataDto } from '@/api/dto';

import { getProcessImages } from './artworkDetail.utils';
import { ArtworkIntroTab } from './ArtworkIntroTab';

type Props = {
  artwork: PersonalArtworkResponseDataDto;
};

export function PersonalArtworkIntroTab({ artwork }: Props) {
  return (
    <ArtworkIntroTab
      content={artwork.content}
      processImageUrls={getProcessImages(artwork.images).map((image) => image.imageUrl)}
    />
  );
}
