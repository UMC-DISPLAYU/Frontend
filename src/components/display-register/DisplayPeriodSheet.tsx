import { useState } from 'react';

import { Overlay } from '@/components/ui';
import { cn } from '@/utils/cn';

import { BIG_BUTTON_CLASS } from './displayRegister.styles';
import { BackIcon, ChevronRightIcon } from './DisplayRegisterIcons';
import {
  buildMonthDays,
  type DateRange,
  formatDotDate,
  pickRangeDate,
  toIsoDate,
} from './displaySchedule';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const NAV_BUTTON_CLASS =
  'grid size-11 place-items-center rounded-circle text-primary transition-colors duration-fast hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus';

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
      showCloseButton={false}
      description={
        <span className="typography-body-md-medium block text-secondary">
          시작일과 종료일을 차례로 선택해주세요
        </span>
      }
      footer={
        <button
          type="button"
          disabled={!range.start || !range.end}
          onClick={handleConfirm}
          className={BIG_BUTTON_CLASS}
        >
          선택 완료
        </button>
      }
    >
      <div>
        <dl className="grid grid-cols-2 gap-3 rounded-12 bg-secondary px-4 py-3.5">
          {(['start', 'end'] as const).map((key) => {
            const label = key === 'start' ? '시작일' : '종료일';

            return (
              <div key={key} className="min-w-0">
                <dt className="typography-body-md-medium text-secondary">{label}</dt>
                <dd
                  className={cn(
                    'typography-body-lg-semibold mt-0.5 tabular-nums',
                    range[key] ? 'text-primary' : 'text-disable',
                  )}
                >
                  {range[key] ? formatDotDate(range[key]) : label}
                </dd>
              </div>
            );
          })}
        </dl>

        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            aria-label="이전 달"
            onClick={() => moveMonth(-1)}
            className={NAV_BUTTON_CLASS}
          >
            <BackIcon className="size-4.5" />
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
            <ChevronRightIcon className="size-4.5" />
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
                aria-pressed={isEdge}
                aria-label={`${view.month + 1}월 ${day}일${date === range.start ? ', 시작일' : ''}${date === range.end ? ', 종료일' : ''}`}
                onClick={() => setRange((prev) => pickRangeDate(prev, date))}
                className={cn(
                  'grid h-11 place-items-center tabular-nums transition-colors duration-[150ms] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
                  isEdge
                    ? 'typography-body-lg-semibold relative z-1 rounded-[10px] bg-[#18181b] text-base-white'
                    : 'typography-body-lg-medium text-primary',
                  isBetween && 'bg-secondary',
                  !isEdge && 'hover:rounded-[10px] hover:bg-[#f0f0f3]',
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
