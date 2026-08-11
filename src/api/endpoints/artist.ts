import type {
  ArtistProfileDto,
  CreateArtistProfileRequestDto,
  UpdateArtistProfileRequestDto,
  UpdateArtistProfileResponseDataDto,
} from '@/api/dto';

import { apiRequest } from '../client';

// POST /v1/artists/me/artist-profile
export const createMyArtistProfile = async (
  body: CreateArtistProfileRequestDto,
): Promise<ArtistProfileDto> =>
  apiRequest('/v1/artists/me/artist-profile', { method: 'POST', body });

// GET /v1/artists/me/artist-profile
export const getMyArtistProfile = async (): Promise<ArtistProfileDto> =>
  apiRequest('/v1/artists/me/artist-profile');

// PATCH /v1/artists/me/artist-profile
export const updateMyArtistProfile = async (
  body: UpdateArtistProfileRequestDto,
): Promise<UpdateArtistProfileResponseDataDto> =>
  apiRequest('/v1/artists/me/artist-profile', { method: 'PATCH', body });

// GET /v1/artists/:userId/artist-profile
export const getUserArtistProfile = async (
  userId: number,
): Promise<Omit<ArtistProfileDto, 'status'>> =>
  apiRequest(`/v1/artists/${userId}/artist-profile`);
