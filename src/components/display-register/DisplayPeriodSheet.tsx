import { useState } from 'react';

import ChevronIcon from '@/assets/display-register/ChevronIcon.svg';
import { Overlay } from '@/components/ui';
import { cn } from '@/utils/cn';

import {
  buildMonthDays,
  type DateRange,
  formatDotDate,
  pickRangeDate,
  toIsoDate,
} from './displaySchedule';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const NAV_BUTTON_CLASS =
  'flex size-11 items-center justify-center rounded-circle transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent';

const toMonth = (isoDate: string | null) => {
  const date = isoDate ? new Date(`${isoDate}T00:00:00`) : new Date();
  return { year: date.getFullYear(), month: date.getMonth() };
};

interface DisplayPeriodSheetProps {
  open: boolean;
  initialRange: DateRange;
  onClose: () => void;
  onConfirm: (range: { start: string; end: string }) => void;
}

export function DisplayPeriodSheet({
  open,
  initialRange,
  onClose,
  onConfirm,
}: DisplayPeriodSheetProps) {
  const [range, setRange] = useState(initialRange);
  const [view, setView] = useState(() => toMonth(initialRange.start));
  const today = toIsoDate(new Date());
  const todayMonth = toMonth(null);
  const isFirstMonth = view.year === todayMonth.year && view.month === todayMonth.month;

  const moveMonth = (delta: number) =>
    setView(({ year, month }) => toMonth(toIsoDate(new Date(year, month + delta, 1))));

  const handleConfirm = () => {
    if (range.start && range.end) onConfirm({ start: range.start, end: range.end });
  };

  return (
    <Overlay
      open={open}
      onClose={onClose}
      title="전시 기간 선택"
      description={
        <span className="typography-body-md-medium text-secondary">
          시작일과 종료일을 차례로 선택해주세요
        </span>
      }
      footer={
        <button
          type="button"
          disabled={!range.start || !range.end}
          onClick={handleConfirm}
          className="typography-body-lg-semibold h-11 w-full rounded-12 bg-interactive-primary text-interactive-inverse transition duration-fast ease-standard hover:bg-interactive-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99 disabled:cursor-default disabled:bg-disable disabled:text-disable disabled:active:scale-100"
        >
          선택 완료
        </button>
      }
    >
      <div className="flex flex-col gap-3">
        <dl className="flex rounded-8 bg-secondary px-4 py-3">
          {(['start', 'end'] as const).map((key) => (
            <div key={key} className="flex min-w-0 flex-1 flex-col gap-0.5">
              <dt className="typography-body-md-medium text-secondary">
                {key === 'start' ? '시작일' : '종료일'}
              </dt>
              <dd
                className={cn(
                  'typography-body-lg-semibold',
                  range[key] ? 'text-primary' : 'text-tertiary',
                )}
              >
                {range[key] ? formatDotDate(range[key]) : '선택 전'}
              </dd>
            </div>
          ))}
        </dl>

        <div className="-mx-3 flex items-center justify-between">
          <button
            type="button"
            aria-label="이전 달"
            disabled={isFirstMonth}
            onClick={() => moveMonth(-1)}
            className={NAV_BUTTON_CLASS}
          >
            <img src={ChevronIcon} alt="" className="rotate-180" />
          </button>
          <p aria-live="polite" className="typography-body-lg-semibold text-primary">
            {view.year}년 {view.month + 1}월
          </p>
          <button
            type="button"
            aria-label="다음 달"
            onClick={() => moveMonth(1)}
            className={NAV_BUTTON_CLASS}
          >
            <img src={ChevronIcon} alt="" />
          </button>
        </div>

        <div className="grid grid-cols-7">
          {WEEKDAYS.map((weekday) => (
            <span
              key={weekday}
              aria-hidden="true"
              className="typography-body-md-medium flex h-8 items-center justify-center text-secondary"
            >
              {weekday}
            </span>
          ))}
          {buildMonthDays(view.year, view.month).map((date, index) => {
            if (!date) return <span key={`blank-${index}`} aria-hidden="true" />;

            const isEdge = date === range.start || date === range.end;
            const isBetween = Boolean(
              range.start && range.end && date > range.start && date < range.end,
            );
            const day = Number(date.slice(8));

            return (
              <button
                key={date}
                type="button"
                disabled={date < today}
                aria-pressed={isEdge}
                aria-label={`${view.month + 1}월 ${day}일${date === range.start ? ', 시작일' : ''}${date === range.end ? ', 종료일' : ''}`}
                onClick={() => setRange((prev) => pickRangeDate(prev, date))}
                className={cn(
                  'flex h-11 items-center justify-center tabular-nums transition-colors duration-fast ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-default disabled:text-disable',
                  isEdge
                    ? 'typography-body-lg-semibold rounded-8 bg-interactive-primary text-interactive-inverse'
                    : 'typography-body-lg-medium text-primary',
                  isBetween && 'bg-secondary',
                  !isEdge && !isBetween && 'rounded-8 enabled:hover:bg-secondary',
                )}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </Overlay>
  );
}
