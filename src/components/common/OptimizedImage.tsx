import { type ImgHTMLAttributes, type SyntheticEvent, useState } from 'react';

import { cn } from '@/utils/cn';
import { type ImageOptimizationFormat, optimizeImageUrl } from '@/utils/imageOptimization';

type OptimizedImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string | null;
  displayWidth: number;
  format?: ImageOptimizationFormat;
  /**
   * true 면 다 불러올 때까지 스켈레톤(shimmer)을 보여주고, 완료되면 fade-in 한다.
   * 이미지는 frame 을 꽉 채우므로 frameClassName 에 크기 · 비율 · 모서리를 꼭 준다(레이아웃 시프트 방지).
   */
  skeleton?: boolean;
  /** skeleton 일 때 이미지를 감싸는 틀의 클래스. 예: "aspect-3/4 w-full rounded-12" */
  frameClassName?: string;
};

type LoadStatus = 'loading' | 'loaded' | 'error';

interface LoadState {
  src: string;
  status: Exclude<LoadStatus, 'loading'>;
  /** 캐시에 있어 첫 렌더 때 이미 완료된 이미지. 깜빡이지 않게 fade-in 을 건너뛴다 */
  instant: boolean;
}

export function OptimizedImage({
  src,
  displayWidth,
  format = 'webp',
  loading = 'lazy',
  decoding = 'async',
  onError,
  onLoad,
  skeleton = false,
  frameClassName,
  className,
  ...props
}: OptimizedImageProps) {
  // src 별로 기록해 src 가 바뀌면 따로 초기화하지 않아도 다시 loading 이 된다
  const [loadState, setLoadState] = useState<LoadState | null>(null);

  if (!src) return null;

  const optimizedSrc = optimizeImageUrl(src, displayWidth, format);

  const handleError = (event: SyntheticEvent<HTMLImageElement, Event>) => {
    if (event.currentTarget.src !== src) {
      event.currentTarget.src = src;
    } else if (skeleton) {
      setLoadState({ src, status: 'error', instant: false });
    }

    onError?.(event);
  };

  if (!skeleton) {
    return (
      <img
        src={optimizedSrc}
        loading={loading}
        decoding={decoding}
        onError={handleError}
        onLoad={onLoad}
        className={className}
        {...props}
      />
    );
  }

  const status: LoadStatus = loadState?.src === src ? loadState.status : 'loading';
  const isInstant = loadState?.src === src && loadState.instant;

  return (
    <span
      className={cn(
        'relative block overflow-hidden',
        status === 'loading' && 'skeleton-shimmer',
        status === 'error' && 'bg-secondary',
        frameClassName,
      )}
    >
      <img
        ref={(node) => {
          if (status === 'loading' && node?.complete && node.naturalWidth > 0) {
            setLoadState({ src, status: 'loaded', instant: true });
          }
        }}
        src={optimizedSrc}
        loading={loading}
        decoding={decoding}
        onError={handleError}
        onLoad={(event) => {
          if (status === 'loading') setLoadState({ src, status: 'loaded', instant: false });
          onLoad?.(event);
        }}
        className={cn(
          'absolute inset-0 size-full object-cover',
          status === 'loading' && 'opacity-0',
          status === 'loaded' && !isInstant && 'animate-fade-in',
          className,
        )}
        {...props}
      />
    </span>
  );
}
