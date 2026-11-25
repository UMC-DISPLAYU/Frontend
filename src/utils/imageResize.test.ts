import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  getResizedImageSize,
  isAnimatedImageHeader,
  isProbePixelDataIntact,
  MAX_UPLOAD_IMAGE_EDGE,
  runImageTask,
  shrinkImageForUpload,
  toJpegFileName,
} from './imageResize';

describe('getResizedImageSize', () => {
  it('긴 변이 정확히 3,200px 이면 줄이지 않는다', () => {
    expect(MAX_UPLOAD_IMAGE_EDGE).toBe(3200);
    expect(getResizedImageSize({ width: 3200, height: 2400 })).toBeNull();
    expect(getResizedImageSize({ width: 2400, height: 3200 })).toBeNull();
    expect(getResizedImageSize({ width: 3200, height: 3200 })).toBeNull();
  });

  it('긴 변이 3,201px 이면 긴 변을 3,200px 로 줄인다', () => {
    expect(getResizedImageSize({ width: 3201, height: 2000 })).toEqual({
      width: 3200,
      height: 1999,
    });
    expect(getResizedImageSize({ width: 3201, height: 3201 })).toEqual({
      width: 3200,
      height: 3200,
    });
  });

  it('세로로 긴 사진은 세로를 3,200px 로 맞추고 비율을 지킨다', () => {
    expect(getResizedImageSize({ width: 2000, height: 3201 })).toEqual({
      width: 1999,
      height: 3200,
    });
    expect(getResizedImageSize({ width: 4000, height: 6000 })).toEqual({
      width: 2133,
      height: 3200,
    });
    expect(getResizedImageSize({ width: 3024, height: 4032 })).toEqual({
      width: 2400,
      height: 3200,
    });
  });

  it('가로로 긴 사진은 가로를 3,200px 로 맞춘다', () => {
    expect(getResizedImageSize({ width: 6000, height: 4000 })).toEqual({
      width: 3200,
      height: 2133,
    });
  });

  it('아주 가는 사진도 짧은 변이 1px 아래로 내려가지 않는다', () => {
    expect(getResizedImageSize({ width: 20000, height: 2 })).toEqual({ width: 3200, height: 1 });
  });

  it('기준 긴 변을 바꿔 쓸 수 있다', () => {
    expect(getResizedImageSize({ width: 200, height: 100 }, 100)).toEqual({
      width: 100,
      height: 50,
    });
  });
});

describe('toJpegFileName', () => {
  it('확장자를 .jpg 로 바꾼다', () => {
    expect(toJpegFileName('poster.png')).toBe('poster.jpg');
    expect(toJpegFileName('IMG_0001.HEIC')).toBe('IMG_0001.jpg');
    expect(toJpegFileName('my.photo.webp')).toBe('my.photo.jpg');
    expect(toJpegFileName('photo.jpeg')).toBe('photo.jpg');
  });

  it('확장자가 없으면 .jpg 를 붙인다', () => {
    expect(toJpegFileName('photo')).toBe('photo.jpg');
  });
});

const bytesOf = (...parts: (string | number[])[]) =>
  parts.flatMap((part) =>
    typeof part === 'string' ? Array.from(part, (char) => char.charCodeAt(0)) : part,
  );
const uint32 = (value: number) => [
  value >>> 24,
  (value >>> 16) & 255,
  (value >>> 8) & 255,
  value & 255,
];
const pngChunk = (type: string, length = 0) =>
  bytesOf(uint32(length), type, new Array<number>(length + 4).fill(0));
const PNG_SIGNATURE = bytesOf([0x89], 'PNG\r\n\x1a\n');
const webpHeader = (chunk: string, flags = 0) =>
  bytesOf('RIFF', [0, 0, 0, 0], 'WEBP', chunk, [10, 0, 0, 0], [flags, 0, 0, 0]);

describe('isAnimatedImageHeader', () => {
  it('VP8X 에 애니메이션 표시가 있는 WebP 는 움직이는 사진이다', () => {
    expect(isAnimatedImageHeader(new Uint8Array(webpHeader('VP8X', 0x02)))).toBe(true);
    expect(isAnimatedImageHeader(new Uint8Array(webpHeader('VP8X', 0x10)))).toBe(false);
    expect(isAnimatedImageHeader(new Uint8Array(webpHeader('VP8 ')))).toBe(false);
  });

  it('IDAT 앞에 acTL 이 있는 PNG 는 움직이는 사진이다', () => {
    const apng = [...PNG_SIGNATURE, ...pngChunk('IHDR', 13), ...pngChunk('acTL', 8)];
    const png = [...PNG_SIGNATURE, ...pngChunk('IHDR', 13), ...pngChunk('IDAT', 4)];

    expect(isAnimatedImageHeader(new Uint8Array([...apng, ...pngChunk('IDAT', 4)]))).toBe(true);
    expect(isAnimatedImageHeader(new Uint8Array(png))).toBe(false);
    // IDAT 뒤에 나오는 acTL 은 애니메이션이 아니다
    expect(isAnimatedImageHeader(new Uint8Array([...png, ...pngChunk('acTL', 8)]))).toBe(false);
  });

  it('JPG 나 잘린 파일은 움직이는 사진이 아니다', () => {
    expect(isAnimatedImageHeader(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe(false);
    expect(isAnimatedImageHeader(new Uint8Array(PNG_SIGNATURE))).toBe(false);
    expect(isAnimatedImageHeader(new Uint8Array())).toBe(false);
  });
});

describe('isProbePixelDataIntact', () => {
  const probe = [255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 0, 0, 0, 255];

  it('그대로 읽었거나 조금만 바뀌었으면 캔버스 결과를 믿는다', () => {
    expect(isProbePixelDataIntact(probe)).toBe(true);
    expect(isProbePixelDataIntact(probe.map((value) => (value ? value - 8 : value + 8)))).toBe(
      true,
    );
  });

  it('무작위 픽셀 · 흰 픽셀 · 빈 결과는 믿지 않는다', () => {
    // 파이어폭스 resistFingerprinting 에서 실제로 읽힌 값
    const randomized = [68, 187, 171, 122, 149, 254, 174, 223, 114, 79, 73, 221, 165, 164, 111, 35];

    expect(isProbePixelDataIntact(randomized)).toBe(false);
    expect(isProbePixelDataIntact(new Array(16).fill(255))).toBe(false);
    expect(isProbePixelDataIntact(probe.map((value) => (value ? value - 9 : value)))).toBe(false);
    expect(isProbePixelDataIntact([])).toBe(false);
  });
});

describe('runImageTask', () => {
  it('앞 작업이 끝난 뒤에 다음 작업을 시작하고, 앞 작업이 실패해도 다음 작업은 한다', async () => {
    const events: string[] = [];
    let finishFirst!: () => void;

    const first = runImageTask(
      () =>
        new Promise<void>((resolve) => {
          events.push('first:start');
          finishFirst = () => {
            events.push('first:end');
            resolve();
          };
        }),
    );
    const failing = runImageTask(async () => {
      events.push('failing');
      throw new Error('x');
    });
    const last = runImageTask(async () => {
      events.push('last');
      return 'done';
    });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(events).toEqual(['first:start']);

    finishFirst();
    await first;
    await expect(failing).rejects.toThrow('x');
    await expect(last).resolves.toBe('done');
    expect(events).toEqual(['first:start', 'first:end', 'failing', 'last']);
  });
});

describe('shrinkImageForUpload', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const stubImage = (result: 'load' | 'error', width = 0, height = 0) =>
    vi.stubGlobal(
      'Image',
      class {
        naturalWidth = width;
        naturalHeight = height;
        onload?: () => void;
        onerror?: () => void;
        set src(_value: string) {
          queueMicrotask(() => (result === 'load' ? this.onload?.() : this.onerror?.()));
        }
      },
    );

  it('브라우저가 풀지 못하는 사진은 원본을 그대로 돌려준다', async () => {
    stubImage('error');
    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });

    await expect(shrinkImageForUpload(file)).resolves.toBe(file);
  });

  it('3,200px 이하는 원본을 그대로 돌려준다', async () => {
    stubImage('load', 3200, 2400);
    const file = new File(['x'], 'photo.png', { type: 'image/png' });

    await expect(shrinkImageForUpload(file)).resolves.toBe(file);
  });

  it('3,200px 을 넘어도 움직이는 사진은 첫 장만 남지 않게 원본을 그대로 돌려준다', async () => {
    stubImage('load', 4000, 3000);
    const file = new File([new Uint8Array(webpHeader('VP8X', 0x02))], 'anim.webp', {
      type: 'image/webp',
    });

    await expect(shrinkImageForUpload(file)).resolves.toBe(file);
  });

  it('그리기에 실패하면 원본을 그대로 돌려준다', async () => {
    stubImage('load', 4000, 3000);
    vi.stubGlobal('document', {
      createElement: () => ({ width: 0, height: 0, getContext: () => null }),
    });
    const file = new File(['x'], 'photo.jpg', { type: 'image/jpeg' });

    await expect(shrinkImageForUpload(file)).resolves.toBe(file);
  });
});
