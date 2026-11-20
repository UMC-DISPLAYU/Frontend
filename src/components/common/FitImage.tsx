import { type ComponentProps, type CSSProperties, useState } from 'react';

import type { ImageFitDto } from '@/api/dto';
import { cn } from '@/utils/cn';
import { croppedDisplayWidth, type CropRect, savedCropImageStyle } from '@/utils/cropBox';
import { type ImageFitRule, resolveImageFit, toEdgeColor } from '@/utils/imageFit';

import { OptimizedImage } from './OptimizedImage';

type FitImageProps = ComponentProps<typeof OptimizedImage> & {
  crop?: CropRect | null;
  /** 저장된 보이는 방식. 없으면 사진 비율로 자동 결과를 쓴다 */
  fit?: ImageFitDto | null;
  rule: ImageFitRule;
  /** 전체 보이기의 남는 곳. 작품은 흰색, 포스터는 가장자리 색이 없을 때 쓰는 색 */
  fitClassName: string;
  /** 포스터 가장자리 색(#rrggbb). 있으면 fitClassName 대신 쓴다 */
  fitColor?: string | null;
  /** 상세 칸: 꽉 채우기여도 자르지 않는다(남는 곳은 칸 배경). 전체 보이기일 때만 남는 곳 색을 칠한다 */
  detail?: boolean;
};

/**
 * 대표 사진 · 포스터를 칸에 보이는 방식(꽉 채우기 | 전체 보이기)대로 그린다.
 * 이미지는 칸을 꽉 채우는 크기(className)로 받아야 한다. 남는 곳 색은 이미지 배경으로 칠해
 * 칸 위에 덮이는 배지 · 그라데이션 · 순위 숫자는 지금처럼 위에 남는다
 */
export function FitImage({
  src,
  displayWidth,
  crop,
  fit,
  rule,
  fitClassName,
  fitColor,
  detail = false,
  className,
  style,
  onLoad,
  ...props
}: FitImageProps) {
  const [measured, setMeasured] = useState<{ src: string; width: number; height: number }>();
  const size = measured && measured.src === src ? measured : undefined;
  const mode = resolveImageFit({ fit, crop, width: size?.width, height: size?.height }, rule);
  const isFit = mode === 'FIT';
  const edgeColor = isFit ? toEdgeColor(fitColor) : null;

  let fitStyle: CSSProperties | undefined;
  if (isFit) fitStyle = { objectFit: 'contain', backgroundColor: edgeColor ?? undefined };
  else if (!detail && mode === 'FILL') fitStyle = savedCropImageStyle(crop);
  // 크기를 재기 전에는 꽉 채운 모습이 잠깐 보였다가 바뀌지 않게 숨긴다(상세는 어느 쪽이든 전체라 그대로 둔다)
  else if (!detail && mode === null) fitStyle = { visibility: 'hidden' };

  return (
    <OptimizedImage
      src={src}
      // 전체 보이기면 자르지 않으니 원래 폭이면 된다. 자동 결과로 주소가 바뀌어 다시 받지 않게 저장값으로만 정한다
      displayWidth={
        detail || fit === 'FIT' ? displayWidth : croppedDisplayWidth(displayWidth, crop)
      }
      className={cn(className, isFit && !edgeColor && fitClassName)}
      style={{ ...style, ...fitStyle }}
      onLoad={(event) => {
        const { naturalWidth: width, naturalHeight: height } = event.currentTarget;
        if (src && width > 0) setMeasured({ src, width, height });
        onLoad?.(event);
      }}
      {...props}
    />
  );
}
