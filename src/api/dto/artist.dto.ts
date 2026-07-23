import type { ApiResponseDto } from './common.dto';
import type { ArtistProfileDto } from './user.dto';

export interface CreateArtistProfileRequestDto {
  artistName: string;
  activityFields: string[];
}

export type CreateArtistProfileResponseDto = ApiResponseDto<ArtistProfileDto>;
