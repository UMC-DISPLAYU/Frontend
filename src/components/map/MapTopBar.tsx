import { ChevronLeft, LocateOff, Search } from 'lucide-react';

import { cn } from '@/utils/cn';

import type { MapExhibitionStatus } from './mapExhibition';

const FLOAT_SHADOW =
  'shadow-[0_1px_2px_rgba(0,0,0,.06),0_4px_12px_rgba(0,0,0,.08),0_12px_24px_rgba(0,0,0,.06)]';

const STATUS_CHIPS: { value: MapExhibitionStatus; label: string }[] = [
  { value: 'live', label: '전시 중' },
  { value: 'soon', label: '전시 예정' },
];

interface MapTopBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  statusFilters: MapExhibitionStatus[];
  statusCounts: Record<MapExhibitionStatus, number>;
  onToggleStatus: (status: MapExhibitionStatus) => void;
  showLocationNotice: boolean;
  onBack: () => void;
}

export function MapTopBar({
  query,
  onQueryChange,
  statusFilters,
  statusCounts,
  onToggleStatus,
  showLocationNotice,
  onBack,
}: MapTopBarProps) {
  return (
    <div className="pointer-events-none fixed top-[calc(env(safe-area-inset-top)+12px)] right-5 left-5 z-20 grid gap-3 transition-[left] duration-450 ease-[cubic-bezier(.16,1,.3,1)] md:left-[calc(var(--map-panel-width)+20px)]">
      <div className="pointer-events-auto flex items-center gap-2">
        <button
          type="button"
          aria-label="뒤로"
          onClick={onBack}
          className={cn(
            'grid size-11 shrink-0 place-items-center rounded-circle bg-primary-black text-interactive-inverse transition-[scale] duration-200 active:scale-96',
            FLOAT_SHADOW,
          )}
        >
          <ChevronLeft aria-hidden className="size-6" strokeWidth={2} />
        </button>
        <label className="relative h-11 min-w-0 flex-1">
          <span className="sr-only">전시 검색</span>
          {/* 전역 input 축소 규칙(iOS 확대 방지)은 16px 글자만 필요하므로 크기 보정은 풀어 둔다 */}
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="어떤 전시를 찾고 있나요?"
            autoComplete="off"
            enterKeyHint="search"
            className={cn(
              'typography-body-xl-medium h-11 !w-full !transform-none rounded-circle bg-secondary pr-12 pl-5 text-primary !mr-0 placeholder:text-[#6b6b75] [&::-webkit-search-cancel-button]:hidden',
              FLOAT_SHADOW,
            )}
          />
          <Search
            aria-hidden
            className="pointer-events-none absolute top-2.5 right-3 size-6 text-tertiary"
            strokeWidth={1.8}
          />
        </label>
      </div>

      {showLocationNotice ? (
        <div
          className={cn(
            'pointer-events-auto flex items-center gap-3 rounded-12 bg-primary-white px-4 py-3',
            FLOAT_SHADOW,
          )}
        >
          <LocateOff aria-hidden className="size-5 shrink-0 text-icon-tertiary" strokeWidth={1.8} />
          <p className="grid min-w-0 gap-0.5">
            <strong className="typography-body-lg-semibold text-primary">
              위치 권한이 꺼져 있어요
            </strong>
            <span className="typography-body-md-medium text-tertiary">
              가까운 전시를 먼저 보려면 설정에서 켜주세요
            </span>
          </p>
        </div>
      ) : null}

      <div
        role="group"
        aria-label="전시 상태 (둘 다 안 누르면 전부 보여요)"
        className="pointer-events-auto flex gap-2"
      >
        {STATUS_CHIPS.map(({ value, label }) => {
          const pressed = statusFilters.includes(value);
          return (
            <button
              key={value}
              type="button"
              aria-pressed={pressed}
              onClick={() => onToggleStatus(value)}
              className={cn(
                'typography-body-lg-semibold relative inline-flex h-9 items-center gap-1.5 rounded-circle px-3.5 transition-[scale,background-color,color] duration-200 ease-[cubic-bezier(.16,1,.3,1)] after:absolute after:-inset-x-0.5 after:-inset-y-1 active:scale-96',
                FLOAT_SHADOW,
                pressed
                  ? 'bg-primary-black text-interactive-inverse'
                  : 'bg-primary-white text-primary',
              )}
            >
              <span>{label}</span>
              <b
                className={cn(
                  'font-semibold tabular-nums transition-colors duration-200',
                  pressed ? 'text-[#d4d4d8]' : 'text-tertiary',
                )}
              >
                {statusCounts[value]}
              </b>
            </button>
          );
        })}
      </div>
    </div>
  );
}
