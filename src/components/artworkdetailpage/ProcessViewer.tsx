import { type RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import backIcon from '@/assets/artwork-detail/back-inverse.svg';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useOverlayHistory } from '@/hooks/useOverlayHistory';
import { useScrollLock } from '@/hooks/useScrollLock';
import { cn } from '@/utils/cn';
import { optimizeImageUrl } from '@/utils/imageOptimization';

type Props = {
  open: boolean;
  onClose: () => void;
  imageUrls: string[];
  /* 열릴 때 자라나고 닫힐 때 돌아갈 사진 조각 */
  originRef: RefObject<HTMLElement>;
};

export const PROCESS_IMAGE_WIDTH = 1080;

const OPEN_DURATION_MS = 520;
const CLOSE_DURATION_MS = 460;
const FADE_CLOSE_MS = 330;
const EASING = 'cubic-bezier(.32,.72,0,1)';
const SCROLLED_AWAY_THRESHOLD = 20;
const PHOTO_GAP = 8;
const TABLET_WIDTH = 768;

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* 조각과 같은 가운데 자름을 맞춰, 커지는 동안 사진이 튀지 않게 합니다. */
function buildKeyframes(origin: DOMRect, target: DOMRect): Keyframe[] {
  const scale = origin.width / target.width;
  const dx = origin.left + origin.width / 2 - (target.left + target.width / 2);
  const dy = origin.top + origin.height / 2 - (target.top + target.height / 2);
  const insetX = Math.max(0, (target.width - origin.width / scale) / 2);
  const insetY = Math.max(0, (target.height - origin.height / scale) / 2);
  const endRadius = window.innerWidth >= TABLET_WIDTH ? 12 : 0;

  return [
    {
      transform: `translate(${dx}px, ${dy}px) scale(${scale})`,
      clipPath: `inset(${insetY}px ${insetX}px round ${8 / scale}px)`,
    },
    { transform: 'translate(0, 0) scale(1)', clipPath: `inset(0px round ${endRadius}px)` },
  ];
}

const setVisibility = (element: HTMLElement, value: '' | 'hidden') => {
  element.style.visibility = value;
};

const placeClone = (clone: HTMLElement, rect: DOMRect) => {
  clone.style.left = `${rect.left}px`;
  clone.style.top = `${rect.top}px`;
  clone.style.width = `${rect.width}px`;
  clone.style.height = `${rect.height}px`;
};

export function ProcessViewer({ open, onClose, imageUrls, originRef }: Props) {
  const [isMounted, setIsMounted] = useState(open);
  const [counter, setCounter] = useState(1);
  // 다시 열리면 렌더 중에 바로 마운트 상태로 맞춘다(effect 를 기다리면 한 프레임 비어 보인다)
  if (open && !isMounted) setIsMounted(true);

  const isExiting = isMounted && !open;

  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const cloneRef = useRef<HTMLDivElement>(null);

  const { requestClose, isTopmost } = useOverlayHistory(open, onClose);
  useScrollLock(open);
  useFocusTrap(panelRef, open, { initialFocusRef: closeButtonRef, isTopmost });

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.isComposing || !isTopmost()) return;
      event.preventDefault();
      requestClose();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, isTopmost, requestClose]);

  useLayoutEffect(() => {
    if (!open) return;

    const origin = originRef.current;
    const clone = cloneRef.current;
    const first = scrollerRef.current?.firstElementChild as HTMLElement | null;
    if (!origin || !clone || !first) return;

    const target = first.getBoundingClientRect();
    placeClone(clone, target);
    clone.style.display = '';
    setVisibility(first, 'hidden');
    setVisibility(origin, 'hidden');

    const animation = clone.animate(buildKeyframes(origin.getBoundingClientRect(), target), {
      duration: prefersReducedMotion() ? 1 : OPEN_DURATION_MS,
      easing: EASING,
      fill: 'both',
    });
    animation.onfinish = () => {
      setVisibility(first, '');
      clone.style.display = 'none';
    };

    return () => {
      animation.cancel();
      setVisibility(first, '');
      setVisibility(origin, '');
    };
  }, [open, originRef]);

  useLayoutEffect(() => {
    if (!isExiting) return;

    const origin = originRef.current;
    const scroller = scrollerRef.current;
    const clone = cloneRef.current;
    const first = scroller?.firstElementChild as HTMLElement | null;

    const finish = () => {
      if (origin) setVisibility(origin, '');
      setIsMounted(false);
      setCounter(1);
    };

    // 많이 내려간 뒤에는 조각으로 돌아가지 않고 조용히 닫는다
    if (!origin || !scroller || !clone || !first || scroller.scrollTop > SCROLLED_AWAY_THRESHOLD) {
      const timer = window.setTimeout(finish, FADE_CLOSE_MS);
      return () => window.clearTimeout(timer);
    }

    const target = first.getBoundingClientRect();
    placeClone(clone, target);
    clone.style.display = '';
    setVisibility(first, 'hidden');
    setVisibility(origin, 'hidden');

    const animation = clone.animate(
      buildKeyframes(origin.getBoundingClientRect(), target).reverse(),
      {
        duration: prefersReducedMotion() ? 1 : CLOSE_DURATION_MS,
        easing: EASING,
        fill: 'both',
      },
    );
    animation.onfinish = finish;

    return () => {
      animation.onfinish = null;
    };
  }, [isExiting, originRef]);

  const handleScroll = () => {
    const scroller = scrollerRef.current;
    const first = scroller?.firstElementChild as HTMLElement | null;
    if (!scroller || !first || imageUrls.length < 2) return;
    const step = first.offsetHeight + PHOTO_GAP;
    setCounter(Math.min(imageUrls.length, Math.max(1, Math.round(scroller.scrollTop / step) + 1)));
  };

  if (!isMounted) return null;

  const fadeClass = isExiting ? 'animate-fade-out' : 'animate-fade-in';

  // 목록 등장 애니메이션(transform)이 걸린 조상 안에서도 화면 기준으로 고정되도록 body 에 그린다
  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="작업과정 사진"
      tabIndex={-1}
      className={cn(
        'fixed inset-0 z-70 flex flex-col overflow-hidden text-interactive-inverse outline-none',
        isExiting && 'pointer-events-none',
      )}
    >
      <div aria-hidden className={cn('absolute inset-0 bg-primary-black', fadeClass)} />

      <div
        className={cn(
          'relative z-10 flex min-h-14 shrink-0 items-center pt-[max(6px,env(safe-area-inset-top))] pr-gutter pb-1.5 pl-2',
          fadeClass,
        )}
      >
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="닫기"
          onClick={requestClose}
          className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-circle transition duration-fast ease-standard hover:bg-[rgba(255,255,255,0.12)] focus-visible:outline-2 focus-visible:outline-focus-inverse active:scale-94"
        >
          <img src={backIcon} alt="" />
        </button>
        {imageUrls.length > 1 && (
          <span className="typography-body-lg-medium ml-1 text-quaternary tabular-nums">
            {counter} / {imageUrls.length}
          </span>
        )}
      </div>

      <div
        ref={scrollerRef}
        tabIndex={0}
        aria-label="작업과정 사진"
        onScroll={handleScroll}
        className={cn(
          'relative z-10 grid min-h-0 flex-1 content-start gap-2 overflow-y-auto overscroll-contain pb-[max(40px,env(safe-area-inset-bottom))] [scrollbar-width:none] tablet:px-[calc((100%-560px)/2)] [&::-webkit-scrollbar]:hidden',
          isExiting && 'opacity-0 transition-opacity duration-fast',
        )}
      >
        {imageUrls.map((url, index) => (
          <OptimizedImage
            key={url}
            src={url}
            displayWidth={PROCESS_IMAGE_WIDTH}
            alt={`작업과정 ${index + 1}`}
            loading={index === 0 ? 'eager' : 'lazy'}
            draggable={false}
            className="block aspect-4/5 w-full bg-[#27272a] object-cover select-none tablet:rounded-12"
          />
        ))}
      </div>

      <div
        ref={cloneRef}
        aria-hidden
        className="pointer-events-none fixed z-30 overflow-hidden will-change-transform"
        style={{ display: 'none' }}
      >
        <img
          src={optimizeImageUrl(imageUrls[0], PROCESS_IMAGE_WIDTH)}
          alt=""
          className="size-full object-cover"
        />
      </div>
    </div>,
    document.body,
  );
}
