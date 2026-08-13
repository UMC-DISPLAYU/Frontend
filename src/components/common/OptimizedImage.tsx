import type { ImgHTMLAttributes } from 'react';

import { type ImageOptimizationFormat, optimizeImageUrl } from '@/utils/imageOptimization';

type OptimizedImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string | null;
  displayWidth: number;
  format?: ImageOptimizationFormat;
};

export function OptimizedImage({
  src,
  displayWidth,
  format = 'webp',
  loading = 'lazy',
  decoding = 'async',
  ...props
}: OptimizedImageProps) {
  if (!src) return null;

  return (
    <img
      src={optimizeImageUrl(src, displayWidth, format)}
      loading={loading}
      decoding={decoding}
      {...props}
    />
  );
}
