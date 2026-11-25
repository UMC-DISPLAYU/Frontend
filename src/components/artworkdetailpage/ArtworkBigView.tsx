import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { OptimizedImage } from '@/components/common/OptimizedImage';
import { useOverlayHistory } from '@/hooks/useOverlayHistory';
import { useScrollLock } from '@/hooks/useScrollLock';
import { toast } from '@/stores/toastStore';
import { cn } from '@/utils/cn';

import type { ArtworkPhotoCaption } from './artworkDetail.utils';
import { InlineVideo, VideoPlayButton } from './ArtworkVideo';

type Props = {
  open: boolean;
  /* 열 때 보고 있던 사진. 그 사진 윗선이 위 띠(96) 아래에 오게 연다 */
  startIndex: number;
  images: string[];
  /* images 와 같은 순서. 영상인 칸은 영상 주소(images 는 썸네일) */
  videoSrcs?: (string | undefined)[];
  title: string;
  /* 연작: 사진마다 속한 작품의 작품명. 위 띠 제목이 보고 있는 작품으로 바뀐다 */
  titles?: string[];
  /* 연작: 작품마다 마지막 사진 아래 캡션 */
  captions?: (ArtworkPhotoCaption | undefined)[];
  /* 작가 이름들. 제목 아래 작은 글자 */
  subtitle?: string;
  /* 닫을 때 마지막으로 보던 사진을 상세에 맞춘다 */
  onClose: (index: number) => void;
};

const TOP_BAND = 96;
const READING_LINE = 0.4;
const BIG_IMAGE_WIDTH = 2048;

/* 창 높이 40% 선을 넘은 마지막 사진 */
function readPhotoIndex(scroller: HTMLElement | null, feed: HTMLElement | null) {
  if (!scroller || !feed) return 0;
  const line = scroller.clientHeight * READING_LINE;
  let index = 0;
  Array.from(feed.children).forEach((photo, photoIndex) => {
    if (photo.getBoundingClientRect().top <= line) index = photoIndex;
  });
  return index;
}

/*
 * 900px 이상 작품 "크게 보기"(프로토타입 work.html U-159).
 * 검정 화면에 사진을 원래 비율로 폭 min(1200, 창 − 192) 끝까지 이어 붙인다.
 * 닫기: ✕ · Esc · 브라우저 뒤로가기 · 사진 바깥 누르기
 */
export function ArtworkBigView({
  open,
  startIndex,
  images,
  videoSrcs = [],
  title,
  titles,
  captions,
  subtitle,
  onClose,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(startIndex);
  const [isShown, setIsShown] = useState(false);
  /* 크게 보기 안에서 재생 중인 영상 칸. 닫으면 처음 상태로 돌아간다 */
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const frameRef = useRef(0);
  const readIndex = () => readPhotoIndex(scrollerRef.current, feedRef.current);

  const { requestClose } = useOverlayHistory(open, () => onClose(readIndex()));
  useScrollLock(open);

  useLayoutEffect(() => {
    if (!open) return;
    const scroller = scrollerRef.current;
    const target = feedRef.current?.children[startIndex];
    const place = () => {
      if (!scroller) return;
      scroller.scrollTop =
        startIndex > 0 && target
          ? target.getBoundingClientRect().top + scroller.scrollTop - TOP_BAND
          : 0;
      setCurrent(readPhotoIndex(scroller, feedRef.current));
    };
    // 닫으면 연 버튼으로 초점을 돌려준다
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    place();
    scroller?.focus({ preventScroll: true });
    // 앞 사진들이 다 불러와지면 비율이 잡혀 위치가 바뀌므로 한 번 더 맞춘다. 그새 직접 스크롤했으면 두지 않는다
    let hasUserScrolled = false;
    const markUserScroll = () => {
      hasUserScrolled = true;
    };
    const userScrollEvents = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;
    userScrollEvents.forEach((type) =>
      scroller?.addEventListener(type, markUserScroll, { passive: true }),
    );
    const before = Array.from(feedRef.current?.querySelectorAll('img') ?? []).slice(
      0,
      startIndex + 1,
    );
    let cancelled = false;
    void Promise.all(before.map((image) => image.decode().catch(() => undefined))).then(() => {
      if (!cancelled && !hasUserScrolled) place();
    });
    const frame = requestAnimationFrame(() => setIsShown(true));
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      userScrollEvents.forEach((type) => scroller?.removeEventListener(type, markUserScroll));
      setIsShown(false);
      setPlayingIndex(null);
      opener?.focus({ preventScroll: true });
    };
  }, [open, startIndex]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') requestClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, requestClose]);

  if (!open) return null;

  const handleScroll = () => {
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      setCurrent(readIndex());
    });
  };

  return createPortal(
    <div
      ref={scrollerRef}
      role="dialog"
      aria-modal="true"
      aria-label="크게 보기"
      tabIndex={-1}
      onScroll={handleScroll}
      onClick={(event) => {
        if (event.target === event.currentTarget || event.target === feedRef.current) {
          requestClose();
        }
      }}
      className={cn(
        'fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-[#0b0b0c] text-white [color-scheme:dark] [scrollbar-width:thin] focus:outline-none',
        'transition-opacity duration-fast ease-standard',
        isShown ? 'opacity-100' : 'opacity-0',
      )}
    >
      {/* 맨 끝 바탕색까지 한 줄이라 background-image(bg-[...])가 아닌 background 로 쓴다 */}
      <i
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 [background:radial-gradient(70%_45%_at_50%_0%,#3f3f46_0%,rgba(63,63,70,0)_100%),radial-gradient(28%_80%_at_0%_55%,#26262b_0%,rgba(38,38,43,0)_100%),radial-gradient(28%_80%_at_100%_55%,#26262b_0%,rgba(38,38,43,0)_100%),#0b0b0c]"
      />
      <div className="sticky top-0 z-2 -mb-8 flex h-24 items-start gap-4 bg-[linear-gradient(to_bottom,rgba(11,11,12,0.92)_0%,rgba(11,11,12,0.72)_45%,rgba(11,11,12,0)_100%)] pt-2.5 pr-5 pl-8">
        <div className="grid min-w-0 flex-1 gap-0.5 pt-0.5">
          <b className="truncate text-[16px] font-semibold tracking-[-0.03em]">
            {titles?.[current] ?? title}
          </b>
          {subtitle && (
            <span className="truncate text-[12px] font-medium tracking-[-0.03em] text-[#a1a1aa]">
              {subtitle}
            </span>
          )}
        </div>
        {images.length > 1 && (
          <span
            aria-hidden="true"
            className="min-w-10 shrink-0 pt-3.5 text-right text-[12px] font-medium tracking-[-0.03em] text-[#a1a1aa] tabular-nums"
          >
            {current + 1} / {images.length}
          </span>
        )}
        <button
          type="button"
          aria-label="닫기"
          onClick={requestClose}
          className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-circle text-white transition-[background-color,scale] duration-150 ease-out hover:bg-white/12 focus-visible:outline-2 focus-visible:outline-focus-inverse active:scale-96"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-6 fill-none stroke-current stroke-[1.7] [stroke-linecap:round] [stroke-linejoin:round]"
          >
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
      <div
        ref={feedRef}
        className="relative z-0 mx-auto grid w-[min(1200px,calc(100vw-192px))] pt-8 pb-24"
      >
        {images.map((src, index) => {
          const alt = `${titles?.[index] ?? title} ${index + 1}/${images.length}`;
          const videoSrc = videoSrcs[index];
          const caption = captions?.[index];
          const image = (
            <OptimizedImage
              key={`${src}-${index}`}
              src={src}
              displayWidth={BIG_IMAGE_WIDTH}
              alt={alt}
              loading={Math.abs(index - startIndex) > 1 ? 'lazy' : 'eager'}
              draggable={false}
              className="block h-auto w-full bg-[#27272a] select-none"
            />
          );
          // 연작은 작품마다 마지막 사진 아래 캡션을 단다. 사진 한 장과 캡션을 한 칸으로 감싸 사진 번호를 맞춘다
          const withCaption = (media: ReactNode) =>
            caption ? (
              <div key={`${src}-${index}`}>
                {media}
                <p className="typography-body-lg-medium pt-3 pb-10 text-zinc-400">
                  <b className="typography-body-lg-semibold text-base-white">{caption.title}</b>
                  {caption.spec && ` · ${caption.spec}`}
                </p>
              </div>
            ) : (
              media
            );
          if (!videoSrc) return withCaption(image);

          // 영상은 썸네일 위 ▶ 를 누르면 그 자리에서 재생한다(상세 뷰어와 같다)
          return withCaption(
            <div key={`${src}-${index}`} className="relative">
              {playingIndex === index ? (
                <InlineVideo
                  src={videoSrc}
                  poster={src}
                  label={`${alt} 영상`}
                  onError={() => {
                    setPlayingIndex(null);
                    toast('영상 파일을 찾을 수 없어요');
                  }}
                  className="block h-auto w-full bg-[#27272a]"
                />
              ) : (
                <>
                  {image}
                  <VideoPlayButton src={videoSrc} onPlay={() => setPlayingIndex(index)} />
                </>
              )}
            </div>,
          );
        })}
      </div>
      <i
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-1 h-16 bg-[linear-gradient(to_top,rgba(11,11,12,0.7),rgba(11,11,12,0))]"
      />
    </div>,
    document.body,
  );
}
