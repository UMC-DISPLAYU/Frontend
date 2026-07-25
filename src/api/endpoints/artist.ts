import type { CreateArtistProfileRequestDto, CreateArtistProfileResponseDataDto } from '@/api/dto';

import { apiRequest } from '../client';

// POST /v1/artists/me/artist-profile
export const createMyArtistProfile = async (
  body: CreateArtistProfileRequestDto,
): Promise<CreateArtistProfileResponseDataDto> =>
  apiRequest('/v1/artists/me/artist-profile', { method: 'POST', body });
