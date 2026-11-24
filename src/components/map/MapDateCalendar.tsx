import { type PointerEvent, type RefObject, useMemo, useRef } from 'react';

import type { NearbyDisplay } from '@/hooks/queries/useMapDisplays';
import { cn } from '@/utils/cn';

import {
  addMonths,
  type CalendarDay,
  formatMonthTitle,
  getCalendarDays,
  isSameDay,
  WEEKDAY_LABELS,
} from './mapCalendar';

const SWIPE_MIN_PX = 48;

const HEAT_CLASS: Record<CalendarDay['level'], string> = {
  0: 'bg-primary-white',
  1: 'bg-secondary',
  2: 'bg-[#e4e4e7]',
  3: 'bg-[#d4d4d8]',
  4: 'bg-[#a1a1aa] [&>em]:text-primary',
};

// 오늘은 검은 테두리, 고른 날은 검은 칸, 지난 날은 흐리게 하고 개수를 숨긴다
const getDayStateClass = (day: CalendarDay, pressed: boolean) => {
  if (day.isPast) return 'bg-primary-white text-[#d4d4d8] [&>em]:invisible';
  if (pressed) return 'bg-[#18181b] text-interactive-inverse [&>em]:text-interactive-inverse';
  return cn(
    'text-primary',
    HEAT_CLASS[day.level],
    day.isToday ? 'shadow-[inset_0_0_0_1.5px_#18181b]' : 'hover:shadow-[inset_0_0_0_1px_#71717b]',
  );
};

interface MapDateCalendarProps {
  id: string;
  panelRef: RefObject<HTMLDivElement>;
  month: Date;
  onMonthChange: (month: Date) => void;
  exhibitions: Pick<NearbyDisplay, 'startDate' | 'endDate'>[];
  pickedDate: Date | null;
  onPick: (date: Date) => void;
}

export function MapDateCalendar({
  id,
  panelRef,
  month,
  onMonthChange,
  exhibitions,
  pickedDate,
  onPick,
}: MapDateCalendarProps) {
  const days = useMemo(() => getCalendarDays(month, exhibitions), [month, exhibitions]);
  const swipeRef = useRef<{ x: number; y: number; pointerId: number } | null>(null);

  // 손가락으로 옆으로 밀면 달을 넘긴다(프로토타입). 마우스는 버튼으로만 넘긴다
  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') return;
    swipeRef.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = swipeRef.current;
    if (!start || start.pointerId !== event.pointerId) return;
    swipeRef.current = null;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy) * 1.5) {
      onMonthChange(addMonths(month, dx < 0 ? 1 : -1));
    }
  };

  return (
    <div
      id={id}
      ref={panelRef}
      role="dialog"
      aria-label="날짜 고르기"
      className="pointer-events-auto w-[min(344px,100%)] origin-[24px_0] justify-self-start rounded-20 bg-primary-white px-4 py-1 shadow-[0_1px_2px_rgba(0,0,0,.06),0_4px_12px_rgba(0,0,0,.08),0_12px_24px_rgba(0,0,0,.06)] transition-[opacity,translate,scale] duration-fast ease-standard starting:-translate-y-1 starting:scale-98 starting:opacity-0"
    >
      <div className="flex h-11 items-center">
        <span className="typography-body-xl-semibold text-primary tabular-nums">
          {formatMonthTitle(month)}
        </span>
        <span className="-mr-2.5 ml-auto flex">
          <button
            type="button"
            aria-label="이전 달"
            onClick={() => onMonthChange(addMonths(month, -1))}
            className="grid size-11 place-items-center rounded-circle text-primary transition-[scale,background-color] duration-fast ease-standard hover:bg-secondary active:scale-96"
          >
            <svg viewBox="0 0 24 24" aria-hidden className="size-6 fill-none stroke-current">
              <path
                d="m15 5-7 7 7 7"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            aria-label="다음 달"
            onClick={() => onMonthChange(addMonths(month, 1))}
            className="grid size-11 place-items-center rounded-circle text-primary transition-[scale,background-color] duration-fast ease-standard hover:bg-secondary active:scale-96"
          >
            <svg viewBox="0 0 24 24" aria-hidden className="size-6 fill-none stroke-current">
              <path
                d="m9 5 7 7-7 7"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </span>
      </div>

      <div
        aria-hidden
        className="typography-body-sm-medium grid h-6 grid-cols-7 items-center text-center text-tertiary"
      >
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="grid touch-pan-y grid-cols-7 gap-1 pb-3"
      >
        {days.map((day) => {
          const pressed = pickedDate !== null && isSameDay(day.date, pickedDate);
          return (
            <button
              key={day.date.getTime()}
              type="button"
              aria-pressed={pressed}
              aria-hidden={day.inMonth ? undefined : true}
              tabIndex={day.inMonth ? undefined : -1}
              disabled={day.isPast}
              aria-label={`${day.date.getMonth() + 1}월 ${day.date.getDate()}일, 열린 전시 ${day.count}`}
              onClick={() => onPick(day.date)}
              className={cn(
                'flex h-10 flex-col items-center justify-center rounded-4 transition-[background-color,color] duration-fast',
                !day.inMonth && 'invisible',
                getDayStateClass(day, pressed),
              )}
            >
              <b className="typography-body-lg-medium tabular-nums">{day.date.getDate()}</b>
              <em className="typography-body-sm-semibold min-h-3.5 text-tertiary not-italic tabular-nums">
                {day.count || ''}
              </em>
            </button>
          );
        })}
      </div>
    </div>
  );
}
