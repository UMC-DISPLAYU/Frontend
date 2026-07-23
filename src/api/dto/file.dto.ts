import type { ApiResponseDto } from './common.dto';

export type PresignedFileTypeDto = 'IMAGE' | 'VIDEO';

export type PresignedContentTypeDto =
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp'
  | 'image/gif'
  | 'video/mp4'
  | 'video/quicktime'
  | 'video/webm';

export interface CreatePresignedUrlRequestDto {
  fileType: PresignedFileTypeDto;
  domain: string;
  fileName: string;
  contentType: PresignedContentTypeDto;
  fileSize?: number;
}

export interface CreatePresignedUrlResponseDataDto {
  presignedUrl?: string;
  fileUrl?: string;
  [key: string]: unknown;
}

export type CreatePresignedUrlResponseDto = ApiResponseDto<CreatePresignedUrlResponseDataDto>;
