import { useEffect, useId, useRef, useState } from 'react';

import { ChevronDown } from 'lucide-react';

import { OptimizedImage } from '@/components/common/OptimizedImage';
import { cn } from '@/utils/cn';

const MAX_THUMBS = 3;
const THUMB_IMAGE_WIDTH = 96;
const PHOTO_IMAGE_WIDTH = 1080;
// 펼칠 때 줄이 화면의 이 비율보다 아래에 있으면 위로 끌어올려, 펼쳐지는 사진이 보이게 한다
const BRING_UP_FROM = 0.4;
const BRING_UP_TOP = 96;
const BRING_UP_MS = 560;
const MAX_STAGGER_STEPS = 5;

/* 소개글 아래 한 줄: 사진 조각(최대 3장) + v. 누르면 같은 화면에서 사진이 위부터 차례로 펼쳐진다. 글은 없다 */
export function ProcessStrip({ imageUrls }: { imageUrls: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const rowRef = useRef<HTMLButtonElement>(null);
  const scrollFrame = useRef(0);
  const listId = useId();

  const stopBringUp = () => cancelAnimationFrame(scrollFrame.current);
  useEffect(() => stopBringUp, []);

  // 목록이 자라는 동안 문서 높이도 같이 늘어나, 한 번에 가는 smooth 스크롤은 처음 높이에서 멈춘다. 프레임마다 옮긴다
  const bringUp = () => {
    const top = rowRef.current?.getBoundingClientRect().top ?? 0;
    if (top < window.innerHeight * BRING_UP_FROM) return;
    const from = window.scrollY;
    const distance = top - BRING_UP_TOP;
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 1
      : BRING_UP_MS;
    const startedAt = performance.now();
    const step = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      window.scrollTo(0, from + distance * (1 - (1 - progress) ** 4));
      if (progress < 1) scrollFrame.current = requestAnimationFrame(step);
    };
    scrollFrame.current = requestAnimationFrame(step);
    // 사용자가 직접 스크롤하면 끌어올리기를 멈춘다
    window.addEventListener('wheel', stopBringUp, { once: true, passive: true });
    window.addEventListener('touchstart', stopBringUp, { once: true, passive: true });
  };

  const toggle = () => {
    stopBringUp();
    if (!isOpen) bringUp();
    setIsOpen(!isOpen);
  };

  return (
    <div className="mt-2">
      <button
        ref={rowRef}
        type="button"
        aria-label="작업과정 사진"
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={toggle}
        className="group flex w-full cursor-pointer items-center justify-between rounded-12 pr-1 pl-0.5 transition-transform duration-fast ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-98"
      >
        <span aria-hidden className="flex">
          {imageUrls.slice(0, MAX_THUMBS).map((url, index) => (
            <span
              key={`${url}-${index}`}
              style={{ zIndex: MAX_THUMBS - index }}
              className="relative -ml-3.5 box-content h-12.5 w-10 shrink-0 overflow-hidden border-2 border-interactive-inverse bg-tertiary first:ml-0"
            >
              <OptimizedImage
                src={url}
                displayWidth={THUMB_IMAGE_WIDTH}
                alt=""
                draggable={false}
                className="size-full object-cover"
              />
            </span>
          ))}
        </span>
        <ChevronDown
          aria-hidden="true"
          size={20}
          strokeWidth={1.7}
          className={cn(
            'shrink-0 transition duration-slow ease-standard group-hover:text-primary',
            isOpen ? 'rotate-180 text-primary' : 'text-tertiary',
          )}
        />
      </button>

      {/* 닫힌 동안에는 invisible 이라 포커스 · 스크린리더에서 빠진다. visibility 도 함께 전환해 접히는 동안은 보인다 */}
      <div
        id={listId}
        role="group"
        aria-label="작업과정 사진"
        className={cn(
          'grid transition-[grid-template-rows,visibility] duration-slow ease-standard',
          isOpen ? 'grid-rows-[1fr]' : 'invisible grid-rows-[0fr]',
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="grid gap-2 pt-3">
            {imageUrls.map((url, index) => (
              <OptimizedImage
                key={`${url}-${index}`}
                src={url}
                displayWidth={PHOTO_IMAGE_WIDTH}
                alt={`작업과정 사진 ${index + 1}`}
                draggable={false}
                className={cn(
                  'block aspect-4/5 w-full bg-tertiary object-cover transition select-none',
                  isOpen
                    ? 'duration-slow ease-standard'
                    : '-translate-y-4.5 opacity-0 duration-fast ease-out',
                )}
                style={
                  isOpen
                    ? { transitionDelay: `${Math.min(index, MAX_STAGGER_STEPS) * 70 + 60}ms` }
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
