import { useCallback, useEffect, useRef, useState } from 'react';

import { BottomSheet } from '@/components/ui/BottomSheet';

const SIZE = 288;
const C = SIZE / 2;
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

  const clockRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  /** 직접 입력 중인 숫자 버퍼 ("1" -> "18") */
  const bufferRef = useRef('');
  const prevOpenRef = useRef(open);

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
    }
    prevOpenRef.current = open;
  }, [open, value]);

  const isHourField = field === 'startHour' || field === 'endHour';
  const activeHour = field.startsWith('start') ? time.startHour : time.endHour;
  const activeMinute = field.startsWith('start') ? time.startMinute : time.endMinute;

  const hourKey: Field = field.startsWith('start') ? 'startHour' : 'endHour';
  const minuteKey: Field = field.startsWith('start') ? 'startMinute' : 'endMinute';

  /* ---------------- 시계 드래그 ---------------- */

  const applyAngle = useCallback(
    (clientX: number, clientY: number) => {
      const el = clockRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const ang = (Math.atan2(clientX - cx, -(clientY - cy)) * (180 / Math.PI) + 360) % 360;

      bufferRef.current = '';

      if (isHourField) {
        const h12 = Math.round(ang / 30) % 12; // 0 ~ 11
        // 현재 오전/오후 구간을 유지한 채 12시간 눈금만 반영
        const isPm = activeHour >= 12;
        setTime((t) => ({ ...t, [hourKey]: isPm ? h12 + 12 : h12 }));
      } else {
        setTime((t) => ({ ...t, [minuteKey]: Math.round(ang / 6) % 60 }));
      }
    },
    [isHourField, activeHour, hourKey, minuteKey],
  );

  // window 에 붙여서 원 밖으로 나가도 드래그가 유지되게 한다
  useEffect(() => {
    if (!open) return;

    const move = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      e.preventDefault();
      applyAngle(e.clientX, e.clientY);
    };
    const up = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      // 시침을 놓으면 자연스럽게 분침 조작으로 넘어간다
      setField((f) => (f === 'startHour' ? 'startMinute' : f === 'endHour' ? 'endMinute' : f));
    };

    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [open, applyAngle]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    draggingRef.current = true;
    applyAngle(e.clientX, e.clientY);
  };

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
    setTime((t) => ({ ...t, [key]: isHourField ? clampHour(n) : clampMinute(n) }));

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
      setTime((t) => ({ ...t, [key]: 0 }));
      return;
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      bufferRef.current = '';
      const delta = e.key === 'ArrowUp' ? 1 : -1;
      const key = isHourField ? hourKey : minuteKey;
      const mod = isHourField ? 24 : 60;
      setTime((t) => ({ ...t, [key]: (t[key] + delta + mod) % mod }));
    }
  };

  /* ---------------- 바늘 각도 ---------------- */

  const hourAngle = (activeHour % 12) * 30 + activeMinute * 0.5;
  const minuteAngle = activeMinute * 6;

  const label = `${pad(time.startHour)}:${pad(time.startMinute)} - ${pad(time.endHour)}:${pad(time.endMinute)}`;

  const confirm = () => {
    onConfirm({ ...time, label });
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="시간 선택" subtitle={subtitle ?? label}>
      <div className="flex flex-col items-center gap-10 px-5 pb-4 pt-6">
        {/* 시계: 원 전체가 드래그 영역 */}
        <div
          ref={clockRef}
          onPointerDown={onPointerDown}
          className="bg-box200 relative cursor-pointer touch-none select-none rounded-full shadow-[-4px_-5px_14px_0px_rgba(255,255,255,0.5),5px_5px_14px_0px_rgba(67,0,209,0.05),inset_3px_5px_7px_-1px_rgba(166,166,166,0.25),inset_-4px_-1px_7px_1px_rgba(255,255,255,0.5)]"
          style={{ width: SIZE, height: SIZE }}
        >
          {[0, 90, 180, 270].map((deg) => (
            <div
              key={deg}
              className="border-faint absolute left-1/2 top-1/2 w-7 origin-left border-t"
              style={{ transform: `rotate(${deg}deg) translateX(${C - 30}px)` }}
            />
          ))}

          {/* 시침 */}
          <Hand angle={hourAngle} length={C * 0.5} width={6} className="bg-main" />
          {/* 분침 */}
          <Hand angle={minuteAngle} length={C * 0.78} width={4} className="bg-link" />

          <div className="bg-link outline-card absolute left-1/2 top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full outline outline-[3px]" />
        </div>

        {/* 디지털 표시 — 탭해서 대상 전환 + 숫자 직접 입력 */}
        <div className="flex flex-col items-center gap-3">
          <div
            role="group"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            className="flex items-center justify-center gap-2 outline-none"
          >
            <Segment
              value={time.startHour}
              active={field === 'startHour'}
              onSelect={() => {
                bufferRef.current = '';
                setField('startHour');
              }}
            />
            <Colon />
            <Segment
              value={time.startMinute}
              active={field === 'startMinute'}
              onSelect={() => {
                bufferRef.current = '';
                setField('startMinute');
              }}
            />

            <span className="text-main px-1 text-5xl leading-none">-</span>

            <Segment
              value={time.endHour}
              active={field === 'endHour'}
              onSelect={() => {
                bufferRef.current = '';
                setField('endHour');
              }}
            />
            <Colon />
            <Segment
              value={time.endMinute}
              active={field === 'endMinute'}
              onSelect={() => {
                bufferRef.current = '';
                setField('endMinute');
              }}
            />
          </div>

          {dateLabel && <span className="typo-body-sm-regular text-sub">{dateLabel}</span>}
        </div>
      </div>

      <div className="bg-page sticky bottom-0 px-5 py-4">
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
  return <span className="text-main text-6xl leading-none">:</span>;
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
      className={`rounded-lg px-0.5 text-6xl leading-none transition-colors ${
        active ? 'text-main bg-box200' : 'text-main'
      }`}
    >
      {pad(value)}
    </button>
  );
}

/** 중심을 기준으로 회전하는 바늘 */
function Hand({
  angle,
  length,
  width,
  className,
}: {
  angle: number;
  length: number;
  width: number;
  className: string;
}) {
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2"
      style={{
        width,
        height: length,
        transform: `translate(-50%, -100%) rotate(${angle}deg)`,
        transformOrigin: '50% 100%',
      }}
    >
      <div className={`h-full w-full rounded-full ${className}`} />
    </div>
  );
}
