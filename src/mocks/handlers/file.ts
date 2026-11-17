import { http, HttpResponse } from 'msw';

import { MOCK_UPLOAD_IMAGE_URL } from '@/mocks/data/repository';
import { created, paths, readJson } from '@/mocks/response';

const MOCK_UPLOAD_URL = 'https://mock.displayu.local/upload';
const MOCK_VIDEO_URL = 'https://mock.displayu.local/videos';
const MOCK_IMAGE_URL = 'https://mock.displayu.local/images';

/* 목 데이터에 영상 샘플이 없어, 올린 영상은 새로고침 전까지 메모리에 두고 같은 주소로 돌려줍니다 */
const uploadedVideos = new Map<string, Blob>();
let nextVideoId = 1;

/* 올린 사진 · 그림도 새로고침 전까지 메모리에 두고 파일마다 다른 주소로 돌려줍니다(샘플 사진으로 바꾸지 않음) */
const uploadedImages = new Map<string, Blob>();
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

      const extension = fileName.includes('.') ? fileName.split('.').pop() : 'jpg';
      const key = `${nextImageId++}.${extension}`;
      const imageUrl = `${MOCK_IMAGE_URL}/${key}`;
      const uploadUrl = `${MOCK_UPLOAD_URL}/images/${key}`;

      return created('/api/v1/files/presigned-url', {
        fileName,
        fileKey: `images/${key}`,
        fileUrl: imageUrl,
        imageUrl,
        uploadUrl,
        presignedUrl: uploadUrl,
      });
    }),
  ),
  // presigned URL로 보내는 실제 업로드(PUT)를 받아 성공 응답을 돌려줍니다.
  http.put(MOCK_UPLOAD_URL, () => new HttpResponse(null, { status: 200 })),
  http.put(`${MOCK_UPLOAD_URL}/images/:key`, async ({ params, request }) => {
    uploadedImages.set(String(params.key), await request.blob());
    return new HttpResponse(null, { status: 200 });
  }),
  // 새로고침으로 메모리가 비면 예전처럼 샘플 사진을 보여줍니다
  http.get(`${MOCK_IMAGE_URL}/:key`, ({ params }) => {
    const image = uploadedImages.get(String(params.key));
    if (!image) return HttpResponse.redirect(MOCK_UPLOAD_IMAGE_URL, 302);

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
