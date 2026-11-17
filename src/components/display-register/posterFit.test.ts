import { describe, expect, it } from 'vitest';

import { POSTER_CARD_RATIO } from './displayRegister.constants';
import {
  defaultPosterCrop,
  defaultPosterFitMode,
  isWholePosterCrop,
  mostCommonEdgeColor,
  POSTER_WHOLE_CROP,
  posterCutRatio,
} from './posterFit';

describe('posterCutRatio', () => {
  it('카드와 같은 비율이면 잘리지 않는다', () => {
    expect(posterCutRatio(POSTER_CARD_RATIO)).toBeCloseTo(0);
  });

  it('정사각은 약 29% 잘린다', () => {
    expect(posterCutRatio(1)).toBeCloseTo(1 - POSTER_CARD_RATIO);
  });

  it('비율을 알 수 없으면 0', () => {
    expect(posterCutRatio(0)).toBe(0);
    expect(posterCutRatio(Number.NaN)).toBe(0);
  });
});

describe('defaultPosterFitMode', () => {
  it('A 규격 · 3:4 · 4:5 · 2:3 은 꽉 채우기', () => {
    [1 / Math.SQRT2, 3 / 4, 4 / 5, 2 / 3].forEach((ratio) => {
      expect(defaultPosterFitMode(ratio)).toBe('fill');
    });
  });

  it('정사각 · 가로 포스터는 전체 보이기', () => {
    expect(defaultPosterFitMode(1)).toBe('fit');
    expect(defaultPosterFitMode(16 / 9)).toBe('fit');
  });

  it('15% 경계: 15%까지는 꽉 채우기, 넘으면 전체 보이기', () => {
    const exact = POSTER_CARD_RATIO / 0.85;
    expect(defaultPosterFitMode(exact - 1e-6)).toBe('fill');
    expect(defaultPosterFitMode(exact + 1e-3)).toBe('fit');
  });
});

describe('defaultPosterCrop', () => {
  it('전체 보이기면 전체 범위, 꽉 채우기면 null', () => {
    expect(defaultPosterCrop(1)).toEqual(POSTER_WHOLE_CROP);
    expect(defaultPosterCrop(3 / 4)).toBeNull();
  });
});

describe('isWholePosterCrop', () => {
  it('전체 범위만 true', () => {
    expect(isWholePosterCrop({ x: 0, y: 0, w: 1, h: 1 })).toBe(true);
    expect(isWholePosterCrop({ x: 0, y: 0.1, w: 1, h: 0.8 })).toBe(false);
    expect(isWholePosterCrop(null)).toBe(false);
  });
});

describe('mostCommonEdgeColor', () => {
  const pixels = (width: number, height: number, at: (x: number, y: number) => number[]) => {
    const data: number[] = [];
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) data.push(...at(x, y), 255);
    }
    return data;
  };

  it('둘레에서 가장 많은 색을 돌려준다', () => {
    const data = pixels(4, 4, (x) => (x === 0 ? [0, 0, 0] : [255, 255, 255]));
    expect(mostCommonEdgeColor(data, 4, 4)).toBe('#ffffff');
  });

  it('안쪽 색은 세지 않는다', () => {
    const data = pixels(5, 5, (x, y) =>
      x > 0 && x < 4 && y > 0 && y < 4 ? [255, 0, 0] : [16, 32, 48],
    );
    expect(mostCommonEdgeColor(data, 5, 5)).toBe('#102030');
  });
});
