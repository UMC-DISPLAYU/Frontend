import { ChevronLeft, LocateOff, Search, X } from 'lucide-react';
import type { FormEvent, MouseEvent } from 'react';

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
  onSearch: (query: string) => void;
  onClearSearch: () => void;
  statusFilters: MapExhibitionStatus[];
  statusCounts: Record<MapExhibitionStatus, number>;
  onToggleStatus: (status: MapExhibitionStatus) => void;
  showLocationNotice: boolean;
  onBack: () => void;
}

export function MapTopBar({
  query,
  onSearch,
  onClearSearch,
  statusFilters,
  statusCounts,
  onToggleStatus,
  showLocationNotice,
  onBack,
}: MapTopBarProps) {
  // 탐색 페이지와 같이 돋보기(또는 키보드 검색 키)를 눌러야 검색한다
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(String(new FormData(event.currentTarget).get('q') ?? ''));
    // 모바일에서 검색 후 키보드를 내린다
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  };

  const handleClear = (event: MouseEvent<HTMLButtonElement>) => {
    const input = event.currentTarget.form?.elements.namedItem('q');
    if (input instanceof HTMLInputElement) input.value = '';
    onClearSearch();
  };

  return (
    <div className="pointer-events-none fixed top-[calc(var(--spacing-safe-area-top)+12px)] right-5 left-5 z-20 grid gap-3 transition-[left] duration-slow ease-standard tablet:left-[calc(var(--map-panel-width)+20px)]">
      <div className="pointer-events-auto flex items-center gap-2">
        <button
          type="button"
          aria-label="뒤로"
          onClick={onBack}
          className={cn(
            'grid size-11 shrink-0 place-items-center rounded-circle bg-primary-black text-interactive-inverse transition-[scale] duration-fast active:scale-96',
            FLOAT_SHADOW,
          )}
        >
          <ChevronLeft aria-hidden className="size-6" strokeWidth={2} />
        </button>
        <form role="search" onSubmit={handleSubmit} className="relative h-11 min-w-0 flex-1">
          {/* 입력 중에 검색이 풀려도 포커스·키보드가 유지되도록 key로 다시 그리지 않는다 */}
          <input
            type="search"
            name="q"
            aria-label="전시 검색어"
            defaultValue={query}
            onChange={(event) => {
              // 직접 지워서 비우면 돋보기를 누르지 않아도 검색을 푼다(X와 같이 지도는 그대로)
              if (query && !event.target.value.trim()) onClearSearch();
            }}
            placeholder="어떤 전시를 찾고 있나요?"
            autoComplete="off"
            enterKeyHint="search"
            className={cn(
              'peer typography-body-xl-medium h-11 w-full rounded-circle bg-secondary pr-22 pl-5 text-primary placeholder:text-[#6b6b75] [&::-webkit-search-cancel-button]:hidden',
              FLOAT_SHADOW,
            )}
          />
          <button
            type="button"
            aria-label="검색어 지우기"
            onClick={handleClear}
            className="absolute top-0 right-11 grid size-11 place-items-center text-icon-tertiary peer-placeholder-shown:hidden"
          >
            <X aria-hidden className="size-4.5" strokeWidth={2} />
          </button>
          <button
            type="submit"
            aria-label="검색"
            className="absolute top-0 right-0 grid size-11 place-items-center text-tertiary"
          >
            <Search aria-hidden className="size-6" strokeWidth={1.8} />
          </button>
        </form>
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
                'typography-body-lg-semibold relative inline-flex h-9 items-center gap-1.5 rounded-circle px-3.5 transition-[scale,background-color,color] duration-fast ease-standard after:absolute after:-inset-x-0.5 after:-inset-y-1 active:scale-96',
                FLOAT_SHADOW,
                pressed
                  ? 'bg-primary-black text-interactive-inverse'
                  : 'bg-primary-white text-primary',
              )}
            >
              <span>{label}</span>
              <b
                className={cn(
                  'font-semibold tabular-nums transition-colors duration-fast',
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
