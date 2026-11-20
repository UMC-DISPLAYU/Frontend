import { http, HttpResponse } from 'msw';

import { created, paths, readJson } from '@/mocks/response';

const MOCK_UPLOAD_URL = 'https://mock.displayu.local/upload';
const MOCK_VIDEO_URL = 'https://mock.displayu.local/videos';
const MOCK_IMAGE_URL = 'https://mock.displayu.local/images';

/*
 * 올린 파일은 새로고침 전까지 메모리에 두고 같은 주소로 돌려줍니다.
 * 사진도 올린 파일 그대로 보여야 썸네일 보이는 방식(사진 비율로 자동 결정)을 목에서 확인할 수 있습니다
 */
const uploadedVideos = new Map<string, Blob>();
const uploadedImages = new Map<string, Blob>();
let nextVideoId = 1;
let nextImageId = 1;

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

      const key = String(nextImageId++);

      return created('/api/v1/files/presigned-url', {
        fileName,
        fileUrl: `${MOCK_IMAGE_URL}/${key}`,
        imageUrl: `${MOCK_IMAGE_URL}/${key}`,
        uploadUrl: `${MOCK_UPLOAD_URL}/images/${key}`,
        presignedUrl: `${MOCK_UPLOAD_URL}/images/${key}`,
      });
    }),
  ),
  // presigned URL로 보내는 실제 업로드(PUT)를 받아 성공 응답을 돌려줍니다.
  http.put(`${MOCK_UPLOAD_URL}/images/:key`, async ({ params, request }) => {
    uploadedImages.set(String(params.key), await request.blob());
    return new HttpResponse(null, { status: 200 });
  }),
  http.get(`${MOCK_IMAGE_URL}/:key`, ({ params }) => {
    const image = uploadedImages.get(String(params.key));
    if (!image) return new HttpResponse(null, { status: 404 });

    return new HttpResponse(image, {
      headers: { 'Content-Type': image.type || 'image/png', 'Content-Length': String(image.size) },
    });
  }),
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
