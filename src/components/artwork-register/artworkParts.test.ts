import { describe, expect, it } from 'vitest';

import {
  countPartMedia,
  createArtworkPartValues,
  getPartMediaLimit,
  isAnyPartUploading,
  toPartUploads,
} from './artworkParts';
import type { ArtworkImageItem } from './useArtworkImageUploads';

const photo = (id: string, uploaded = true): ArtworkImageItem => ({
  id,
  mediaType: 'IMAGE',
  previewUrl: `blob:${id}`,
  ...(uploaded && { uploadedUrl: `https://cdn/${id}.jpg` }),
});
const video = (id: string, thumbnailUrl?: string): ArtworkImageItem => ({
  id,
  mediaType: 'VIDEO',
  previewUrl: `blob:${id}`,
  uploadedUrl: `https://cdn/${id}.mp4`,
  thumbnailUrl,
  width: 640,
  height: 360,
});

describe('연작 사진 · 영상 세기', () => {
  it('작품 2부터 칸의 사진 · 영상을 올리는 중인 것까지 모두 센다', () => {
    expect(countPartMedia([])).toBe(0);
    expect(countPartMedia([{ media: [photo('a'), photo('b', false)] }, { media: [] }, {}])).toBe(2);
  });

  it('한 칸이 받을 수 있는 장수는 모든 작품 합계 10에서 다른 작품 장수를 뺀 값이다', () => {
    // 작품 1에 2장, 이 칸에 0장 → 8장까지
    expect(getPartMediaLimit(0, 2, 10)).toBe(8);
    // 이 칸에 3장, 다른 작품에 7장 → 이 칸은 지금 3장까지(더 못 올린다)
    expect(getPartMediaLimit(3, 10, 10)).toBe(3);
    // 합계가 이미 넘쳤어도 이 칸에 있는 장수보다 작아지지 않는다
    expect(getPartMediaLimit(2, 12, 10)).toBe(2);
  });

  it('작품 2부터 칸 중 하나라도 올리는 중이면 등록을 막는다', () => {
    expect(isAnyPartUploading([{ media: [photo('a')] }])).toBe(false);
    expect(isAnyPartUploading([{ media: [photo('a')] }, { media: [photo('b', false)] }])).toBe(
      true,
    );
    // 영상은 썸네일까지 올라가야 끝난다
    expect(isAnyPartUploading([{ media: [video('v')] }])).toBe(true);
  });

  it('다 올라간 사진 · 영상만 작품 순서대로 모으고, 영상은 썸네일 · 크기를 함께 둔다', () => {
    expect(
      toPartUploads([
        { media: [photo('a'), photo('b', false)] },
        { media: [video('v', 'https://cdn/v.jpg')] },
      ]),
    ).toEqual({
      partUrls: [['https://cdn/a.jpg'], ['https://cdn/v.mp4']],
      videos: {
        'https://cdn/v.mp4': { thumbnailUrl: 'https://cdn/v.jpg', width: 640, height: 360 },
      },
    });
  });

  it('새 작품 칸은 작품 1 연도로 채우고 칸마다 다른 구분 값을 둔다', () => {
    const first = createArtworkPartValues('2026');
    const second = createArtworkPartValues('2026');

    expect(first).toMatchObject({ title: '', year: '2026', material: '', size: '', media: [] });
    expect(first.key).not.toBe(second.key);
  });
});
