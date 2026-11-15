import { afterEach, describe, expect, it, vi } from 'vitest';

import { convertHeicToJpeg, heicAcceptTokens, isHeicFile } from './heicImage';

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
  it('JPG 로 바꾸고 이름의 확장자도 .jpg 로 바꾼다', async () => {
    const file = new File(['heic'], 'IMG_0001.HEIC', { type: 'image/heic' });

    const converted = await convertHeicToJpeg(file);

    expect(heicTo).toHaveBeenCalledWith({ blob: file, type: 'image/jpeg', quality: 0.92 });
    expect(converted.type).toBe('image/jpeg');
    expect(converted.name).toBe('IMG_0001.jpg');
  });
});
