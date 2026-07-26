import { http } from 'msw';

import { MOCK_UPLOAD_IMAGE_URL } from '@/mocks/data';
import { createSuccessJson } from '@/mocks/response';

export const fileHandlers = [
  http.post('*/v1/files/presigned-url', async ({ request }) => {
    const body = (await request.json()) as { fileName?: string };
    const fileName = body.fileName ?? 'mock-upload.png';
    const encodedFileName = encodeURIComponent(fileName);

    return createSuccessJson(new URL(request.url).pathname, {
      uploadUrl: `https://mock-upload.displayu.test/${encodedFileName}`,
      fileKey: `mock/uploads/${encodedFileName}`,
      fileUrl: MOCK_UPLOAD_IMAGE_URL,
      expiresIn: 300,
    });
  }),
];
