import { useMutation } from '@tanstack/react-query';

import type { CreatePresignedUrlRequestDto, PresignedContentTypeDto } from '@/api/dto';
import { createPresignedUrl, uploadFileToPresignedUrl } from '@/api/endpoints';

export const useCreatePresignedUrl = () =>
  useMutation({
    mutationFn: (body: CreatePresignedUrlRequestDto) => createPresignedUrl(body),
  });

const ALLOWED_IMAGE_CONTENT_TYPES: readonly PresignedContentTypeDto[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

const isAllowedImageContentType = (type: string): type is PresignedContentTypeDto =>
  (ALLOWED_IMAGE_CONTENT_TYPES as readonly string[]).includes(type);

// presigned URL 발급 후 해당 파일을 업로드하고, 조회용 fileUrl을 반환
export const useUploadImage = () =>
  useMutation({
    mutationFn: async ({ file, domain }: { file: File; domain: string }) => {
      if (!isAllowedImageContentType(file.type)) {
        throw new Error(`지원하지 않는 이미지 형식입니다. (${file.type || '알 수 없는 형식'})`);
      }

      const { uploadUrl, fileUrl } = await createPresignedUrl({
        fileType: 'IMAGE',
        domain,
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
      });

      await uploadFileToPresignedUrl(uploadUrl, file);

      return fileUrl;
    },
  });
