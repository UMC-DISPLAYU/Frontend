import { http, HttpResponse } from 'msw';

import { MOCK_UPLOAD_IMAGE_URL } from '@/mocks/data/repository';
import { created, paths, readJson } from '@/mocks/response';

const MOCK_UPLOAD_URL = 'https://mock.displayu.local/upload';

export const fileHandlers = [
  ...paths('/api/v1/files/presigned-url').map((path) =>
    http.post(path, async ({ request }) => {
      const body = await readJson<{ fileName?: string }>(request);
      const fileName = body.fileName ?? 'mock-upload.jpg';

      return created('/api/v1/files/presigned-url', {
        fileName,
        fileUrl: MOCK_UPLOAD_IMAGE_URL,
        imageUrl: MOCK_UPLOAD_IMAGE_URL,
        uploadUrl: MOCK_UPLOAD_URL,
        presignedUrl: MOCK_UPLOAD_URL,
      });
    }),
  ),
  // presigned URL로 보내는 실제 업로드(PUT)를 받아 성공 응답을 돌려줍니다.
  http.put(MOCK_UPLOAD_URL, () => new HttpResponse(null, { status: 200 })),
];
