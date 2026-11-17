import type { PosterCropRect } from '@/contexts/exhibitionRegisterDraftState';
import { isSameCrop, isValidCrop } from '@/utils/cropBox';

import { POSTER_CARD_RATIO } from './displayRegister.constants';

/** 꽉 채우기: 상자로 고른 부분만 칸에 채운다 / 전체 보이기: 포스터 전체를 칸 안에 넣는다 */
export type PosterFitMode = 'fill' | 'fit';

/** 전체 보이기는 서버에 포스터 전체 범위로 보낸다 */
export const POSTER_WHOLE_CROP: PosterCropRect = { x: 0, y: 0, w: 1, h: 1 };

/** 프로토타입 D안: 꽉 채우면 15%를 넘게 잘리는 포스터는 처음에 전체 보이기 */
const FIT_CUT_THRESHOLD = 0.15;

/** 전체 보이기에서 가장자리 색을 읽지 못했을 때 남는 곳 색(상세 포스터 칸과 같은 연한 회색) */
export const POSTER_FALLBACK_EDGE_COLOR = '#f4f4f5';

export const isWholePosterCrop = (crop: PosterCropRect | null | undefined) =>
  isValidCrop(crop) && isSameCrop(crop, POSTER_WHOLE_CROP);

/** 포스터 카드 칸에 꽉 채웠을 때 잘려 나가는 비율(0~1) */
export function posterCutRatio(imageRatio: number) {
  if (!(imageRatio > 0)) return 0;
  return 1 - Math.min(imageRatio, POSTER_CARD_RATIO) / Math.max(imageRatio, POSTER_CARD_RATIO);
}

export const defaultPosterFitMode = (imageRatio: number): PosterFitMode =>
  posterCutRatio(imageRatio) > FIT_CUT_THRESHOLD ? 'fit' : 'fill';

/** 올릴 때의 기본 범위. 전체 보이기면 전체 범위, 꽉 채우기(가운데)면 null */
export const defaultPosterCrop = (imageRatio: number): PosterCropRect | null =>
  defaultPosterFitMode(imageRatio) === 'fit' ? POSTER_WHOLE_CROP : null;

/** 포스터 둘레에서 가장 많이 나오는 색(비슷한 색은 한 칸으로 묶는다). 읽지 못하면 null */
export function readEdgeColor(image: HTMLImageElement, sampleSize = 64): string | null {
  const { naturalWidth, naturalHeight } = image;
  if (!naturalWidth || !naturalHeight) return null;

  const scale = sampleSize / Math.max(naturalWidth, naturalHeight);
  const width = Math.max(1, Math.round(naturalWidth * scale));
  const height = Math.max(1, Math.round(naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;

  try {
    context.drawImage(image, 0, 0, width, height);
    const { data } = context.getImageData(0, 0, width, height);
    return mostCommonEdgeColor(data, width, height);
  } catch {
    // 다른 출처 이미지라 픽셀을 읽을 수 없으면(CORS) 기본 색을 쓴다
    return null;
  }
}

/** 주소로 포스터를 따로 불러와 가장자리 색을 읽는다. 화면에 보이는 이미지와 달리 CORS 로 불러와야 픽셀을 읽을 수 있다 */
export function loadEdgeColor(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const image = new window.Image();

    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(readEdgeColor(image));
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

export function mostCommonEdgeColor(data: ArrayLike<number>, width: number, height: number) {
  const bins = new Map<number, [count: number, r: number, g: number, b: number]>();

  const add = (x: number, y: number) => {
    const i = (y * width + x) * 4;
    const key = ((data[i] >> 4) << 8) | ((data[i + 1] >> 4) << 4) | (data[i + 2] >> 4);
    const bin = bins.get(key) ?? [0, 0, 0, 0];
    bin[0] += 1;
    bin[1] += data[i];
    bin[2] += data[i + 1];
    bin[3] += data[i + 2];
    bins.set(key, bin);
  };

  for (let x = 0; x < width; x += 1) {
    add(x, 0);
    add(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    add(0, y);
    add(width - 1, y);
  }

  let best: [number, number, number, number] | null = null;
  for (const bin of bins.values()) {
    if (!best || bin[0] > best[0]) best = bin;
  }
  if (!best) return null;

  const [count, r, g, b] = best;
  return `#${[r, g, b]
    .map((sum) =>
      Math.round(sum / count)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}
