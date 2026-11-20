import type { ApiResponseDto } from './common.dto';

export type PresignedFileTypeDto = 'IMAGE' | 'VIDEO';

/* 전시 포스터 · 작품 미디어 항목이 이미지인지 영상인지 */
export type MediaTypeDto = 'IMAGE' | 'VIDEO';

/*
 * 대표 사진 · 포스터가 목록 칸에 보이는 방식. FILL 꽉 채우기(crop 으로 고른 부분), FIT 전체 보이기.
 * 백엔드 확인 전 필드라 실서버 응답에는 없을 수 있다. 없으면 사진 비율로 자동 결과를 쓴다
 */
export type ImageFitDto = 'FILL' | 'FIT';

export type PresignedContentTypeDto =
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp'
  | 'image/gif'
  | 'image/heic'
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
  uploadUrl: string;
  fileKey: string;
  fileUrl: string;
  expiresIn: number;
}

export type CreatePresignedUrlResponseDto = ApiResponseDto<CreatePresignedUrlResponseDataDto>;
