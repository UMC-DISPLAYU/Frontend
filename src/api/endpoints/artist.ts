import type { ArtistProfileDto, CreateArtistProfileRequestDto } from '@/api/dto';

import { apiRequest } from '../client';

// POST /v1/artists/me/artist-profile
export const createMyArtistProfile = async (
  body: CreateArtistProfileRequestDto,
): Promise<ArtistProfileDto> =>
  apiRequest('/v1/artists/me/artist-profile', { method: 'POST', body });
