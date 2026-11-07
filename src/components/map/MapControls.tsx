import { Focus, Locate, Minus, Plus } from 'lucide-react';

import { cn } from '@/utils/cn';

const FLOAT_SHADOW =
  'shadow-[0_1px_2px_rgba(0,0,0,.06),0_4px_12px_rgba(0,0,0,.08),0_12px_24px_rgba(0,0,0,.06)]';

const buttonClassName =
  'grid size-11 place-items-center bg-primary-white text-primary transition-[scale,opacity,background-color,color] duration-200 ease-[cubic-bezier(.16,1,.3,1)] active:scale-94 disabled:cursor-default disabled:active:scale-100';

interface MapControlsProps {
  canZoomIn: boolean;
  canZoomOut: boolean;
  isLocationShown: boolean;
  isLocationDenied: boolean;
  isLocating: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitAll: () => void;
  onLocate: () => void;
}

export function MapControls({
  canZoomIn,
  canZoomOut,
  isLocationShown,
  isLocationDenied,
  isLocating,
  onZoomIn,
  onZoomOut,
  onFitAll,
  onLocate,
}: MapControlsProps) {
  return (
    <div className="fixed right-5 bottom-[calc(var(--map-sheet-visible)+16px)] z-30 grid gap-2 transition-[bottom] duration-450 ease-[cubic-bezier(.16,1,.3,1)] md:bottom-7">
      <div className={cn('grid overflow-hidden rounded-circle bg-primary-white', FLOAT_SHADOW)}>
        <button
          type="button"
          aria-label="확대"
          title="확대"
          disabled={!canZoomIn}
          onClick={onZoomIn}
          className={cn(buttonClassName, 'disabled:opacity-35')}
        >
          <Plus aria-hidden className="size-6" strokeWidth={2} />
        </button>
        <button
          type="button"
          aria-label="축소"
          title="축소"
          disabled={!canZoomOut}
          onClick={onZoomOut}
          className={cn(buttonClassName, 'border-t border-[#f4f4f5] disabled:opacity-35')}
        >
          <Minus aria-hidden className="size-6" strokeWidth={2} />
        </button>
      </div>
      <button
        type="button"
        aria-label="전시 전체 보기"
        title="전시 전체 보기"
        onClick={onFitAll}
        className={cn(buttonClassName, 'rounded-circle', FLOAT_SHADOW)}
      >
        <Focus aria-hidden className="size-6" strokeWidth={1.8} />
      </button>
      <button
        type="button"
        aria-label={isLocationDenied ? '내 위치 (위치 권한이 꺼져 있어요)' : '내 위치'}
        title="내 위치"
        aria-pressed={isLocationShown}
        disabled={isLocationDenied || isLocating}
        onClick={onLocate}
        className={cn(
          buttonClassName,
          'rounded-circle disabled:opacity-40',
          FLOAT_SHADOW,
          isLocationShown && 'bg-primary-black text-interactive-inverse',
        )}
      >
        <Locate
          aria-hidden
          className={cn('size-6', isLocating && 'motion-safe:animate-pulse')}
          strokeWidth={1.8}
        />
      </button>
    </div>
  );
}
