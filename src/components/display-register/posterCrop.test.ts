import { describe, expect, it } from 'vitest';

import { fitCrop, isSameCrop, isValidCrop, moveCrop, resizeCrop, scaleCrop } from './posterCrop';

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
