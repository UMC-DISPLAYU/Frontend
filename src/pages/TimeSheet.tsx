import { useEffect, useRef, useState } from 'react';

import { BottomSheet } from './BottomSheet';

const SIZE = 288;
const C = SIZE / 2;
const pad = (n: number) => String(n).padStart(2, '0');

export interface TimeValue {
  hour: number;
  minute: number;
  period: 'AM' | 'PM';
  label: string;
}

interface TimeSheetProps {
  open: boolean;
  onClose: () => void;
  value?: TimeValue | null;
  onConfirm: (value: TimeValue) => void;
  subtitle?: string;
}

type Mode = 'hour' | 'minute';

export function TimeSheet({ open, onClose, value, onConfirm, subtitle }: TimeSheetProps) {
  const [hour, setHour] = useState(value?.hour ?? 9);
  const [minute, setMinute] = useState(value?.minute ?? 0);
  const [period, setPeriod] = useState<'AM' | 'PM'>(value?.period ?? 'AM');
  const [mode, setMode] = useState<Mode>('hour');

  const clockRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  // 열릴 때마다 외부 값과 동기화
  useEffect(() => {
    if (!open) return;
    setHour(value?.hour ?? 9);
    setMinute(value?.minute ?? 0);
    setPeriod(value?.period ?? 'AM');
    setMode('hour');
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const applyAngle = (clientX: number, clientY: number, which: Mode) => {
    const el = clockRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const ang = (Math.atan2(clientX - cx, -(clientY - cy)) * (180 / Math.PI) + 360) % 360;

    if (which === 'minute') {
      setMinute(Math.round(ang / 6) % 60);
    } else {
      const h = Math.round(ang / 30) % 12;
      setHour(h === 0 ? 12 : h);
    }
  };

  // window 에 붙여서 원 밖으로 나가도 드래그가 유지되게 한다
  useEffect(() => {
    if (!open) return;

    const move = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      e.preventDefault();
      applyAngle(e.clientX, e.clientY, mode);
    };
    const up = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      // 시침을 놓으면 자연스럽게 분침 조작으로 넘어간다
      setMode((m) => (m === 'hour' ? 'minute' : m));
    };

    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [open, mode]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    draggingRef.current = true;
    applyAngle(e.clientX, e.clientY, mode);
  };

  const hourAngle = (hour % 12) * 30 + minute * 0.5;
  const minuteAngle = minute * 6;

  const confirm = () => {
    onConfirm({ hour, minute, period, label: `${pad(hour)}:${pad(minute)} ${period}` });
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="시간 선택" subtitle={subtitle}>
      <div className="flex flex-col items-center gap-8 px-5 py-4">
        {/* 시계: 원 전체가 드래그 영역 */}
        <div
          ref={clockRef}
          onPointerDown={onPointerDown}
          className="bg-box200 relative cursor-pointer touch-none select-none rounded-full shadow-[inset_3px_4px_7px_-1px_rgba(166,166,166,0.25),inset_-4px_-1px_7px_1px_rgba(255,255,255,0.6)]"
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

        {/* 디지털 표시 — 탭해서 시/분 조작 대상 전환 */}
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => setMode('hour')}
            className={`text-[64px] leading-none ${mode === 'hour' ? 'text-main' : 'text-faint'}`}
          >
            {pad(hour)}
          </button>
          <span className="text-main text-[64px] leading-none">:</span>
          <button
            type="button"
            onClick={() => setMode('minute')}
            className={`text-[64px] leading-none ${mode === 'minute' ? 'text-main' : 'text-faint'}`}
          >
            {pad(minute)}
          </button>
          <button
            type="button"
            onClick={() => setPeriod((p) => (p === 'AM' ? 'PM' : 'AM'))}
            className="typo-body-xl-regular text-main pb-1"
          >
            {period}
          </button>
        </div>
      </div>

      <div className="bg-page sticky bottom-0 px-5 py-4">
        <button
          type="button"
          onClick={confirm}
          className="typo-body-sm-bold bg-dark text-white h-12 w-full rounded-xl"
        >
          선택 완료
        </button>
      </div>
    </BottomSheet>
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
