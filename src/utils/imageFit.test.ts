import { describe, expect, it } from 'vitest';

import {
  ARTWORK_FIT_RULE,
  autoImageFit,
  cropLoss,
  dominantEdgeColor,
  POSTER_FIT_RULE,
  resolveImageFit,
  toEdgeColor,
} from './imageFit';

describe('cropLoss', () => {
  it('칸과 비율이 같으면 잘리지 않는다', () => {
    expect(cropLoss(300, 400, 3 / 4)).toBeCloseTo(0);
  });

  it('넓은 사진과 좁은 사진 모두 1 - 작은 비율 / 큰 비율 이다', () => {
    expect(cropLoss(400, 300, 3 / 4)).toBeCloseTo(1 - 0.75 / (4 / 3));
    expect(cropLoss(100, 400, 3 / 4)).toBeCloseTo(1 - 0.25 / 0.75);
  });
});

describe('autoImageFit 경계값', () => {
  // 잘리는 양이 loss 가 되는 넓은 사진(r = R / (1 - loss))과 좁은 사진(r = R × (1 - loss))
  const wide = (ratio: number, loss: number) => ratio / (1 - loss);
  const narrow = (ratio: number, loss: number) => ratio * (1 - loss);

  it('작품: 30% 이하로 잘리면 꽉 채우기, 넘으면 전체 보이기', () => {
    const R = 3 / 4;
    expect(autoImageFit(wide(R, 0.2999), 1, ARTWORK_FIT_RULE)).toBe('FILL');
    expect(autoImageFit(wide(R, 0.3001), 1, ARTWORK_FIT_RULE)).toBe('FIT');
    expect(autoImageFit(narrow(R, 0.2999), 1, ARTWORK_FIT_RULE)).toBe('FILL');
    expect(autoImageFit(narrow(R, 0.3001), 1, ARTWORK_FIT_RULE)).toBe('FIT');
  });

  it('작품: 정사각(25%)은 꽉 채우기, 4:3 가로(43.75%)는 전체 보이기', () => {
    expect(autoImageFit(1000, 1000, ARTWORK_FIT_RULE)).toBe('FILL');
    expect(autoImageFit(1600, 1200, ARTWORK_FIT_RULE)).toBe('FIT');
  });

  it('포스터: 15% 이하로 잘리면 꽉 채우기, 넘으면 전체 보이기', () => {
    const R = 402 / 568;
    expect(autoImageFit(wide(R, 0.1499), 1, POSTER_FIT_RULE)).toBe('FILL');
    expect(autoImageFit(wide(R, 0.1501), 1, POSTER_FIT_RULE)).toBe('FIT');
    expect(autoImageFit(narrow(R, 0.1499), 1, POSTER_FIT_RULE)).toBe('FILL');
    expect(autoImageFit(narrow(R, 0.1501), 1, POSTER_FIT_RULE)).toBe('FIT');
  });

  it('포스터: A 규격 · 3:4(5.6%)는 꽉 채우기, 정사각 흰 여백 파일은 전체 보이기', () => {
    expect(autoImageFit(2480, 3508, POSTER_FIT_RULE)).toBe('FILL');
    expect(autoImageFit(1500, 2000, POSTER_FIT_RULE)).toBe('FILL');
    expect(autoImageFit(1250, 1250, POSTER_FIT_RULE)).toBe('FIT');
  });
});

describe('resolveImageFit', () => {
  const size = { width: 1600, height: 1200 };

  it('저장된 방식이 있으면 그대로 쓴다', () => {
    expect(resolveImageFit({ ...size, fit: 'FILL' }, ARTWORK_FIT_RULE)).toBe('FILL');
  });

  it('방식 없이 고른 영역만 있는 예전 데이터는 꽉 채우기', () => {
    expect(
      resolveImageFit({ ...size, crop: { x: 0.25, y: 0, w: 0.5, h: 1 } }, ARTWORK_FIT_RULE),
    ).toBe('FILL');
  });

  it('둘 다 없으면 비율로 자동, 크기를 모르면 null', () => {
    expect(resolveImageFit({ ...size, fit: null, crop: null }, ARTWORK_FIT_RULE)).toBe('FIT');
    expect(resolveImageFit({ fit: 'UNKNOWN' }, ARTWORK_FIT_RULE)).toBeNull();
  });
});

describe('dominantEdgeColor', () => {
  const image = (width: number, height: number, pick: (x: number, y: number) => number[]) => {
    const data: number[] = [];
    for (let y = 0; y < height; y += 1)
      for (let x = 0; x < width; x += 1) data.push(...pick(x, y), 255);
    return data;
  };

  it('흰 틀 안에 포스터가 있으면 흰색', () => {
    const data = image(8, 8, (x, y) =>
      x > 1 && x < 6 && y > 0 && y < 7 ? [20, 40, 200] : [255, 255, 255],
    );
    expect(dominantEdgeColor(data, 8, 8)).toBe('#ffffff');
  });

  it('가장 많은 묶음의 평균을 낸다', () => {
    const data = image(4, 4, (x) => (x === 0 ? [16, 32, 48] : [18, 34, 50]));
    expect(dominantEdgeColor(data, 4, 4)).toBe('#112131');
  });
});

describe('toEdgeColor', () => {
  it('#rrggbb 만 받는다', () => {
    expect(toEdgeColor('#AABBCC')).toBe('#aabbcc');
    expect(toEdgeColor('red')).toBeNull();
    expect(toEdgeColor('#fff')).toBeNull();
    expect(toEdgeColor(null)).toBeNull();
  });
});
