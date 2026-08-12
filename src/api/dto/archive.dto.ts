import type { ApiResponseDto, CursorPageInfoDto } from './common.dto';

export interface ArchivedExhibitionStatusDto {
  exhibitionId: number;
  isArchived: boolean;
}

export type ArchiveExhibitionResponseDto = ApiResponseDto<ArchivedExhibitionStatusDto>;

export type UnarchiveExhibitionResponseDto = ApiResponseDto<ArchivedExhibitionStatusDto>;

export interface ArchivedExhibitionDto {
  posterImageUrl: string;
  status: string;
  title: string;
  organization: string;
  department: string;
  startedAt: string;
  endedAt: string;
  location: string;
  memo: string | null;
  archiveDisplayId: number;
  displayId: number;
  userId: number;
  savedAt: string;
}

export interface GetArchivedExhibitionsResponseDataDto extends CursorPageInfoDto {
  displays: ArchivedExhibitionDto[];
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
  archiveWorkId: number;
  artworkId: number;
  userId: number;
  memo: string | null;
  savedAt: string;
}

export interface GetArchivedArtworksResponseDataDto extends CursorPageInfoDto {
  works: ArchivedArtworkDto[];
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

export interface ArchiveMemoRequestDto {
  content: string;
}

export type GetArchivedExhibitionResponseDto = ApiResponseDto<ArchivedExhibitionDto>;

export type UpdateArchivedExhibitionMemoResponseDto = ApiResponseDto<ArchivedExhibitionDto>;

export type DeleteArchivedExhibitionMemoResponseDto = ApiResponseDto<null>;

export type GetArchivedArtworkResponseDto = ApiResponseDto<ArchivedArtworkDto>;

export type UpdateArchivedArtworkMemoResponseDto = ApiResponseDto<ArchivedArtworkDto>;

export type DeleteArchivedArtworkMemoResponseDto = ApiResponseDto<null>;

export type GetArchivedArtistResponseDto = ApiResponseDto<ArchivedArtistDto>;
