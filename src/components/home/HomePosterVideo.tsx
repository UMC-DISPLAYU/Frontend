import { useEffect, useRef, useState } from 'react';

import { cn } from '@/utils/cn';

/* 넘기는 도중에 영상을 내려받고 디코딩하면 끊겨 보여서, 넘기기가 멈춘 뒤 시작한다 */
const START_DELAY_MS = 500;

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * 프로토타입 home.html 영상 포스터: 가운데(활성) 칸일 때만 소리 없이 반복 재생하고, 다른 칸은 썸네일만 보인다.
 * 동작 줄이기 설정이거나 재생하지 못하면 썸네일 그대로 둔다
 */
export function HomePosterVideo({ src, isActive }: { src: string; isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(() => !document.hidden);

  useEffect(() => {
    const sync = () => setIsPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);

  const wantsPlay = isActive && isPageVisible && !prefersReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!wantsPlay) {
      video.pause();
      return;
    }

    const timer = window.setTimeout(() => {
      // 가운데 칸이 되기 전에는 내려받지 않는다
      if (video.getAttribute('src') !== src) video.src = src;
      video.play().catch(() => {});
    }, START_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [src, wantsPlay]);

  return (
    <video
      ref={videoRef}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => setIsPlaying(true)}
      onPause={() => setIsPlaying(false)}
      onError={() => setIsPlaying(false)}
      className={cn(
        'pointer-events-none absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-500 ease-standard',
        isPlaying && 'opacity-100',
      )}
    />
  );
}
