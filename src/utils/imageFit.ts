import type { ImageFitDto } from '@/api/dto';

import { type CropRect, isValidCrop } from './cropBox';

/** 목록 칸 비율과, 칸에 꽉 채웠을 때 이만큼 넘게 잘리면 처음부터 전체 보이기로 하는 기준 */
export type ImageFitRule = { ratio: number; threshold: number };

export const ARTWORK_FIT_RULE: ImageFitRule = { ratio: 3 / 4, threshold: 0.3 };
export const POSTER_FIT_RULE: ImageFitRule = { ratio: 402 / 568, threshold: 0.15 };

/** 비율 ratio 인 칸에 꽉 채웠을 때 잘려 나가는 양(0~1) */
export function cropLoss(width: number, height: number, ratio: number) {
  const imageRatio = width / height;
  return 1 - Math.min(imageRatio, ratio) / Math.max(imageRatio, ratio);
}

export function autoImageFit(width: number, height: number, rule: ImageFitRule): ImageFitDto {
  return cropLoss(width, height, rule.ratio) > rule.threshold ? 'FIT' : 'FILL';
}

export const isImageFit = (value: unknown): value is ImageFitDto =>
  value === 'FILL' || value === 'FIT';

/**
 * 저장된 방식을 먼저 쓰고, 없으면 사진 비율로 자동 결과를 낸다. 크기를 아직 모르면 null.
 * 보이는 방식이 생기기 전에 보이는 부분을 고른 사진은 꽉 채우기로 보던 모습을 지킨다
 */
export function resolveImageFit(
  {
    fit,
    crop,
    width,
    height,
  }: { fit?: unknown; crop?: CropRect | null; width?: number; height?: number },
  rule: ImageFitRule,
): ImageFitDto | null {
  if (isImageFit(fit)) return fit;
  if (isValidCrop(crop)) return 'FILL';
  if (!width || !height) return null;
  return autoImageFit(width, height, rule);
}

/** 서버 값이 #rrggbb 일 때만 쓴다 */
export const toEdgeColor = (value: unknown): string | null =>
  typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : null;

/**
 * 둘레 픽셀에서 가장 많이 나오는 색. 채널마다 위 4비트로 묶어 가장 큰 묶음의 평균을 #rrggbb 로 낸다
 * (프로토타입 posters.js edgeInfo 와 같은 계산)
 */
export function dominantEdgeColor(data: ArrayLike<number>, width: number, height: number) {
  const bins = new Map<number, [number, number, number, number]>();
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
  const [count, r, g, b] = best ?? [1, 0, 0, 0];

  return `#${[r, g, b]
    .map((sum) =>
      Math.round(sum / count)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

const EDGE_SAMPLE_PX = 64;

/** 이미지를 긴 변 64px 로 줄여 가장자리 색을 잰다. 다른 출처라 캔버스를 읽을 수 없으면 null */
function readEdgeColor(image: HTMLImageElement): string | null {
  const scale = EDGE_SAMPLE_PX / Math.max(image.naturalWidth, image.naturalHeight);
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;

  try {
    context.drawImage(image, 0, 0, width, height);
    return dominantEdgeColor(context.getImageData(0, 0, width, height).data, width, height);
  } catch {
    return null;
  }
}

export type LocalImageInfo = { width: number; height: number; edgeColor: string | null };

/** 올리기 전 로컬 사진(blob 주소)의 크기와 가장자리 색. 읽지 못하면 null */
export function readLocalImageInfo(src: string): Promise<LocalImageInfo | null> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () =>
      resolve(
        image.naturalWidth > 0
          ? {
              width: image.naturalWidth,
              height: image.naturalHeight,
              edgeColor: readEdgeColor(image),
            }
          : null,
      );
    image.onerror = () => resolve(null);
    image.src = src;
  });
}
