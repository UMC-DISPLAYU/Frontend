import { type FormEvent, type MouseEvent, useEffect, useId, useRef, useState } from 'react';

import { ChevronLeft, LocateOff, Search, X } from 'lucide-react';

import type { NearbyDisplay } from '@/hooks/queries/useMapDisplays';
import { cn } from '@/utils/cn';

import { formatPickedDate, startOfMonth } from './mapCalendar';
import { MapDateCalendar } from './MapDateCalendar';
import type { MapExhibitionStatus } from './mapExhibition';

const FLOAT_SHADOW =
  'shadow-[0_1px_2px_rgba(0,0,0,.06),0_4px_12px_rgba(0,0,0,.08),0_12px_24px_rgba(0,0,0,.06)]';

const CHIP_CLASS =
  'typography-body-lg-semibold relative inline-flex h-9 items-center gap-1.5 rounded-circle transition-[scale,background-color,color] duration-fast ease-standard after:absolute after:-inset-x-0.5 after:-inset-y-1 active:scale-96';

const chipColorClass = (pressed: boolean) =>
  pressed ? 'bg-primary-black text-interactive-inverse' : 'bg-primary-white text-primary';

const chipCountClass = (pressed: boolean) =>
  cn(
    'font-semibold tabular-nums transition-colors duration-fast',
    pressed ? 'text-[#d4d4d8]' : 'text-tertiary',
  );

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
  /** 달력 개수를 셀 전시(검색어만 반영) */
  calendarExhibitions: Pick<NearbyDisplay, 'startDate' | 'endDate'>[];
  pickedDate: Date | null;
  pickedCount: number;
  onPickDate: (date: Date) => void;
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
  calendarExhibitions,
  pickedDate,
  pickedCount,
  onPickDate,
  showLocationNotice,
  onBack,
}: MapTopBarProps) {
  const calendarId = useId();
  const calendarChipRef = useRef<HTMLButtonElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(new Date()));

  useEffect(() => {
    if (!isCalendarOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (calendarRef.current?.contains(target) || calendarChipRef.current?.contains(target)) {
        return;
      }
      setIsCalendarOpen(false);
    };
    // 지도 화면의 ESC(선택 풀기)보다 먼저 달력만 닫는다
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      setIsCalendarOpen(false);
      calendarChipRef.current?.focus();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCalendarOpen]);

  const handleToggleCalendar = () => {
    // 고른 날이 있으면 그달을 펼친다
    if (!isCalendarOpen && pickedDate) setCalendarMonth(startOfMonth(pickedDate));
    setIsCalendarOpen(!isCalendarOpen);
  };

  const handlePickDate = (date: Date) => {
    setIsCalendarOpen(false);
    onPickDate(date);
  };

  const handleToggleStatus = (status: MapExhibitionStatus) => {
    setIsCalendarOpen(false);
    onToggleStatus(status);
  };

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
              onClick={() => handleToggleStatus(value)}
              className={cn(CHIP_CLASS, 'px-3.5', FLOAT_SHADOW, chipColorClass(pressed))}
            >
              <span>{label}</span>
              <b className={chipCountClass(pressed)}>{statusCounts[value]}</b>
            </button>
          );
        })}
        <button
          ref={calendarChipRef}
          type="button"
          aria-pressed={pickedDate !== null}
          aria-expanded={isCalendarOpen}
          aria-controls={isCalendarOpen ? calendarId : undefined}
          aria-label={
            pickedDate
              ? `${pickedDate.getMonth() + 1}월 ${pickedDate.getDate()}일 고름, 날짜 바꾸기`
              : '날짜 고르기'
          }
          onClick={handleToggleCalendar}
          className={cn(
            CHIP_CLASS,
            pickedDate ? 'pr-3.5 pl-3' : 'w-9 justify-center',
            FLOAT_SHADOW,
            chipColorClass(pickedDate !== null),
          )}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden
            className="size-4.5 shrink-0 fill-none stroke-current"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
          </svg>
          {pickedDate ? (
            <>
              <span className="tabular-nums">{formatPickedDate(pickedDate)}</span>
              <b className={chipCountClass(true)}>{pickedCount}</b>
            </>
          ) : null}
        </button>
      </div>

      {isCalendarOpen ? (
        <MapDateCalendar
          id={calendarId}
          panelRef={calendarRef}
          month={calendarMonth}
          onMonthChange={setCalendarMonth}
          exhibitions={calendarExhibitions}
          pickedDate={pickedDate}
          onPick={handlePickDate}
        />
      ) : null}
    </div>
  );
}
