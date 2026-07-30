import type { CreatePresignedUrlRequestDto, CreatePresignedUrlResponseDataDto } from '@/api/dto';

import { apiRequest } from '../client';

// POST /v1/files/presigned-url
export const createPresignedUrl = async (
  body: CreatePresignedUrlRequestDto,
): Promise<CreatePresignedUrlResponseDataDto> =>
  apiRequest('/v1/files/presigned-url', { method: 'POST', body });

// presigned uploadUrl로 파일을 S3에 직접 업로드 (백엔드 API를 거치지 않음)
export const uploadFileToPresignedUrl = async (uploadUrl: string, file: File): Promise<void> => {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  if (!response.ok) {
    throw new Error('파일 업로드에 실패했습니다.');
  }
};
