import type { ApiResponseDto, ImageRequestDto, ImageResponseDto } from './common.dto';

export interface PersonalArtworkRequestDto {
  artworkName: string;
  content?: string;
  type: string;
  productionYear: number;
  materialMedia: string;
  size?: string;
  point?: string;
  images: ImageRequestDto[];
}

export interface PersonalArtworkResponseDataDto {
  personalArtworkId: number;
  userId: number;
  artworkName: string;
  content?: string;
  type: string;
  productionYear: number;
  materialMedia: string;
  size?: string;
  point?: string;
  createdAt: string;
  images: ImageResponseDto[];
}

export interface PersonalArtworkSummaryDto {
  personalArtworkId: number;
  artworkName: string;
  thumbnailUrl: string;
  type: string;
  createdAt: string;
}

export type GetPersonalArtworksResponseDataDto = PersonalArtworkSummaryDto[];

export type GetPersonalArtworksResponseDto = ApiResponseDto<GetPersonalArtworksResponseDataDto>;

export type GetPersonalArtworkResponseDto = ApiResponseDto<PersonalArtworkResponseDataDto>;

export type CreatePersonalArtworkResponseDto = ApiResponseDto<PersonalArtworkResponseDataDto>;

export type UpdatePersonalArtworkResponseDto = ApiResponseDto<PersonalArtworkResponseDataDto>;

export type DeletePersonalArtworkResponseDto = ApiResponseDto<null>;
