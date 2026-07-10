import type { ApiResponseDto } from './common.dto';

export interface GetArchiveCalendarRequestDto {
  year: number;
  month: number;
}

export interface ArchivedCalendarExhibitionDto {
  displayId: number;
  title: string;
  startDate: string;
  endDate: string;
  posterImageUrl: string;
}

export interface GetArchiveCalendarResponseDataDto {
  year: number;
  month: number;
  savedExhibitions: ArchivedCalendarExhibitionDto[];
}

export type GetArchiveCalendarResponseDto = ApiResponseDto<GetArchiveCalendarResponseDataDto>;

export interface GetArchiveCalendarDayRequestDto {
  date: string;
}

export interface ArchivedCalendarDayExhibitionDto {
  displayId: number;
  title: string;
  posterImageUrl: string;
  location: string;
  runtime: string;
  userMemo: string | null;
}

export interface GetArchiveCalendarDayResponseDataDto {
  requestedDate: string;
  exhibitions: ArchivedCalendarDayExhibitionDto[];
}

export type GetArchiveCalendarDayResponseDto = ApiResponseDto<GetArchiveCalendarDayResponseDataDto>;

export interface ArchivedExhibitionStatusDto {
  exhibitionId: number;
  isArchived: boolean;
}

export type ArchiveExhibitionResponseDto = ApiResponseDto<ArchivedExhibitionStatusDto>;

export type UnarchiveExhibitionResponseDto = ApiResponseDto<ArchivedExhibitionStatusDto>;

export interface ArchivedExhibitionDto {
  savedExhibitionId: number;
  displayId: number;
  title: string;
  thumbnailUrl: string;
  organization: string;
  placeName: string;
  startDate: string;
  endDate: string;
  displayType: string;
  status: string;
  memo: string | null;
  savedAt: string;
}

export interface GetArchivedExhibitionsResponseDataDto {
  savedExhibitions: ArchivedExhibitionDto[];
}

export type GetArchivedExhibitionsResponseDto =
  ApiResponseDto<GetArchivedExhibitionsResponseDataDto>;

export interface ArchivedArtworkStatusDto {
  artworkId: number;
  isArchived: boolean;
}

export type ArchiveArtworkResponseDto = ApiResponseDto<ArchivedArtworkStatusDto>;

export type UnarchiveArtworkResponseDto = ApiResponseDto<ArchivedArtworkStatusDto>;

export interface ArchivedArtworkDto {
  savedArtworkId: number;
  artworkId: number;
  title: string;
  artistName: string;
  thumbnailUrl: string;
  memo: string | null;
  savedAt: string;
}

export interface GetArchivedArtworksResponseDataDto {
  savedArtworks: ArchivedArtworkDto[];
}

export type GetArchivedArtworksResponseDto = ApiResponseDto<GetArchivedArtworksResponseDataDto>;

export interface ArchivedArtistStatusDto {
  artistId: number;
  isArchived: boolean;
}

export type ArchiveArtistResponseDto = ApiResponseDto<ArchivedArtistStatusDto>;

export type UnarchiveArtistResponseDto = ApiResponseDto<ArchivedArtistStatusDto>;

export interface ArchivedArtistDto {
  savedArtistId: number;
  artistId: number;
  name: string;
  field: string;
  profileImageUrl: string;
  savedAt: string;
}

export interface GetArchivedArtistsResponseDataDto {
  savedArtists: ArchivedArtistDto[];
}

export type GetArchivedArtistsResponseDto = ApiResponseDto<GetArchivedArtistsResponseDataDto>;
