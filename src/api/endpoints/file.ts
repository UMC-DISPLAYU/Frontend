import type { CreatePresignedUrlRequestDto, CreatePresignedUrlResponseDataDto } from '@/api/dto';

import { apiRequest } from '../client';

// POST /v1/files/presigned-url
export const createPresignedUrl = async (
  body: CreatePresignedUrlRequestDto,
): Promise<CreatePresignedUrlResponseDataDto> =>
  apiRequest('/v1/files/presigned-url', { method: 'POST', body });
