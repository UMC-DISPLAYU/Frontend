import { describe, expect, it } from 'vitest';

import {
  autoThumbnailFit,
  fillCutRatio,
  fitCrop,
  isSameCrop,
  isValidCrop,
  moveCrop,
  resizeCrop,
  resolveSavedThumbnail,
  scaleCrop,
} from './cropBox';

const CROP_RATIO = 0.75;

describe('fitCrop', () => {
  it('사진이 상자보다 넓으면 세로를 꽉 채우고 가로 가운데를 자른다', () => {
    const crop = fitCrop(1.5, CROP_RATIO);

    expect(crop.h).toBe(1);
    expect(crop.y).toBe(0);
    expect(crop.w).toBeCloseTo(0.5);
    expect(crop.x).toBeCloseTo(0.25);
  });

  it('사진이 상자보다 좁으면 가로를 꽉 채우고 세로 가운데를 자른다', () => {
    const crop = fitCrop(0.375, CROP_RATIO);

    expect(crop.w).toBe(1);
    expect(crop.x).toBe(0);
    expect(crop.h).toBeCloseTo(0.5);
    expect(crop.y).toBeCloseTo(0.25);
  });
});

describe('moveCrop', () => {
  const crop = { x: 0.2, y: 0.2, w: 0.5, h: 0.5 };

  it('사진 밖으로 나가지 않는다', () => {
    expect(moveCrop(crop, -1, -1)).toMatchObject({ x: 0, y: 0 });
    expect(moveCrop(crop, 1, 1)).toMatchObject({ x: 0.5, y: 0.5 });
  });
});

describe('resizeCrop', () => {
  const imageRatio = 0.75;
  const start = { x: 0.25, y: 0.25, w: 0.5, h: 0.5 };

  it('오른쪽 아래를 끌면 왼쪽 위가 고정된다', () => {
    const next = resizeCrop(start, 'br', { x: 0.65, y: 0.65 }, imageRatio, CROP_RATIO, 0.1);

    expect(next.x).toBeCloseTo(0.25);
    expect(next.y).toBeCloseTo(0.25);
    expect(next.w).toBeCloseTo(0.4);
    expect(next.h).toBeCloseTo(0.4);
  });

  it('왼쪽 위를 끌면 오른쪽 아래가 고정된다', () => {
    const next = resizeCrop(start, 'tl', { x: 0.45, y: 0.45 }, imageRatio, CROP_RATIO, 0.1);

    expect(next.x + next.w).toBeCloseTo(0.75);
    expect(next.y + next.h).toBeCloseTo(0.75);
  });

  it('사진 경계를 넘지 않는다', () => {
    const next = resizeCrop(start, 'br', { x: 5, y: 5 }, imageRatio, CROP_RATIO, 0.1);

    expect(next.x + next.w).toBeCloseTo(1);
    expect(next.y + next.h).toBeCloseTo(1);
  });

  it('최소 크기보다 작아지지 않는다', () => {
    const next = resizeCrop(start, 'br', { x: 0.25, y: 0.25 }, imageRatio, CROP_RATIO, 0.2);

    expect(next.w).toBeCloseTo(0.2);
  });
});

describe('scaleCrop', () => {
  it('가운데를 유지하며 줄어든다', () => {
    const next = scaleCrop({ x: 0.25, y: 0.25, w: 0.5, h: 0.5 }, 0.5, 0.75, CROP_RATIO, 0.1);

    expect(next.x + next.w / 2).toBeCloseTo(0.5);
    expect(next.y + next.h / 2).toBeCloseTo(0.5);
    expect(next.w).toBeCloseTo(0.25);
  });

  it('사진보다 커지지 않는다', () => {
    const next = scaleCrop({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 }, 2, 0.75, CROP_RATIO, 0.1);

    expect(next.w).toBeCloseTo(1);
    expect(next.x).toBeCloseTo(0);
  });
});

describe('isSameCrop', () => {
  it('아주 작은 차이는 같다고 본다', () => {
    expect(isSameCrop({ x: 0, y: 0, w: 1, h: 1 }, { x: 0.0001, y: 0, w: 1, h: 1 })).toBe(true);
    expect(isSameCrop({ x: 0, y: 0, w: 1, h: 1 }, { x: 0.1, y: 0, w: 1, h: 1 })).toBe(false);
  });
});

describe('isValidCrop', () => {
  it('없거나 범위를 벗어나면 거짓이다', () => {
    expect(isValidCrop(null)).toBe(false);
    expect(isValidCrop({ x: 0.5, y: 0, w: 0.6, h: 1 })).toBe(false);
    expect(isValidCrop({ x: 0, y: 0, w: 0, h: 1 })).toBe(false);
    expect(isValidCrop({ x: Number.NaN, y: 0, w: 1, h: 1 })).toBe(false);
  });

  it('사진 안의 상자는 참이다', () => {
    expect(isValidCrop({ x: 0.1, y: 0.1, w: 0.5, h: 0.5 })).toBe(true);
  });
});

describe('autoThumbnailFit', () => {
  it('3:4 칸에 꽉 채웠을 때 잘리는 양을 잰다', () => {
    expect(fillCutRatio(0.75, CROP_RATIO)).toBe(0);
    expect(fillCutRatio(1, CROP_RATIO)).toBeCloseTo(0.25);
    expect(fillCutRatio(1.5, CROP_RATIO)).toBeCloseTo(0.5);
    expect(fillCutRatio(0.375, CROP_RATIO)).toBeCloseTo(0.5);
  });

  it('30% 를 넘게 잘리면 전체 보이기, 30% 까지는 꽉 채우기다', () => {
    // 정사각은 25% 잘림
    expect(autoThumbnailFit(1, CROP_RATIO)).toBe('fill');
    // 가로 0.75 / 0.7 ≈ 1.0714 는 딱 30% 잘림
    expect(autoThumbnailFit(0.75 / 0.7, CROP_RATIO)).toBe('fill');
    expect(autoThumbnailFit(0.75 / 0.69, CROP_RATIO)).toBe('fit');
    // 세로로 긴 사진: 0.75 × 0.7 = 0.525 는 딱 30% 잘림
    expect(autoThumbnailFit(0.525, CROP_RATIO)).toBe('fill');
    expect(autoThumbnailFit(0.52, CROP_RATIO)).toBe('fit');
  });
});

describe('resolveSavedThumbnail', () => {
  const crop = { x: 0.25, y: 0, w: 0.75, h: 1 };

  it('전체 보이기면 영역을 쓰지 않는다', () => {
    expect(resolveSavedThumbnail(crop, 'FIT')).toEqual({ crop: null, isFit: true });
  });

  it('꽉 채우기이거나 방식이 없으면 저장된 영역을 쓴다', () => {
    expect(resolveSavedThumbnail(crop, 'FILL')).toEqual({ crop, isFit: false });
    expect(resolveSavedThumbnail(crop, null)).toEqual({ crop, isFit: false });
    expect(resolveSavedThumbnail({ x: 0.5, y: 0, w: 0.6, h: 1 }, undefined)).toEqual({
      crop: null,
      isFit: false,
    });
  });
});
