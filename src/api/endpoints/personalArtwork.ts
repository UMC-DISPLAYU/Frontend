import type {
  GetPersonalArtworksResponseDataDto,
  PersonalArtworkRequestDto,
  PersonalArtworkResponseDataDto,
} from '@/api/dto';

import { apiRequest } from '../client';

// GET /v1/personal-artworks
export const getPersonalArtworks = async (): Promise<GetPersonalArtworksResponseDataDto> =>
  apiRequest('/v1/personal-artworks');

// POST /v1/personal-artworks
export const createPersonalArtwork = async (
  body: PersonalArtworkRequestDto,
): Promise<PersonalArtworkResponseDataDto> =>
  apiRequest('/v1/personal-artworks', { method: 'POST', body });

// GET /v1/personal-artworks/:personalArtworkId
export const getPersonalArtwork = async (
  personalArtworkId: number,
): Promise<PersonalArtworkResponseDataDto> =>
  apiRequest(`/v1/personal-artworks/${personalArtworkId}`);

// PATCH /v1/personal-artworks/:personalArtworkId
export const updatePersonalArtwork = async (
  personalArtworkId: number,
  body: Partial<PersonalArtworkRequestDto>,
): Promise<PersonalArtworkResponseDataDto> =>
  apiRequest(`/v1/personal-artworks/${personalArtworkId}`, { method: 'PATCH', body });

// DELETE /v1/personal-artworks/:personalArtworkId
export const deletePersonalArtwork = async (personalArtworkId: number): Promise<null> =>
  apiRequest(`/v1/personal-artworks/${personalArtworkId}`, { method: 'DELETE' });
