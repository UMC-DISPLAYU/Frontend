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
  onError,
  ...props
}: OptimizedImageProps) {
  if (!src) return null;

  const optimizedSrc = optimizeImageUrl(src, displayWidth, format);

  return (
    <img
      src={optimizedSrc}
      loading={loading}
      decoding={decoding}
      onError={(event) => {
        if (event.currentTarget.src !== src) {
          event.currentTarget.src = src;
        }

        onError?.(event);
      }}
      {...props}
    />
  );
}
