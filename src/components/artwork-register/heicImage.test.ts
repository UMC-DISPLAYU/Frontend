import { describe, expect, it, vi } from 'vitest';

import { convertHeicToJpeg, isHeicFile } from './heicImage';

const { heicTo } = vi.hoisted(() => ({
  heicTo: vi.fn(async () => new Blob(['jpg'], { type: 'image/jpeg' })),
}));

vi.mock('heic-to/csp', () => ({ heicTo }));

describe('isHeicFile', () => {
  it('형식이 HEIC · HEIF 이거나, 형식이 비어 있어도 확장자가 .heic · .heif 면 HEIC 로 본다', () => {
    expect(isHeicFile({ type: 'image/heic', name: 'a' })).toBe(true);
    expect(isHeicFile({ type: 'image/HEIF', name: 'a' })).toBe(true);
    expect(isHeicFile({ type: '', name: 'IMG_0001.HEIC' })).toBe(true);
    expect(isHeicFile({ type: '', name: 'photo.heif' })).toBe(true);
  });

  it('다른 사진 형식은 HEIC 가 아니다', () => {
    expect(isHeicFile({ type: 'image/jpeg', name: 'a.jpg' })).toBe(false);
    expect(isHeicFile({ type: '', name: 'heic.png' })).toBe(false);
  });
});

describe('convertHeicToJpeg', () => {
  it('JPG 로 바꾸고 이름의 확장자도 .jpg 로 바꾼다', async () => {
    const file = new File(['heic'], 'IMG_0001.HEIC', { type: 'image/heic' });

    const converted = await convertHeicToJpeg(file);

    expect(heicTo).toHaveBeenCalledWith({ blob: file, type: 'image/jpeg', quality: 0.92 });
    expect(converted.type).toBe('image/jpeg');
    expect(converted.name).toBe('IMG_0001.jpg');
  });
});
