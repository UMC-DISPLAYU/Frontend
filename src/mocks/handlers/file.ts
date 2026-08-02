import { http } from 'msw';

import { MOCK_UPLOAD_IMAGE_URL } from '@/mocks/data/repository';
import { created, paths, readJson } from '@/mocks/response';

export const fileHandlers = paths('/api/v1/files/presigned-url').map((path) =>
  http.post(path, async ({ request }) => {
    const body = await readJson<{ fileName?: string }>(request);
    const fileName = body.fileName ?? 'mock-upload.jpg';

    return created('/api/v1/files/presigned-url', {
      fileName,
      fileUrl: MOCK_UPLOAD_IMAGE_URL,
      imageUrl: MOCK_UPLOAD_IMAGE_URL,
      uploadUrl: 'https://mock.displayu.local/upload',
      presignedUrl: 'https://mock.displayu.local/upload',
    });
  }),
);
