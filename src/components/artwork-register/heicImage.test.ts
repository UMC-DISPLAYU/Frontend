import { afterEach, describe, expect, it, vi } from 'vitest';

import { convertHeicToJpeg, heicAcceptTokens, isHeicFile } from './heicImage';

const { bitmap, heicTo, drawImageToJpegFile } = vi.hoisted(() => {
  const bitmap = { width: 4032, height: 3024, close: vi.fn() };

  return {
    bitmap,
    heicTo: vi.fn(async () => bitmap),
    drawImageToJpegFile: vi.fn(
      async (_source: unknown, _size: unknown, { name }: { name: string }) =>
        new File(['jpg'], name.replace(/\.[^.]*$/, '.jpg'), { type: 'image/jpeg' }),
    ),
  };
});

vi.mock('heic-to/csp', () => ({ heicTo }));
vi.mock('@/utils/imageResize', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/utils/imageResize')>()),
  drawImageToJpegFile,
}));

describe('isHeicFile', () => {
  it('형식이 HEIC · HEIF 이거나, 형식이 비어 있어도 확장자가 .heic · .heif 면 HEIC 로 본다', () => {
    expect(isHeicFile({ type: 'image/heic', name: 'a' })).toBe(true);
    expect(isHeicFile({ type: 'image/HEIF', name: 'a' })).toBe(true);
    expect(isHeicFile({ type: '', name: 'IMG_0001.HEIC' })).toBe(true);
    expect(isHeicFile({ type: '', name: 'photo.heif' })).toBe(true);
  });

  it('다른 사진 형식은 HEIC 가 아니고, 형식이 있으면 이름이 .heic 여도 형식을 따른다', () => {
    expect(isHeicFile({ type: 'image/jpeg', name: 'a.jpg' })).toBe(false);
    expect(isHeicFile({ type: '', name: 'heic.png' })).toBe(false);
    expect(isHeicFile({ type: 'image/jpeg', name: 'photo.heic' })).toBe(false);
  });
});

describe('heicAcceptTokens', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const stubNavigator = (userAgent: string, maxTouchPoints = 0) =>
    vi.stubGlobal('navigator', { userAgent, maxTouchPoints });

  it('iOS · iPadOS 는 HEIC 를 넣지 않아 기기가 JPG 로 바꿔 넘기게 한다', () => {
    stubNavigator('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)', 5);
    expect(heicAcceptTokens()).toEqual([]);

    stubNavigator('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15', 5);
    expect(heicAcceptTokens()).toEqual([]);
  });

  it('PC · 안드로이드는 HEIC 형식과 확장자를 넣는다', () => {
    stubNavigator('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/150.0');
    expect(heicAcceptTokens()).toEqual(['image/heic', 'image/heif', '.heic', '.heif']);

    stubNavigator('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/150.0');
    expect(heicAcceptTokens()).toEqual(['image/heic', 'image/heif', '.heic', '.heif']);
  });
});

describe('convertHeicToJpeg', () => {
  const file = new File(['heic'], 'IMG_0001.HEIC', { type: 'image/heic', lastModified: 1 });

  it('긴 변이 3,200px 을 넘으면 한 번에 긴 변 3,200px · 품질 0.9 JPG 로 그린다', async () => {
    const converted = await convertHeicToJpeg(file);

    expect(heicTo).toHaveBeenCalledWith({ blob: file, type: 'bitmap' });
    expect(drawImageToJpegFile).toHaveBeenCalledWith(
      bitmap,
      { width: 3200, height: 2400 },
      { name: 'IMG_0001.HEIC', lastModified: 1, quality: 0.9 },
    );
    expect(bitmap.close).toHaveBeenCalled();
    expect(converted.type).toBe('image/jpeg');
    expect(converted.name).toBe('IMG_0001.jpg');
  });

  it('3,200px 이하는 크기를 그대로 두고 지금처럼 품질 0.92 로 바꾼다', async () => {
    heicTo.mockResolvedValueOnce({ ...bitmap, width: 3024, height: 3200 });

    await convertHeicToJpeg(file);

    expect(drawImageToJpegFile).toHaveBeenLastCalledWith(
      expect.anything(),
      { width: 3024, height: 3200 },
      { name: 'IMG_0001.HEIC', lastModified: 1, quality: 0.92 },
    );
  });
});
