import { useMutation } from '@tanstack/react-query';

import type { CreatePresignedUrlRequestDto, PresignedContentTypeDto } from '@/api/dto';
import { createPresignedUrl, uploadFileToPresignedUrl } from '@/api/endpoints';

export const useCreatePresignedUrl = () =>
  useMutation({
    mutationFn: (body: CreatePresignedUrlRequestDto) => createPresignedUrl(body),
  });

// presigned URL 발급 후 해당 파일을 업로드하고, 조회용 fileUrl을 반환
export const useUploadImage = () =>
  useMutation({
    mutationFn: async ({ file, domain }: { file: File; domain: string }) => {
      const { uploadUrl, fileUrl } = await createPresignedUrl({
        fileType: 'IMAGE',
        domain,
        fileName: file.name,
        contentType: file.type as PresignedContentTypeDto,
        fileSize: file.size,
      });

      await uploadFileToPresignedUrl(uploadUrl, file);

      return fileUrl;
    },
  });
