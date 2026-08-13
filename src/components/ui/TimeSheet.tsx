import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { BottomSheet } from '@/components/ui/BottomSheet';

const pad = (n: number) => String(n).padStart(2, '0');
const clampHour = (n: number) => Math.min(23, Math.max(0, n));
const clampMinute = (n: number) => Math.min(59, Math.max(0, n));

export interface TimeRangeValue {
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  /** "09:00 - 18:00" */
  label: string;
}

/** 조작 대상 필드 */
type Field = 'startHour' | 'startMinute' | 'endHour' | 'endMinute';

interface TimeSheetProps {
  open: boolean;
  onClose: () => void;
  value?: TimeRangeValue | null;
  onConfirm: (value: TimeRangeValue) => void;
  /** 헤더 아래 보조 문구 (예: "09:00-18:00") */
  subtitle?: string;
  /** 하단 날짜 표기 (예: "27 Jul, 2026") */
  dateLabel?: string;
}

export function TimeSheet({
  open,
  onClose,
  value,
  onConfirm,
  subtitle,
  dateLabel,
}: TimeSheetProps) {
  const [time, setTime] = useState({
    startHour: value?.startHour ?? 9,
    startMinute: value?.startMinute ?? 0,
    endHour: value?.endHour ?? 18,
    endMinute: value?.endMinute ?? 0,
  });
  const [field, setField] = useState<Field>('startHour');

  /** 직접 입력 중인 숫자 버퍼 ("1" -> "18") */
  const bufferRef = useRef('');
  const inputRef = useRef<HTMLInputElement>(null);
  const prevOpenRef = useRef(open);

  const enforceTimeOrder = (t: typeof time, activeField: Field) => {
    const s = t.startHour * 60 + t.startMinute;
    const e = t.endHour * 60 + t.endMinute;
    if (s > e) {
      if (activeField.startsWith('start')) {
        return { ...t, endHour: t.startHour, endMinute: t.startMinute };
      } else {
        return { ...t, startHour: t.endHour, startMinute: t.endMinute };
      }
    }
    return t;
  };

  // 열릴 때마다 외부 값과 동기화
  useEffect(() => {
    // open이 false -> true로 변경될 때만 초기화
    if (open && !prevOpenRef.current) {
      setTime({
        startHour: value?.startHour ?? 9,
        startMinute: value?.startMinute ?? 0,
        endHour: value?.endHour ?? 18,
        endMinute: value?.endMinute ?? 0,
      });
      setField('startHour');
      bufferRef.current = '';
      inputRef.current?.focus({ preventScroll: true });
    }
    prevOpenRef.current = open;
  }, [open, value]);

  useLayoutEffect(() => {
    if (open) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [open]);

  const isHourField = field === 'startHour' || field === 'endHour';

  const hourKey: Field = field.startsWith('start') ? 'startHour' : 'endHour';
  const minuteKey: Field = field.startsWith('start') ? 'startMinute' : 'endMinute';

  /* ---------------- 숫자 직접 입력 ---------------- */

  const commitDigit = (digit: string) => {
    const next = (bufferRef.current + digit).slice(-2);
    const max = isHourField ? 23 : 59;
    let n = Number(next);

    // "9" 입력 후 "5" 를 누르면 95 가 되므로 두 번째 자리부터 다시 시작
    if (n > max) {
      bufferRef.current = digit;
      n = Number(digit);
    } else {
      bufferRef.current = next;
    }

    const key = isHourField ? hourKey : minuteKey;
    setTime((t) =>
      enforceTimeOrder({ ...t, [key]: isHourField ? clampHour(n) : clampMinute(n) }, field),
    );

    // 두 자리를 채웠으면 다음 필드로 자동 이동
    if (bufferRef.current.length === 2) {
      bufferRef.current = '';
      setField((f) =>
        f === 'startHour'
          ? 'startMinute'
          : f === 'startMinute'
            ? 'endHour'
            : f === 'endHour'
              ? 'endMinute'
              : f,
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (/^\d$/.test(e.key)) {
      e.preventDefault();
      commitDigit(e.key);
      return;
    }
    if (e.key === 'Backspace') {
      e.preventDefault();
      bufferRef.current = '';
      const key = isHourField ? hourKey : minuteKey;
      setTime((t) => enforceTimeOrder({ ...t, [key]: 0 }, field));
      return;
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      bufferRef.current = '';
      const delta = e.key === 'ArrowUp' ? 1 : -1;
      const key = isHourField ? hourKey : minuteKey;
      const mod = isHourField ? 24 : 60;
      setTime((t) => enforceTimeOrder({ ...t, [key]: (t[key] + delta + mod) % mod }, field));
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const selectField = (nextField: Field) => {
    bufferRef.current = '';
    setField(nextField);
    focusInput();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digit = e.currentTarget.value.replace(/\D/g, '').slice(-1);
    e.currentTarget.value = '';

    if (digit) {
      commitDigit(digit);
    }
  };

  const label = `${pad(time.startHour)}:${pad(time.startMinute)} - ${pad(time.endHour)}:${pad(time.endMinute)}`;

  const confirm = () => {
    onConfirm({ ...time, label });
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="시간 선택" subtitle={subtitle ?? label}>
      <div className="flex min-w-0 flex-col items-center gap-10 px-5 py-13">
        {/* 디지털 표시 — 탭해서 대상 전환 + 숫자 직접 입력 */}
        <div className="flex w-full min-w-0 flex-col items-center gap-3">
          <div
            role="group"
            tabIndex={0}
            onClick={focusInput}
            onKeyDown={handleKeyDown}
            className="relative flex w-full min-w-0 items-center justify-center gap-[clamp(0.125rem,1.7vw,0.5rem)] outline-none"
          >
            <input
              ref={inputRef}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              aria-label="운영시간 숫자 입력"
              className="absolute left-1/2 top-1/2 size-px -translate-x-1/2 -translate-y-1/2 opacity-0"
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
            <Segment
              value={time.startHour}
              active={field === 'startHour'}
              onSelect={() => selectField('startHour')}
            />
            <Colon />
            <Segment
              value={time.startMinute}
              active={field === 'startMinute'}
              onSelect={() => selectField('startMinute')}
            />

            <span className="px-0.5 text-[clamp(2rem,11vw,3rem)] leading-none text-main">-</span>

            <Segment
              value={time.endHour}
              active={field === 'endHour'}
              onSelect={() => selectField('endHour')}
            />
            <Colon />
            <Segment
              value={time.endMinute}
              active={field === 'endMinute'}
              onSelect={() => selectField('endMinute')}
            />
          </div>

          {dateLabel && <span className="typo-body-sm-regular text-sub">{dateLabel}</span>}
        </div>
      </div>

      <div className="bg-page sticky bottom-0 px-5 pt-4">
        <button
          type="button"
          onClick={confirm}
          className="typo-body-sm-bold bg-dark h-12 w-full rounded-xl text-white"
        >
          선택 완료
        </button>
      </div>
    </BottomSheet>
  );
}

function Colon() {
  return <span className="text-[clamp(2.5rem,14vw,3.75rem)] leading-none text-main">:</span>;
}

/** 두 자리 숫자 한 칸 */
function Segment({
  value,
  active,
  onSelect,
}: {
  value: number;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`min-w-0 rounded-lg px-0.5 text-[clamp(2.5rem,14vw,3.75rem)] leading-none transition-colors ${
        active ? 'text-main bg-box200' : 'text-main'
      }`}
    >
      {pad(value)}
    </button>
  );
}
