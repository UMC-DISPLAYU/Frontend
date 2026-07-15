import type {
  ArchivedArtistStatusDto,
  ArchivedArtworkStatusDto,
  ArchivedExhibitionStatusDto,
  GetArchiveCalendarDayRequestDto,
  GetArchiveCalendarDayResponseDataDto,
  GetArchiveCalendarRequestDto,
  GetArchiveCalendarResponseDataDto,
  GetArchivedArtistsResponseDataDto,
  GetArchivedArtworksResponseDataDto,
  GetArchivedExhibitionsResponseDataDto,
} from '@/api/dto';

import { apiRequest } from '../client';

// GET /v1/archive/calendar
export const getArchiveCalendar = async (
  params: GetArchiveCalendarRequestDto,
): Promise<GetArchiveCalendarResponseDataDto> =>
  apiRequest('/v1/archive/calendar', { query: params });

// GET /v1/archive/calendar/day
export const getArchiveCalendarDay = async (
  params: GetArchiveCalendarDayRequestDto,
): Promise<GetArchiveCalendarDayResponseDataDto> =>
  apiRequest('/v1/archive/calendar/day', { query: params });

// POST /v1/archive/exhibitions/:exhibitionId
export const archiveExhibition = async (
  exhibitionId: number,
): Promise<ArchivedExhibitionStatusDto> =>
  apiRequest(`/v1/archive/exhibitions/${exhibitionId}`, { method: 'POST' });

// DELETE /v1/archive/exhibitions/:exhibitionId
export const unarchiveExhibition = async (
  exhibitionId: number,
): Promise<ArchivedExhibitionStatusDto> =>
  apiRequest(`/v1/archive/exhibitions/${exhibitionId}`, { method: 'DELETE' });

// GET /v1/archive/exhibitions
export const getArchivedExhibitions = async (): Promise<GetArchivedExhibitionsResponseDataDto> =>
  apiRequest('/v1/archive/exhibitions');

// POST /v1/archive/artworks/:artworkId
export const archiveArtwork = async (artworkId: number): Promise<ArchivedArtworkStatusDto> =>
  apiRequest(`/v1/archive/artworks/${artworkId}`, { method: 'POST' });

// DELETE /v1/archive/artworks/:artworkId
export const unarchiveArtwork = async (artworkId: number): Promise<ArchivedArtworkStatusDto> =>
  apiRequest(`/v1/archive/artworks/${artworkId}`, { method: 'DELETE' });

// GET /v1/archive/artworks
export const getArchivedArtworks = async (): Promise<GetArchivedArtworksResponseDataDto> =>
  apiRequest('/v1/archive/artworks');

// POST /v1/archive/artists/:artistId
export const archiveArtist = async (artistId: number): Promise<ArchivedArtistStatusDto> =>
  apiRequest(`/v1/archive/artists/${artistId}`, { method: 'POST' });

// DELETE /v1/archive/artists/:artistId
export const unarchiveArtist = async (artistId: number): Promise<ArchivedArtistStatusDto> =>
  apiRequest(`/v1/archive/artists/${artistId}`, { method: 'DELETE' });

// GET /v1/archive/artists
export const getArchivedArtists = async (): Promise<GetArchivedArtistsResponseDataDto> =>
  apiRequest('/v1/archive/artists');
