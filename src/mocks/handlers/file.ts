import { http, HttpResponse } from 'msw';

import { MOCK_UPLOAD_IMAGE_URL } from '@/mocks/data/repository';
import { created, paths, readJson } from '@/mocks/response';

const MOCK_UPLOAD_URL = 'https://mock.displayu.local/upload';
const MOCK_VIDEO_URL = 'https://mock.displayu.local/videos';

/* 목 데이터에 영상 샘플이 없어, 올린 영상은 새로고침 전까지 메모리에 두고 같은 주소로 돌려줍니다 */
const uploadedVideos = new Map<string, Blob>();
let nextVideoId = 1;

export const fileHandlers = [
  ...paths('/api/v1/files/presigned-url').map((path) =>
    http.post(path, async ({ request }) => {
      const body = await readJson<{ fileName?: string; fileType?: string }>(request);
      const fileName = body.fileName ?? 'mock-upload.jpg';

      if (body.fileType === 'VIDEO') {
        const key = `${nextVideoId++}.mp4`;

        return created('/api/v1/files/presigned-url', {
          fileName,
          fileKey: `videos/${key}`,
          fileUrl: `${MOCK_VIDEO_URL}/${key}`,
          uploadUrl: `${MOCK_UPLOAD_URL}/videos/${key}`,
          expiresIn: 600,
        });
      }

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
  http.put(`${MOCK_UPLOAD_URL}/videos/:key`, async ({ params, request }) => {
    uploadedVideos.set(String(params.key), await request.blob());
    return new HttpResponse(null, { status: 200 });
  }),
  http.get(`${MOCK_VIDEO_URL}/:key`, ({ params }) => {
    const video = uploadedVideos.get(String(params.key));
    if (!video) return new HttpResponse(null, { status: 404 });

    return new HttpResponse(video, {
      headers: { 'Content-Type': 'video/mp4', 'Content-Length': String(video.size) },
    });
  }),
];
