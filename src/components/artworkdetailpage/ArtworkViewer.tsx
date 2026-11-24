import {
  type KeyboardEvent,
  type MouseEvent,
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { OptimizedImage } from '@/components/common/OptimizedImage';
import { toast } from '@/stores/toastStore';
import { cn } from '@/utils/cn';

import { ArtworkBigView } from './ArtworkBigView';
import { getStackPhotoIndex, STACK_READING_LINE } from './artworkDetail.utils';
import { InlineVideo, PlayMark, VideoPlayButton } from './ArtworkVideo';
import type { ViewerChrome } from './useViewerChromeFade';
import type { ViewMode } from './useViewMode';

type Props = {
  images: string[];
  /* images 와 같은 순서. 영상인 칸은 영상 주소(images 는 썸네일) */
  videoSrcs?: (string | undefined)[];
  title: string;
  /* 크게 보기 위 띠의 작가 이름 */
  subtitle?: string;
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  stageRef: RefObject<HTMLDivElement>;
  chrome: ViewerChrome;
};

const STAGE_IMAGE_WIDTH = 1080;
const THUMB_IMAGE_WIDTH = 96;
// 프로토타입 .vmode: 사진 위 16 + 2
const SWITCH_TOP = 'top-[calc(max(16px,env(safe-area-inset-top))+2px)]';
// 이어서 보기에서 썸네일로 옮길 때 사진 윗변이 놓이는 자리. 현재 장 계산의 기준선으로도 읽는다.
// 900px 이상은 사진 열이 따로 스크롤되므로 열의 위 여백(32)에 맞춘다
const STACK_SCROLL_MARGIN = 'scroll-mt-(--detail-top) desktop:scroll-mt-8';
/*
 * 900px 이상(프로토타입 U-157): 사진 칸 높이 H = 창 − 머리 − 위 32 − 아래 32 − 넘김 줄 44,
 * 폭 W = min(H × 3/4, 615, 남는 폭). 512 = 사이 72 + 정보 최소 380 + 썸네일 60, 64 = 좌우 여백 32 × 2
 */
const WIDE_SIZE_VARS =
  'desktop:[--H:calc(100dvh-var(--detail-top)-108px)] desktop:[--W:min(calc(var(--H)*0.75),615px,calc(min(100vw,1240px)-576px))]';
// 사용자가 직접 스크롤하기 시작했다는 신호. 썸네일로 고른 장을 이때까지 유지한다
const USER_SCROLL_EVENTS = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;

// 프로토타입 fade.js: 나타날 때 0.15s, 흐려지거나 숨을 때 0.4s(ease-out)
const FADE_TRANSITION = 'transition-opacity duration-150 ease-out';
const FADE_DIMMED = 'opacity-55 duration-400';
const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isWide = () => window.matchMedia('(min-width: 900px)').matches;

const VIEW_ICON_CLASS =
  'size-4.5 fill-none stroke-current stroke-[2] [stroke-linecap:round] [stroke-linejoin:round]';
const VIEW_BUTTON_CLASS =
  'grid h-8 w-9 cursor-pointer place-items-center rounded-circle text-[#d4d4d8] transition-[background-color,color,scale] duration-fast ease-standard hover:text-white active:scale-94 aria-pressed:bg-[#18181b] aria-pressed:text-[#fafafa]';
const scrollBehavior = (): ScrollBehavior => (prefersReducedMotion() ? 'auto' : 'smooth');

function StackImage({ src, alt, eager }: { src: string; alt: string; eager: boolean }) {
  // 이미지가 뜨기 전에도 자리를 잡아 두어 장 사이 이동 위치가 틀어지지 않게 한다
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <OptimizedImage
      src={src}
      displayWidth={STAGE_IMAGE_WIDTH}
      alt={alt}
      draggable={false}
      loading={eager ? 'eager' : 'lazy'}
      onLoad={() => setIsLoaded(true)}
      className={cn(
        'block w-full bg-secondary select-none',
        STACK_SCROLL_MARGIN,
        isLoaded ? 'h-auto' : 'aspect-4/5',
      )}
    />
  );
}

export function ArtworkViewer({
  images,
  videoSrcs = [],
  title,
  subtitle,
  mode,
  onModeChange,
  stageRef,
  chrome,
}: Props) {
  const photoCount = images.length;
  const hasMultiple = photoCount > 1;
  const isStack = mode === 'stack';

  const [current, setCurrent] = useState(0);
  const [bigStart, setBigStart] = useState<number | null>(null);
  /* 칸 안에서 재생 중인 영상 칸 */
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  // 크게 보기가 뒤 칸의 영상을 가리므로, 열 때 칸 안 재생을 멈춘다
  const openBig = (index: number) => {
    setPlayingIndex(null);
    setBigStart(index);
  };

  const handleVideoError = () => {
    setPlayingIndex(null);
    toast('영상 파일을 찾을 수 없어요');
  };
  const paneRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const shouldAlignAfterModeChange = useRef(false);
  const currentRef = useRef(current);
  // 썸네일 · 보기 방식 전환으로 옮긴 장. 페이지 끝이라 사진이 위까지 못 올라와도 고른 장을 유지한다
  const isStackPinnedRef = useRef(false);

  const { isControlsDimmed, isChipHidden, peekChip, holdProps } = chrome;

  const showPhoto = (index: number) => {
    if (index !== currentRef.current) peekChip();
    currentRef.current = index;
    setCurrent(index);
  };

  const scrollToStackImage = (index: number, behavior: ScrollBehavior) => {
    const element = stackRef.current?.children[index];
    if (!element) return;
    isStackPinnedRef.current = true;
    element.scrollIntoView({ behavior, block: 'start' });
  };

  const goTo = (index: number) => {
    const next = Math.max(0, Math.min(photoCount - 1, index));
    const track = trackRef.current;
    if (track) track.scrollTo({ left: next * track.clientWidth, behavior: scrollBehavior() });
    showPhoto(next);
  };

  const selectThumb = (index: number) => {
    if (!isStack) {
      goTo(index);
      return;
    }
    showPhoto(index);
    scrollToStackImage(index, scrollBehavior());
  };

  const changeMode = (next: ViewMode) => {
    if (next === mode) return;
    setPlayingIndex(null);
    shouldAlignAfterModeChange.current = true;
    onModeChange(next);
  };

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (track) track.scrollLeft = currentRef.current * track.clientWidth;

    if (!shouldAlignAfterModeChange.current) return;
    shouldAlignAfterModeChange.current = false;

    // 한 장씩 보기는 페이지(900px 이상은 사진 열) 맨 위의 사진에서 이어 보고, 이어서 보기는 보던 장으로 내려간다
    if (isStack) scrollToStackImage(currentRef.current, scrollBehavior());
    else if (isWide() && paneRef.current) paneRef.current.scrollTop = 0;
    else window.scrollTo({ top: 0, behavior: 'auto' });
  }, [isStack]);

  useEffect(() => {
    const realign = () => {
      const track = trackRef.current;
      if (track) track.scrollTo({ left: currentRef.current * track.clientWidth, behavior: 'auto' });
    };
    window.addEventListener('resize', realign);
    return () => window.removeEventListener('resize', realign);
  }, []);

  useEffect(() => {
    if (!isStack) return;

    let frame = 0;
    const unpin = () => {
      isStackPinnedRef.current = false;
    };
    const onScroll = () => {
      if (isStackPinnedRef.current || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const stack = stackRef.current;
        if (!stack?.firstElementChild) return;
        // 900px 이상은 사진 열 안에서 스크롤하므로 열의 위치 · 높이를 기준으로 읽는다
        const pane = isWide() ? paneRef.current : null;
        const paneTop = pane?.getBoundingClientRect().top ?? 0;
        const viewHeight = pane?.clientHeight ?? window.innerHeight;
        const anchor =
          paneTop + (parseFloat(getComputedStyle(stack.firstElementChild).scrollMarginTop) || 0);
        const tops = Array.from(stack.children, (element) => element.getBoundingClientRect().top);
        const index = getStackPhotoIndex(tops, anchor, paneTop + viewHeight * STACK_READING_LINE);
        if (index !== currentRef.current) {
          currentRef.current = index;
          setCurrent(index);
        }
      });
    };

    const pane = paneRef.current;
    window.addEventListener('scroll', onScroll, { passive: true });
    pane?.addEventListener('scroll', onScroll, { passive: true });
    USER_SCROLL_EVENTS.forEach((type) => window.addEventListener(type, unpin, { passive: true }));
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      pane?.removeEventListener('scroll', onScroll);
      USER_SCROLL_EVENTS.forEach((type) => window.removeEventListener(type, unpin));
    };
  }, [isStack]);

  const handleTrackScroll = () => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    if (index !== currentRef.current && index >= 0 && index < photoCount) showPhoto(index);
  };

  const handleTrackKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(current + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(current - 1);
    }
  };

  const altOf = (index: number) => `${title} ${index + 1}/${photoCount}`;

  // 크게 보기를 닫으면 마지막으로 보던 사진으로 상세를 맞춘다
  const closeBig = (index: number) => {
    setBigStart(null);
    if (isStack) {
      showPhoto(index);
      scrollToStackImage(index, 'auto');
    } else {
      goTo(index);
    }
  };

  // 900px 이상: 사진을 누르면 크게 보기(돋보기 커서). 버튼 · 링크 · 감상 방식 묶음(버튼 사이 여백 포함)을 누른 것은 빼고
  const handleStageClick = (event: MouseEvent<HTMLDivElement>) => {
    if (
      !isWide() ||
      (event.target as HTMLElement).closest(
        'button, a, video, [role="group"][aria-label="감상 방식"]',
      )
    )
      return;
    const image = (event.target as HTMLElement).closest('img');
    // 영상 칸은 사진을 한 겹 감싸 두므로 감싼 칸 기준으로 순서를 찾는다
    const stackIndex = image
      ? Array.from(stackRef.current?.children ?? []).findIndex((child) => child.contains(image))
      : -1;
    openBig(isStack && stackIndex >= 0 ? stackIndex : currentRef.current);
  };

  return (
    <section
      ref={paneRef}
      aria-label="작품 이미지"
      className={cn(
        'relative desktop:flex desktop:h-full desktop:items-start desktop:gap-3 desktop:overflow-y-auto desktop:overscroll-contain desktop:pt-8 desktop:[scrollbar-width:none] desktop:[&::-webkit-scrollbar]:hidden',
        WIDE_SIZE_VARS,
        isStack ? 'desktop:pb-16' : 'desktop:pb-8',
      )}
    >
      {hasMultiple && (
        <div
          role="list"
          aria-label="이미지 목록"
          className="hidden max-h-(--H) shrink-0 flex-col gap-1.5 overflow-y-auto [scrollbar-width:none] desktop:sticky desktop:top-0 desktop:flex [&::-webkit-scrollbar]:hidden"
        >
          {images.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              aria-label={`${index + 1}번째 ${videoSrcs[index] ? '영상' : '이미지'} 보기`}
              aria-current={index === current}
              onClick={() => selectThumb(index)}
              className={cn(
                'relative h-16 w-12 shrink-0 cursor-pointer overflow-hidden border-2 transition-opacity duration-fast ease-standard',
                index === current
                  ? 'border-interactive-selected opacity-100'
                  : 'border-transparent opacity-55 hover:opacity-100',
              )}
            >
              <OptimizedImage
                src={src}
                displayWidth={THUMB_IMAGE_WIDTH}
                alt=""
                className="size-full object-cover"
              />
              {videoSrcs[index] && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-0.5 left-0.5 grid size-4 place-items-center rounded-circle bg-[rgba(0,0,0,0.6)] text-base-white"
                >
                  <PlayMark className="size-2" />
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="relative min-w-0 desktop:w-(--W) desktop:flex-none">
        <div
          ref={stageRef}
          onClick={handleStageClick}
          className={cn(
            'relative min-w-0 desktop:cursor-zoom-in',
            !isStack &&
              'aspect-402/554 overflow-hidden bg-secondary min-[600px]:max-desktop:aspect-auto min-[600px]:max-desktop:h-[78vh] desktop:aspect-3/4 desktop:w-full',
          )}
        >
          <div
            className={cn(
              'pointer-events-none z-20',
              isStack ? 'sticky top-(--detail-top) h-0 w-full desktop:top-0' : 'absolute inset-0',
            )}
          >
            {/* 사진이 1장이어도 보기 방식을 고를 수 있게 둔다(사용자 결정, 프로토타입은 2장부터) */}
            <div
              role="group"
              aria-label="감상 방식"
              {...holdProps}
              className={cn(
                'pointer-events-auto absolute right-5 flex gap-0.5 rounded-circle bg-black/45 p-1 backdrop-blur-[20px] desktop:cursor-default',
                FADE_TRANSITION,
                SWITCH_TOP,
                isControlsDimmed && FADE_DIMMED,
              )}
            >
              <button
                type="button"
                aria-label="한 장씩 보기"
                title="한 장씩 보기"
                aria-pressed={!isStack}
                onClick={() => changeMode('one')}
                className={VIEW_BUTTON_CLASS}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className={VIEW_ICON_CLASS}>
                  <rect x="6.5" y="3.5" width="11" height="17" rx="2" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="이어서 보기"
                title="이어서 보기"
                aria-pressed={isStack}
                onClick={() => changeMode('stack')}
                className={VIEW_BUTTON_CLASS}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className={VIEW_ICON_CLASS}>
                  <rect x="6.5" y="3.5" width="11" height="17" rx="2" />
                  <path d="M6.5 9.2h11M6.5 14.8h11" />
                </svg>
              </button>
              {/* 크게 보기는 900px 이상에서만(프로토타입 U-159) */}
              <button
                type="button"
                aria-label="크게 보기"
                title="크게 보기"
                aria-pressed={false}
                onClick={() => openBig(currentRef.current)}
                className={cn(VIEW_BUTTON_CLASS, 'hidden desktop:grid')}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className={VIEW_ICON_CLASS}>
                  <path d="M14 4h6v6M10 20H4v-6M20 4l-6.5 6.5M4 20l6.5-6.5" />
                </svg>
              </button>
            </div>

            {hasMultiple && (
              <span
                aria-live="polite"
                className={cn(
                  'typography-body-sm-medium absolute rounded-circle bg-base-black/60 px-2 py-1 text-base-white tabular-nums desktop:hidden',
                  FADE_TRANSITION,
                  isStack
                    ? 'top-[calc(max(16px,env(safe-area-inset-top))+10px)] right-28'
                    : 'right-4 bottom-4',
                  isChipHidden && 'opacity-0 duration-400',
                )}
              >
                {current + 1} / {photoCount}
              </span>
            )}
          </div>

          {/*
           * 프로토타입처럼 두 보기를 모두 그려 두고 보이는 쪽만 바꾼다.
           * 바꿀 때마다 사진을 새로 붙이면 다시 불러오고 그리느라 화면이 버벅인다
           */}
          <div
            ref={stackRef}
            aria-label="작품 이미지 이어보기"
            className={cn(!isStack && 'hidden')}
          >
            {images.map((src, index) => {
              const videoSrc = videoSrcs[index];
              const image = (
                <StackImage
                  key={`${src}-${index}`}
                  src={src}
                  alt={altOf(index)}
                  eager={index === 0}
                />
              );

              if (!videoSrc) return image;

              return (
                <div key={`${src}-${index}`} className={cn('relative', STACK_SCROLL_MARGIN)}>
                  {isStack && playingIndex === index ? (
                    <InlineVideo
                      src={videoSrc}
                      poster={src}
                      label={`${altOf(index)} 영상`}
                      onError={handleVideoError}
                      className="block h-auto w-full bg-secondary"
                    />
                  ) : (
                    <>
                      {image}
                      <VideoPlayButton src={videoSrc} onPlay={() => setPlayingIndex(index)} />
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <div
            ref={trackRef}
            tabIndex={0}
            role="group"
            aria-roledescription="이미지 슬라이더"
            aria-label="작품 이미지"
            onScroll={handleTrackScroll}
            onKeyDown={handleTrackKeyDown}
            className={cn(
              'flex h-full touch-pan-x touch-pan-y touch-pinch-zoom snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
              isStack && 'hidden',
            )}
          >
            {images.map((src, index) => (
              <div
                key={`${src}-${index}`}
                className="relative h-full flex-[0_0_100%] snap-center bg-secondary"
              >
                {videoSrcs[index] && !isStack && playingIndex === index ? (
                  <InlineVideo
                    src={videoSrcs[index]}
                    poster={src}
                    label={`${altOf(index)} 영상`}
                    onError={handleVideoError}
                    className="size-full bg-secondary object-contain"
                  />
                ) : (
                  <>
                    <OptimizedImage
                      src={src}
                      displayWidth={STAGE_IMAGE_WIDTH}
                      alt={altOf(index)}
                      draggable={false}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      skeleton
                      frameClassName="size-full"
                      className="object-contain select-none"
                    />
                    {videoSrcs[index] && (
                      <VideoPlayButton
                        src={videoSrcs[index]}
                        onPlay={() => setPlayingIndex(index)}
                      />
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 900px 이상 넘김 줄: 사진 밖 아래 오른쪽 ‹ 1 / 6 ›. 이어서 보기에선 왼쪽 썸네일이 위치를 알려 준다 */}
        {hasMultiple && !isStack && (
          <div className="-mr-2.5 hidden h-11 items-center justify-end desktop:flex">
            <button
              type="button"
              aria-label="이전 이미지"
              disabled={current === 0}
              onClick={() => goTo(current - 1)}
              className="relative grid h-11 w-10 cursor-pointer place-items-center text-[#18181b] transition-colors duration-150 ease-out disabled:cursor-default disabled:text-[#d4d4d8]"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-5 -scale-x-100 fill-none stroke-current stroke-[1.5] [stroke-linecap:round] [stroke-linejoin:round]"
              >
                <path d="m9 5 7 7-7 7" />
              </svg>
            </button>
            <span
              aria-hidden="true"
              className="min-w-10 text-center text-[12px] leading-[1.4] tracking-[-0.03em] text-[#3f3f47] tabular-nums"
            >
              {current + 1} / {photoCount}
            </span>
            <button
              type="button"
              aria-label="다음 이미지"
              disabled={current === photoCount - 1}
              onClick={() => goTo(current + 1)}
              className="relative grid h-11 w-10 cursor-pointer place-items-center text-[#18181b] transition-colors duration-150 ease-out disabled:cursor-default disabled:text-[#d4d4d8]"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-5 fill-none stroke-current stroke-[1.5] [stroke-linecap:round] [stroke-linejoin:round]"
              >
                <path d="m9 5 7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <ArtworkBigView
        open={bigStart !== null}
        startIndex={bigStart ?? 0}
        images={images}
        videoSrcs={videoSrcs}
        title={title}
        subtitle={subtitle}
        onClose={closeBig}
      />
    </section>
  );
}
