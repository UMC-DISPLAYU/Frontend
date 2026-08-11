import type {
  ArchivedArtistStatusDto,
  ArchivedArtworkStatusDto,
  ArchivedExhibitionStatusDto,
  ArchiveMemoRequestDto,
  GetArchivedArtistResponseDto,
  GetArchivedArtistsResponseDataDto,
  GetArchivedArtworkResponseDto,
  GetArchivedArtworksResponseDataDto,
  GetArchivedExhibitionResponseDto,
  GetArchivedExhibitionsResponseDataDto,
  UpdateArchivedArtworkMemoResponseDto,
  UpdateArchivedExhibitionMemoResponseDto,
} from '@/api/dto';

import { apiRequest } from '../client';

// POST /v1/archives/exhibitions/:exhibitionId
export const archiveExhibition = async (
  exhibitionId: number,
): Promise<ArchivedExhibitionStatusDto> =>
  apiRequest(`/v1/archives/exhibitions/${exhibitionId}`, { method: 'POST' });

// DELETE /v1/archives/exhibitions/:exhibitionId
export const unarchiveExhibition = async (
  exhibitionId: number,
): Promise<ArchivedExhibitionStatusDto> =>
  apiRequest(`/v1/archives/exhibitions/${exhibitionId}`, { method: 'DELETE' });

// GET /v1/archives/exhibitions
export const getArchivedExhibitions = async (): Promise<GetArchivedExhibitionsResponseDataDto> =>
  apiRequest('/v1/archives/exhibitions');

// POST /v1/archives/artworks/:artworkId
export const archiveArtwork = async (artworkId: number): Promise<ArchivedArtworkStatusDto> =>
  apiRequest(`/v1/archives/artworks/${artworkId}`, { method: 'POST' });

// DELETE /v1/archives/artworks/:artworkId
export const unarchiveArtwork = async (artworkId: number): Promise<ArchivedArtworkStatusDto> =>
  apiRequest(`/v1/archives/artworks/${artworkId}`, { method: 'DELETE' });

// GET /v1/archives/artworks
export const getArchivedArtworks = async (): Promise<GetArchivedArtworksResponseDataDto> =>
  apiRequest('/v1/archives/artworks');

// POST /v1/archives/artists/:artistId
export const archiveArtist = async (artistId: number): Promise<ArchivedArtistStatusDto> =>
  apiRequest(`/v1/archives/artists/${artistId}`, { method: 'POST' });

// DELETE /v1/archives/artists/:artistId
export const unarchiveArtist = async (artistId: number): Promise<ArchivedArtistStatusDto> =>
  apiRequest(`/v1/archives/artists/${artistId}`, { method: 'DELETE' });

// GET /v1/archives/artists
export const getArchivedArtists = async (
  params: { cursorId?: number } = {},
): Promise<GetArchivedArtistsResponseDataDto> =>
  apiRequest('/v1/archives/artists', { query: params });

// GET /v1/archives/exhibitions/:savedExhibitionId
export const getArchivedExhibition = async (
  savedExhibitionId: number,
): Promise<NonNullable<GetArchivedExhibitionResponseDto['success']>['data']> =>
  apiRequest(`/v1/archives/exhibitions/${savedExhibitionId}`);

// PUT /v1/archives/exhibitions/:archiveDisplayId/memo
export const updateArchivedExhibitionMemo = async (
  archiveDisplayId: number,
  body: ArchiveMemoRequestDto,
): Promise<NonNullable<UpdateArchivedExhibitionMemoResponseDto['success']>['data']> =>
  apiRequest(`/v1/archives/exhibitions/${archiveDisplayId}/memo`, { method: 'PUT', body });

// DELETE /v1/archives/exhibitions/:archiveDisplayId/memo
export const deleteArchivedExhibitionMemo = async (archiveDisplayId: number): Promise<null> =>
  apiRequest(`/v1/archives/exhibitions/${archiveDisplayId}/memo`, { method: 'DELETE' });

// GET /v1/archives/artworks/:savedArtworkId
export const getArchivedArtwork = async (
  savedArtworkId: number,
): Promise<NonNullable<GetArchivedArtworkResponseDto['success']>['data']> =>
  apiRequest(`/v1/archives/artworks/${savedArtworkId}`);

// PUT /v1/archives/artworks/:archiveWorkId/memo
export const updateArchivedArtworkMemo = async (
  archiveWorkId: number,
  body: ArchiveMemoRequestDto,
): Promise<NonNullable<UpdateArchivedArtworkMemoResponseDto['success']>['data']> =>
  apiRequest(`/v1/archives/artworks/${archiveWorkId}/memo`, { method: 'PUT', body });

// DELETE /v1/archives/artworks/:archiveWorkId/memo
export const deleteArchivedArtworkMemo = async (archiveWorkId: number): Promise<null> =>
  apiRequest(`/v1/archives/artworks/${archiveWorkId}/memo`, { method: 'DELETE' });

// GET /v1/archives/artists/:savedArtistId
export const getArchivedArtist = async (
  savedArtistId: number,
): Promise<NonNullable<GetArchivedArtistResponseDto['success']>['data']> =>
  apiRequest(`/v1/archives/artists/${savedArtistId}`);
