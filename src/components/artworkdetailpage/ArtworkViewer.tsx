import {
  type KeyboardEvent,
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import viewOneIcon from '@/assets/artwork-detail/view-one.svg';
import viewOneActiveIcon from '@/assets/artwork-detail/view-one-active.svg';
import viewStackIcon from '@/assets/artwork-detail/view-stack.svg';
import viewStackActiveIcon from '@/assets/artwork-detail/view-stack-active.svg';
import { DetailBackButton } from '@/components/common/detail';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { cn } from '@/utils/cn';

import { getStackPhotoIndex, STACK_READING_LINE } from './artworkDetail.utils';
import type { ViewerChrome } from './useViewerChromeFade';
import type { ViewMode } from './useViewMode';

type Props = {
  images: string[];
  title: string;
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  stageRef: RefObject<HTMLDivElement>;
  chrome: ViewerChrome;
  /* 900px 이상은 서비스 헤더가 있어 뒤로가기를 빼지만, 미리보기는 사진 위에 둔다 */
  isPreview: boolean;
  onBack: () => void;
};

const STAGE_IMAGE_WIDTH = 1080;
const THUMB_IMAGE_WIDTH = 96;
const OVERLAY_TOP = 'top-[max(16px,env(safe-area-inset-top))]';
// 높이 40인 보기 방식 스위치를 높이 44인 뒤로가기와 가운데를 맞춘다
const SWITCH_TOP = 'top-[calc(max(16px,env(safe-area-inset-top))+2px)]';
// 이어서 보기에서 썸네일로 옮길 때 사진 윗변이 놓이는 자리. 현재 장 계산의 기준선으로도 읽는다
const STACK_SCROLL_MARGIN =
  'scroll-mt-(--detail-top) desktop:scroll-mt-[calc(var(--detail-top)+2rem)]';
// 사용자가 직접 스크롤하기 시작했다는 신호. 썸네일로 고른 장을 이때까지 유지한다
const USER_SCROLL_EVENTS = ['wheel', 'touchstart', 'keydown', 'pointerdown'] as const;

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
  title,
  mode,
  onModeChange,
  stageRef,
  chrome,
  isPreview,
  onBack,
}: Props) {
  const photoCount = images.length;
  const hasMultiple = photoCount > 1;
  const isStack = mode === 'stack';

  const [current, setCurrent] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const shouldAlignAfterModeChange = useRef(false);
  const currentRef = useRef(current);
  // 썸네일 · 보기 방식 전환으로 옮긴 장. 페이지 끝이라 사진이 위까지 못 올라와도 고른 장을 유지한다
  const isStackPinnedRef = useRef(false);

  const { isStackHidden, isControlsDimmed, isChipHidden, peekChip, holdProps } = chrome;
  const stackHiddenClass = isStackHidden && 'pointer-events-none opacity-0';

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
    shouldAlignAfterModeChange.current = true;
    onModeChange(next);
  };

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (track) track.scrollLeft = currentRef.current * track.clientWidth;

    if (!shouldAlignAfterModeChange.current) return;
    shouldAlignAfterModeChange.current = false;

    // 한 장씩 보기는 페이지 맨 위의 사진에서 이어 보고, 이어서 보기는 보던 장으로 내려간다
    if (isStack) scrollToStackImage(currentRef.current, scrollBehavior());
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
        const anchor = parseFloat(getComputedStyle(stack.firstElementChild).scrollMarginTop) || 0;
        const tops = Array.from(stack.children, (element) => element.getBoundingClientRect().top);
        const index = getStackPhotoIndex(tops, anchor, window.innerHeight * STACK_READING_LINE);
        if (index !== currentRef.current) {
          currentRef.current = index;
          setCurrent(index);
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    USER_SCROLL_EVENTS.forEach((type) => window.addEventListener(type, unpin, { passive: true }));
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
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

  return (
    <section
      aria-label="작품 이미지"
      className={cn(
        'relative desktop:flex desktop:items-start desktop:gap-3',
        !isStack && 'desktop:sticky desktop:top-[calc(var(--detail-top)+2rem)]',
      )}
    >
      {hasMultiple && (
        <div
          role="list"
          aria-label="이미지 목록"
          className={cn(
            'hidden max-h-[min(78vh,820px)] shrink-0 flex-col gap-1.5 overflow-y-auto [scrollbar-width:none] desktop:flex [&::-webkit-scrollbar]:hidden',
            isStack && 'desktop:sticky desktop:top-[calc(var(--detail-top)+2rem)]',
          )}
        >
          {images.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              aria-label={`${index + 1}번째 이미지 보기`}
              aria-current={index === current}
              onClick={() => selectThumb(index)}
              className={cn(
                'h-16 w-12 shrink-0 cursor-pointer overflow-hidden border-2 transition-opacity duration-fast ease-standard',
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
            </button>
          ))}
        </div>
      )}

      <div
        ref={stageRef}
        className={cn(
          'relative min-w-0 flex-1',
          !isStack &&
            'aspect-402/554 overflow-hidden bg-secondary min-[600px]:aspect-auto min-[600px]:h-[78vh] desktop:h-[min(78vh,820px)]',
        )}
      >
        <div
          className={cn(
            'pointer-events-none z-20',
            isStack ? 'sticky top-(--detail-top) h-0 w-full' : 'absolute inset-0',
          )}
        >
          {/* 900px 미만의 뒤로가기는 화면을 따라 내려오도록 ArtworkDetailShell 이 둔다 */}
          {isPreview && (
            <DetailBackButton
              onBack={onBack}
              {...holdProps}
              className={cn(
                'pointer-events-auto absolute left-5 hidden desktop:grid',
                OVERLAY_TOP,
                stackHiddenClass,
              )}
            />
          )}

          {hasMultiple && (
            <div
              role="group"
              aria-label="감상 방식"
              {...holdProps}
              className={cn(
                'pointer-events-auto absolute right-5 flex gap-0.5 rounded-circle bg-base-black/45 p-1 backdrop-blur-lg transition-opacity duration-base ease-standard',
                SWITCH_TOP,
                isControlsDimmed && 'opacity-55',
                stackHiddenClass,
              )}
            >
              <button
                type="button"
                aria-label="한 장씩 보기"
                aria-pressed={!isStack}
                onClick={() => changeMode('one')}
                className={cn(
                  'grid h-8 w-9 cursor-pointer place-items-center rounded-circle transition duration-fast ease-standard active:scale-94',
                  !isStack && 'bg-interactive-primary',
                )}
              >
                <img src={isStack ? viewOneIcon : viewOneActiveIcon} alt="" />
              </button>
              <button
                type="button"
                aria-label="이어서 보기"
                aria-pressed={isStack}
                onClick={() => changeMode('stack')}
                className={cn(
                  'grid h-8 w-9 cursor-pointer place-items-center rounded-circle transition duration-fast ease-standard active:scale-94',
                  isStack && 'bg-interactive-primary',
                )}
              >
                <img src={isStack ? viewStackActiveIcon : viewStackIcon} alt="" />
              </button>
            </div>
          )}

          {hasMultiple && (
            <span
              aria-live="polite"
              className={cn(
                'typography-body-sm-medium absolute rounded-circle bg-base-black/60 px-2 py-1 text-base-white tabular-nums transition-opacity duration-base ease-standard',
                isStack
                  ? 'top-[calc(max(16px,env(safe-area-inset-top))+10px)] right-28'
                  : 'right-4 bottom-4',
                isChipHidden && 'opacity-0',
              )}
            >
              {current + 1} / {photoCount}
            </span>
          )}
        </div>

        {isStack ? (
          <div ref={stackRef} aria-label="작품 이미지 이어보기">
            {images.map((src, index) => (
              <StackImage
                key={`${src}-${index}`}
                src={src}
                alt={altOf(index)}
                eager={index === 0}
              />
            ))}
          </div>
        ) : (
          <div
            ref={trackRef}
            tabIndex={0}
            role="group"
            aria-roledescription="이미지 슬라이더"
            aria-label="작품 이미지"
            onScroll={handleTrackScroll}
            onKeyDown={handleTrackKeyDown}
            className="flex h-full touch-pan-x touch-pan-y touch-pinch-zoom snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {images.map((src, index) => (
              <div
                key={`${src}-${index}`}
                className="h-full flex-[0_0_100%] snap-center bg-secondary"
              >
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
              </div>
            ))}
          </div>
        )}

        {hasMultiple && !isStack && (
          <>
            <button
              type="button"
              aria-label="이전 이미지"
              disabled={current === 0}
              onClick={() => goTo(current - 1)}
              className="absolute top-1/2 left-4 z-20 -mt-5.5 hidden size-11 cursor-pointer place-items-center rounded-circle bg-primary-white/82 text-icon-primary backdrop-blur-md transition duration-fast ease-standard hover:scale-106 disabled:cursor-default disabled:opacity-35 disabled:hover:scale-100 desktop:grid"
            >
              <ChevronLeft aria-hidden="true" size={20} strokeWidth={1.7} />
            </button>
            <button
              type="button"
              aria-label="다음 이미지"
              disabled={current === photoCount - 1}
              onClick={() => goTo(current + 1)}
              className="absolute top-1/2 right-4 z-20 -mt-5.5 hidden size-11 cursor-pointer place-items-center rounded-circle bg-primary-white/82 text-icon-primary backdrop-blur-md transition duration-fast ease-standard hover:scale-106 disabled:cursor-default disabled:opacity-35 disabled:hover:scale-100 desktop:grid"
            >
              <ChevronRight aria-hidden="true" size={20} strokeWidth={1.7} />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
