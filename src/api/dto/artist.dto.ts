import type { ApiResponseDto } from './common.dto';

export interface CreateArtistProfileRequestDto {
  artistName: string;
  activityFields: string[];
}

export interface CreateArtistProfileResponseDataDto {
  artistProfileId: number;
  artistName: string;
  schoolEmail: string;
  univName: string;
  activityFields: string[];
}

export type CreateArtistProfileResponseDto = ApiResponseDto<CreateArtistProfileResponseDataDto>;
