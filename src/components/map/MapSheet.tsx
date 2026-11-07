import { ChevronLeft } from 'lucide-react';
import type { ReactNode, RefObject } from 'react';

import { cn } from '@/utils/cn';

interface MapSheetProps {
  title: string | null;
  isFull: boolean;
  isDragging: boolean;
  isPanelFolded: boolean;
  sheetRef: RefObject<HTMLElement>;
  bodyRef: RefObject<HTMLDivElement>;
  onHandleTap: () => void;
  onToggleFold: () => void;
  children: ReactNode;
}

/**
 * 모바일에서는 바텀시트, 데스크톱(768px~)에서는 접을 수 있는 왼쪽 패널.
 * 바텀시트 동작 규칙은 mapViewport.ts 맨 위 "지도 바텀시트 규칙"에 있다.
 */
export function MapSheet({
  title,
  isFull,
  isDragging,
  isPanelFolded,
  sheetRef,
  bodyRef,
  onHandleTap,
  onToggleFold,
  children,
}: MapSheetProps) {
  return (
    <>
      <section
        ref={sheetRef}
        id="map-sheet"
        aria-label="전시 목록"
        className={cn(
          'fixed right-0 bottom-0 left-0 z-40 flex h-[calc(100dvh-env(safe-area-inset-top)-8px)] select-none md:select-auto translate-y-[calc(100%-var(--map-sheet-visible))] flex-col rounded-t-20 bg-primary-black pb-[env(safe-area-inset-bottom)] text-interactive-inverse shadow-[0_-4px_20px_rgba(0,0,0,.25)]',
          isDragging
            ? 'transition-none'
            : 'transition-[translate] duration-450 ease-[cubic-bezier(.16,1,.3,1)]',
          'md:right-auto md:h-dvh md:w-100 md:translate-y-0 md:rounded-none md:pb-0 md:shadow-[4px_0_20px_rgba(0,0,0,.2)]',
          'md:transition-[translate,visibility] md:duration-400',
          isPanelFolded && 'md:invisible md:-translate-x-[calc(100%+12px)]',
        )}
      >
        <div className="shrink-0 touch-none px-5 md:touch-auto md:pt-7">
          <button
            type="button"
            aria-label="목록 크기 바꾸기"
            aria-controls="map-sheet-body"
            onClick={onHandleTap}
            className={cn(
              'mx-auto flex h-8 w-25 items-center justify-center md:hidden',
              !title && '-mb-4',
            )}
          >
            <span className="h-1.5 w-17.5 rounded-circle bg-[#3f3f46]" />
          </button>
          {title ? (
            <h2 className="typography-body-lg-semibold flex h-5 items-center">{title}</h2>
          ) : null}
        </div>
        <div
          ref={bodyRef}
          id="map-sheet-body"
          className={cn(
            'grid min-h-0 flex-1 content-start gap-3 px-5 pt-4 pb-5 [scrollbar-color:#3f3f46_transparent] [scrollbar-width:thin] md:overflow-y-auto md:pb-7',
            isFull
              ? 'touch-pan-y overflow-y-auto overscroll-contain'
              : 'touch-none overflow-hidden',
            'md:touch-auto',
          )}
        >
          {children}
        </div>
      </section>

      <button
        type="button"
        aria-expanded={!isPanelFolded}
        aria-controls="map-sheet"
        aria-label={isPanelFolded ? '목록 펼치기' : '목록 접기'}
        onClick={onToggleFold}
        className="fixed top-1/2 left-(--map-panel-width) z-45 -mt-7 hidden h-14 w-7 place-items-center rounded-r-12 bg-primary-white text-tertiary shadow-[0_1px_2px_rgba(0,0,0,.06),0_4px_12px_rgba(0,0,0,.08),0_12px_24px_rgba(0,0,0,.06)] transition-[left,color] duration-400 ease-[cubic-bezier(.16,1,.3,1)] after:absolute after:-inset-y-1 after:-right-2.5 after:left-0 hover:text-primary md:grid"
      >
        <ChevronLeft
          aria-hidden
          className={cn(
            'size-5 transition-[rotate] duration-400 ease-[cubic-bezier(.16,1,.3,1)]',
            isPanelFolded && 'rotate-180',
          )}
          strokeWidth={2}
        />
      </button>
    </>
  );
}
