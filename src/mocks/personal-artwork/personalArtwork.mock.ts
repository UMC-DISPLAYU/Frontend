import type { PersonalArtworkSummaryDto } from '@/api/dto';
import { MOCK_ARTWORK_FIXTURES } from '@/mocks/data';

export const mockPersonalArtworkSummaries: PersonalArtworkSummaryDto[] = MOCK_ARTWORK_FIXTURES.slice(
  31,
  35,
).map((artwork) => ({
  personalArtworkId: artwork.artworkId,
  artworkName: artwork.title,
  thumbnailUrl: artwork.images[0].imageUrl,
  type: artwork.type,
  createdAt: `${artwork.productionYear}-07-01T10:00:00`,
}));

