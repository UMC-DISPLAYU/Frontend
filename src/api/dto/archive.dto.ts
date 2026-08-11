import type { ApiResponseDto, CursorPageInfoDto } from './common.dto';

export interface ArchivedExhibitionStatusDto {
  exhibitionId: number;
  isArchived: boolean;
}

export type ArchiveExhibitionResponseDto = ApiResponseDto<ArchivedExhibitionStatusDto>;

export type UnarchiveExhibitionResponseDto = ApiResponseDto<ArchivedExhibitionStatusDto>;

export interface ArchivedExhibitionDto {
  savedExhibitionId: number;
  displayId: number;
  userId?: number;
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
  savedExhibitions?: ArchivedExhibitionDto[];
  displays?: ArchivedExhibitionDto[];
}

export type GetArchivedExhibitionsResponseDto =
  ApiResponseDto<GetArchivedExhibitionsResponseDataDto>;

export interface ArchivedArtworkStatusDto {
  artworkId: number;
  isArchived: boolean;
}

export interface ArchivedPersonalArtworkStatusDto {
  personalArtworkId: number;
  isArchived: boolean;
}

export type ArchiveArtworkResponseDto = ApiResponseDto<ArchivedArtworkStatusDto>;

export type UnarchiveArtworkResponseDto = ApiResponseDto<ArchivedArtworkStatusDto>;

export type ArchivePersonalArtworkResponseDto = ApiResponseDto<ArchivedPersonalArtworkStatusDto>;

export type UnarchivePersonalArtworkResponseDto = ApiResponseDto<ArchivedPersonalArtworkStatusDto>;

export interface ArchivedArtworkDto {
  archiveWorkId: number;
  artworkId: number | null;
  personalArtworkId?: number | null;
  userId: number;
  memo: string | null;
  savedAt: string;
}

export type ArchiveArtworkCursorDto = number | string;

export interface GetArchivedArtworksRequestDto {
  cursorId?: ArchiveArtworkCursorDto | null;
  size?: number;
}

export interface GetArchivedArtworksResponseDataDto {
  works: ArchivedArtworkDto[];
  nextCursorId: ArchiveArtworkCursorDto | null;
  nextCursor?: ArchiveArtworkCursorDto | null;
  size: number;
  hasNext: boolean;
}

export type GetArchivedArtworksResponseDto = ApiResponseDto<GetArchivedArtworksResponseDataDto>;

export interface ArchivedArtistStatusDto {
  artistId: number;
  isArchived: boolean;
}

export type ArchiveArtistResponseDto = ApiResponseDto<ArchivedArtistStatusDto>;

export type UnarchiveArtistResponseDto = ApiResponseDto<ArchivedArtistStatusDto>;

export interface ArchivedArtistDto {
  archiveArtistId: number;
  artistId: number;
  userId: number;
  artistName: string;
  fields: string[];
  profileImageUrl: string;
  artworkCount: number;
  exhibitionCount: number;
  savedAt: string;
}

export interface GetArchivedArtistsResponseDataDto extends CursorPageInfoDto {
  artists: ArchivedArtistDto[];
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
