import type { CSSProperties } from 'react';

/** 사진 전체를 1로 본 보이는 부분(노출 범위 상자) */
export type CropRect = { x: number; y: number; w: number; h: number };

export type CropHandle = 'tl' | 'tr' | 'bl' | 'br';
type Point = { x: number; y: number };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** 사진 가운데를 비율에 맞춰 가장 크게 자른 상자. imageRatio 는 사진의 가로/세로다 */
export function fitCrop(imageRatio: number, cropRatio: number): CropRect {
  if (imageRatio >= cropRatio) {
    const w = cropRatio / imageRatio;
    return { x: (1 - w) / 2, y: 0, w, h: 1 };
  }

  const h = imageRatio / cropRatio;
  return { x: 0, y: (1 - h) / 2, w: 1, h };
}

export function moveCrop(crop: CropRect, dx: number, dy: number): CropRect {
  return {
    ...crop,
    x: clamp(crop.x + dx, 0, 1 - crop.w),
    y: clamp(crop.y + dy, 0, 1 - crop.h),
  };
}

/** 잡은 모서리의 반대쪽을 고정하고 비율을 유지한 채 크기를 바꾼다 */
export function resizeCrop(
  start: CropRect,
  handle: CropHandle,
  point: Point,
  imageRatio: number,
  cropRatio: number,
  minWidth: number,
): CropRect {
  const isRight = handle[1] === 'r';
  const isBottom = handle[0] === 'b';
  const anchorX = isRight ? start.x : start.x + start.w;
  const anchorY = isBottom ? start.y : start.y + start.h;
  const heightPerWidth = imageRatio / cropRatio;

  const maxWidth = Math.min(
    isRight ? 1 - anchorX : anchorX,
    (isBottom ? 1 - anchorY : anchorY) / heightPerWidth,
  );
  const requested = isRight ? point.x - anchorX : anchorX - point.x;
  const w = Math.min(Math.max(minWidth, requested), maxWidth);
  const h = w * heightPerWidth;

  return { x: isRight ? anchorX : anchorX - w, y: isBottom ? anchorY : anchorY - h, w, h };
}

/** 키보드 조작용. 가운데를 유지한 채 factor 배로 크기를 바꾼다 */
export function scaleCrop(
  crop: CropRect,
  factor: number,
  imageRatio: number,
  cropRatio: number,
  minWidth: number,
): CropRect {
  const heightPerWidth = imageRatio / cropRatio;
  const w = clamp(crop.w * factor, minWidth, Math.min(1, 1 / heightPerWidth));
  const h = w * heightPerWidth;

  return {
    x: clamp(crop.x + crop.w / 2 - w / 2, 0, 1 - w),
    y: clamp(crop.y + crop.h / 2 - h / 2, 0, 1 - h),
    w,
    h,
  };
}

export function isSameCrop(a: CropRect, b: CropRect) {
  return (
    Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.w - b.w) + Math.abs(a.h - b.h) < 0.002
  );
}

export function isValidCrop(crop: CropRect | null | undefined): crop is CropRect {
  if (!crop) return false;
  const values = [crop.x, crop.y, crop.w, crop.h];

  return (
    values.every(Number.isFinite) &&
    crop.w > 0 &&
    crop.h > 0 &&
    crop.x >= 0 &&
    crop.y >= 0 &&
    crop.x + crop.w <= 1 + 1e-6 &&
    crop.y + crop.h <= 1 + 1e-6
  );
}

/** position: relative · overflow: hidden 인 칸을 상자 부분만으로 채우는 이미지 스타일 */
export function cropImageStyle(crop: CropRect): CSSProperties {
  return {
    position: 'absolute',
    maxWidth: 'none',
    width: `${100 / crop.w}%`,
    height: `${100 / crop.h}%`,
    left: `${(-crop.x / crop.w) * 100}%`,
    top: `${(-crop.y / crop.h) * 100}%`,
  };
}

/** 칸을 채우는 카드 이미지에 서버가 준 영역을 적용한다. 영역이 없거나 올바르지 않으면 사진 가운데(object-cover)를 그대로 쓴다 */
export function savedCropImageStyle(crop: CropRect | null | undefined): CSSProperties | undefined {
  if (!isValidCrop(crop)) return undefined;

  // 카드 hover 확대가 보이는 영역 가운데를 기준으로 커지게 한다
  return {
    ...cropImageStyle(crop),
    transformOrigin: `${(crop.x + crop.w / 2) * 100}% ${(crop.y + crop.h / 2) * 100}%`,
  };
}

/** 영역만큼 확대해 보이므로 요청할 이미지 폭도 그만큼 늘린다 */
export function croppedDisplayWidth(displayWidth: number, crop: CropRect | null | undefined) {
  return isValidCrop(crop) ? Math.round(displayWidth / crop.w) : displayWidth;
}
