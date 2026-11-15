import { type ReactNode, type RefObject, useEffect, useRef, useState } from 'react';

import { OptimizedImage } from '@/components/common/OptimizedImage';
import { cn } from '@/utils/cn';

const VIDEO_BUTTON_CLASS =
  'absolute bottom-7 z-2 grid size-10 cursor-pointer place-items-center rounded-circle bg-[rgba(0,0,0,0.45)] text-base-white backdrop-blur-[8px] transition-[background-color,transform] duration-fast ease-standard hover:bg-[rgba(0,0,0,0.65)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-94';

function VideoIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
    >
      {children}
    </svg>
  );
}

export function PlayMarkIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
      <path d="M7 4.8v14.4L19 12z" fill="currentColor" />
    </svg>
  );
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

interface PosterVideoSlideProps {
  src: string;
  thumbnailSrc: string;
  trackRef: RefObject<HTMLDivElement | null>;
}

/**
 * 프로토타입 exhibition.html 영상 포스터: 칸이 보이면 소리 없이 반복 재생하고 넘기면 멈춘다.
 * 동작 줄이기 설정이면 자동 재생하지 않고 썸네일과 재생 버튼만 둔다. 재생하지 못하면 썸네일을 보인다
 */
export function PosterVideoSlide({ src, thumbnailSrc, trackRef }: PosterVideoSlideProps) {
  const slideRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const slide = slideRef.current;
    const video = videoRef.current;
    if (!slide || !video || hasError) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && entry.intersectionRatio > 0.6) {
          if (!prefersReducedMotion()) video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { root: trackRef.current, threshold: [0, 0.6, 1] },
    );
    const pauseWhenHidden = () => {
      if (document.hidden) video.pause();
    };

    observer.observe(slide);
    document.addEventListener('visibilitychange', pauseWhenHidden);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', pauseWhenHidden);
    };
  }, [hasError, trackRef]);

  if (hasError) {
    return (
      <OptimizedImage
        src={thumbnailSrc}
        displayWidth={1080}
        alt="전시 포스터 영상 썸네일"
        draggable={false}
        className="size-full object-contain select-none"
      />
    );
  }

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };

  return (
    <div ref={slideRef} className="relative size-full">
      <video
        ref={videoRef}
        src={src}
        poster={thumbnailSrc}
        muted={isMuted}
        loop
        playsInline
        preload="metadata"
        aria-label="전시 포스터 영상"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setHasError(true)}
        className="size-full bg-secondary object-contain select-none"
      />
      <button
        type="button"
        aria-pressed={isPlaying}
        aria-label={isPlaying ? '영상 일시정지' : '영상 재생'}
        onClick={togglePlay}
        className={cn(VIDEO_BUTTON_CLASS, 'right-16')}
      >
        {isPlaying ? (
          <VideoIcon>
            <path d="M8 5.5v13M16 5.5v13" strokeWidth={2.4} />
          </VideoIcon>
        ) : (
          <PlayMarkIcon className="size-5" />
        )}
      </button>
      <button
        type="button"
        aria-pressed={!isMuted}
        aria-label={isMuted ? '소리 켜기' : '소리 끄기'}
        onClick={() => setIsMuted((prev) => !prev)}
        className={cn(VIDEO_BUTTON_CLASS, 'right-4')}
      >
        <VideoIcon>
          <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
          {isMuted ? (
            <path d="m16 9.5 5 5M21 9.5l-5 5" />
          ) : (
            <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
          )}
        </VideoIcon>
      </button>
    </div>
  );
}
