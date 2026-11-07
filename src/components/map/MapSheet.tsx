import { ChevronLeft } from 'lucide-react';
import type { ReactNode, RefObject } from 'react';

import { cn } from '@/utils/cn';

interface MapSheetProps {
  title: ReactNode;
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
          'fixed right-0 bottom-0 left-0 z-40 flex h-[calc(100dvh-var(--spacing-safe-area-top)-8px)] select-none tablet:select-auto translate-y-[calc(100%-var(--map-sheet-visible))] flex-col rounded-t-20 bg-primary-black pb-safe-area-bottom text-interactive-inverse shadow-[0_-4px_20px_rgba(0,0,0,.25)]',
          isDragging ? 'transition-none' : 'transition-[translate] duration-slow ease-standard',
          'tablet:right-auto tablet:h-dvh tablet:w-100 tablet:translate-y-0 tablet:rounded-none tablet:pb-0 tablet:shadow-[4px_0_20px_rgba(0,0,0,.2)]',
          'tablet:transition-[translate,visibility] tablet:duration-slow',
          isPanelFolded && 'tablet:invisible tablet:-translate-x-[calc(100%+12px)]',
        )}
      >
        <div className="shrink-0 touch-none px-5 tablet:touch-auto tablet:pt-7">
          <button
            type="button"
            aria-label="목록 크기 바꾸기"
            aria-controls="map-sheet-body"
            onClick={onHandleTap}
            className="relative mx-auto flex h-8 w-25 items-center justify-center after:absolute after:inset-x-0 after:-inset-y-1.5 tablet:hidden"
          >
            <span className="h-1.5 w-17.5 rounded-circle bg-[#3f3f46]" />
          </button>
          <h2 className="typography-title-xs flex h-7 min-w-0 items-center">{title}</h2>
        </div>
        <div
          ref={bodyRef}
          id="map-sheet-body"
          className={cn(
            'grid min-h-0 flex-1 content-start gap-3 px-5 pt-4 pb-5 opacity-(--map-sheet-content-opacity) [scrollbar-color:#3f3f46_transparent] [scrollbar-width:thin] tablet:overflow-y-auto tablet:pb-7 tablet:opacity-100',
            isDragging ? 'transition-none' : 'transition-opacity duration-slow ease-standard',
            isFull
              ? 'touch-pan-y overflow-y-auto overscroll-contain'
              : 'touch-none overflow-hidden',
            'tablet:touch-auto',
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
        className="fixed top-1/2 left-(--map-panel-width) z-45 -mt-7 hidden h-14 w-7 place-items-center rounded-r-12 bg-primary-white text-tertiary shadow-[0_1px_2px_rgba(0,0,0,.06),0_4px_12px_rgba(0,0,0,.08),0_12px_24px_rgba(0,0,0,.06)] transition-[left,color] duration-slow ease-standard after:absolute after:-inset-y-1 after:-right-2.5 after:left-0 hover:text-primary tablet:grid"
      >
        <ChevronLeft
          aria-hidden
          className={cn(
            'size-5 transition-[rotate] duration-slow ease-standard',
            isPanelFolded && 'rotate-180',
          )}
          strokeWidth={2}
        />
      </button>
    </>
  );
}
