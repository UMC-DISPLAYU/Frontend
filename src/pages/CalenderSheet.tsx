import { useMemo, useState } from 'react';

import { BottomSheet } from './BottomSheet';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const MONTHS_TO_SHOW = 12;

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: Date) => d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate();

function formatRange(start: Date | null, end: Date | null) {
  if (!start) return '';
  const s = `${start.getFullYear()}.${pad(start.getMonth() + 1)}.${pad(start.getDate())}`;
  if (!end) return s;
  const e = `${pad(end.getMonth() + 1)}.${pad(end.getDate())}`;
  return `${s}-${e}`;
}

function buildMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startOffset = first.getDay();
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(year, month, 1 - startOffset + i);
    cells.push({ date: d, inMonth: d.getMonth() === month });
  }
  return cells;
}

interface CalenderSheetProps {
  open: boolean;
  onClose: () => void;
  value?: { start: Date; end: Date; label: string } | null;
  onConfirm: (value: { start: Date; end: Date; label: string }) => void;
}

export function CalenderSheet({ open, onClose, value, onConfirm }: CalenderSheetProps) {
  const [start, setStart] = useState<Date | null>(value?.start ?? null);
  const [end, setEnd] = useState<Date | null>(value?.end ?? null);

  const base = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, []);

  const months = useMemo(
    () =>
      Array.from({ length: MONTHS_TO_SHOW }, (_, i) => {
        const d = new Date(base.getFullYear(), base.getMonth() + i, 1);
        return { year: d.getFullYear(), month: d.getMonth() };
      }),
    [base],
  );

  const handlePick = (d: Date) => {
    if (!start || (start && end)) {
      setStart(d);
      setEnd(null);
    } else if (ymd(d) < ymd(start)) {
      setStart(d);
    } else if (ymd(d) === ymd(start)) {
      setEnd(d);
    } else {
      setEnd(d);
    }
  };

  const inRange = (d: Date) => {
    if (!start) return false;
    const last = end ?? start;
    return ymd(d) >= ymd(start) && ymd(d) <= ymd(last);
  };
  const isEdge = (d: Date) =>
    (start && ymd(d) === ymd(start)) || (end && ymd(d) === ymd(end));

  const confirm = () => {
    if (!start) return;
    onConfirm({ start, end: end ?? start, label: formatRange(start, end) });
    onClose();
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="날짜 선택"
      subtitle={formatRange(start, end) || '날짜를 선택하세요'}
    >
      <div className="flex flex-col gap-6 px-5 pb-4">
        {/* 요일 헤더 (고정) */}
        <div className="grid grid-cols-7">
          {WEEKDAYS.map((w) => (
            <div key={w} className="typo-body-xs-regular py-1 text-center text-faint">
              {w}
            </div>
          ))}
        </div>

        {months.map(({ year, month }) => (
          <div key={`${year}-${month}`} className="flex flex-col gap-2">
            <div className="typo-body-sm-semibold text-center text-main">
              {year} {month + 1}월
            </div>
            <div className="grid grid-cols-7 gap-y-1">
              {buildMonthGrid(year, month).map(({ date, inMonth }, i) => {
                const active = inRange(date);
                const edge = isEdge(date);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handlePick(date)}
                    className="flex h-9 items-center justify-center"
                  >
                    <span
                      className={[
                        'flex size-8 items-center justify-center rounded-full typo-body-sm-regular',
                        edge
                          ? 'bg-dark text-white'
                          : active
                            ? 'bg-box200 text-main'
                            : inMonth
                              ? 'text-main'
                              : 'text-faint',
                      ].join(' ')}
                    >
                      {date.getDate()}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 확인 바 */}
      <div className="sticky bottom-0 bg-page px-5 py-4">
        <button
          type="button"
          disabled={!start}
          onClick={confirm}
          className="typo-body-sm-bold h-12 w-full rounded-xl bg-dark text-white disabled:opacity-40"
        >
          선택 완료
        </button>
      </div>
    </BottomSheet>
  );
}
