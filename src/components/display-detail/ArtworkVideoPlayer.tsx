import { useState } from 'react';

import { Overlay } from '@/components/ui';

interface ArtworkVideoPlayerProps {
  open: boolean;
  src: string;
  thumbnailSrc: string;
  title: string;
  onClose: () => void;
}

/** 프로토타입 exhibition.html dialog.player: 영상 작품은 상세로 가지 않고 이 창에서 재생한다 */
export function ArtworkVideoPlayer({
  open,
  src,
  thumbnailSrc,
  title,
  onClose,
}: ArtworkVideoPlayerProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <Overlay
      open={open}
      onClose={onClose}
      presentation="modal"
      title={<span className="sr-only">{`${title} 영상`}</span>}
      className="relative max-w-240 overflow-hidden rounded-16 bg-[#000] pb-0 text-base-white"
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute top-3 right-3 z-2 grid size-10 place-items-center rounded-circle bg-primary-white text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-inverse"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          className="size-5"
        >
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      </button>
      {hasError ? (
        <p className="typography-body-lg-medium px-5 py-16 text-center text-disable">
          영상 파일을 찾을 수 없어요
        </p>
      ) : (
        open && (
          <video
            src={src}
            poster={thumbnailSrc}
            controls
            autoPlay
            playsInline
            preload="metadata"
            onError={() => setHasError(true)}
            className="-mx-5 -mt-4 block max-h-[82vh] w-[calc(100%+2.5rem)] max-w-none bg-[#000]"
          />
        )
      )}
    </Overlay>
  );
}
