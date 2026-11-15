import { useEffect, useRef, useState } from 'react';

import { formatVideoDuration, readVideoDuration } from '@/utils/videoFile';

export function PlayMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className}>
      <path d="M7 4.8v14.4L19 12z" fill="currentColor" />
    </svg>
  );
}

/**
 * 영상 칸 위 재생 버튼과 길이(전시 상세 영상 작품 카드와 같은 모양). 길이는 영상을 읽을 수 있을 때만 보인다.
 * 누르면 그 칸에서 바로 재생한다. 칸 위 버튼이라 사진을 눌러 크게 보기가 열리는 동작(handleStageClick)에서 빠진다
 */
export function VideoPlayButton({ src, onPlay }: { src: string; onPlay: () => void }) {
  const [duration, setDuration] = useState<number | null>(null);

  useEffect(() => {
    let isCancelled = false;
    void readVideoDuration(src).then((value) => {
      if (!isCancelled) setDuration(value);
    });
    return () => {
      isCancelled = true;
    };
  }, [src]);

  return (
    <>
      <button
        type="button"
        aria-label="영상 재생"
        onClick={onPlay}
        className="absolute top-1/2 left-1/2 z-10 grid size-14 -translate-1/2 cursor-pointer place-items-center rounded-circle bg-[rgba(0,0,0,0.55)] text-base-white backdrop-blur-[10px] transition-[scale,background-color] duration-base ease-standard hover:scale-108 hover:bg-[rgba(0,0,0,0.7)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        <PlayMark className="ml-0.5 size-6" />
      </button>
      {duration !== null && (
        <span className="typography-body-md-medium pointer-events-none absolute bottom-4 left-4 z-10 rounded-6 bg-[rgba(0,0,0,0.55)] px-1.75 py-0.5 text-base-white tabular-nums">
          {formatVideoDuration(duration)}
        </span>
      )}
    </>
  );
}

/** 칸 안에서 재생하는 영상. 넘기거나 스크롤해서 칸이 거의 안 보이면 멈춘다 */
export function InlineVideo({
  src,
  poster,
  label,
  className,
  onError,
}: {
  src: string;
  poster: string;
  label: string;
  className?: string;
  onError: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || entry.intersectionRatio < 0.3) video.pause();
      },
      { threshold: [0, 0.3] },
    );
    const pauseWhenHidden = () => {
      if (document.hidden) video.pause();
    };

    observer.observe(video);
    document.addEventListener('visibilitychange', pauseWhenHidden);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', pauseWhenHidden);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      controls
      autoPlay
      playsInline
      preload="auto"
      aria-label={label}
      onError={onError}
      className={className}
    />
  );
}
