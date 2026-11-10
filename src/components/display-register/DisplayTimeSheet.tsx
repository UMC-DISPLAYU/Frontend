import { type KeyboardEvent, useEffect, useId, useRef, useState } from 'react';

import { Overlay } from '@/components/ui';
import { toast } from '@/stores/toastStore';
import { cn } from '@/utils/cn';

import { isValidTimeRange, TIME_OPTIONS } from './displaySchedule';

const DEFAULT_START = '10:00';
const DEFAULT_END = '18:00';
/* 목록 높이 240px, 항목 48px. 위아래 96px 여백이 있어야 첫 · 끝 항목도 가운데에 온다 */
const CENTER_OFFSET = 96;

function TimeColumn({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const labelId = useId();
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToValue = (time: string, behavior: ScrollBehavior) => {
    const option = listRef.current?.querySelector<HTMLElement>(`[data-time="${time}"]`);
    if (option) listRef.current?.scrollTo({ top: option.offsetTop - CENTER_OFFSET, behavior });
  };

  useEffect(() => {
    scrollToValue(value, 'auto');
    // 열릴 때 한 번만 가운데로 맞춘다. 이후 이동은 선택할 때 처리한다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const select = (time: string) => {
    onChange(time);
    scrollToValue(time, 'smooth');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();

    const next = TIME_OPTIONS.indexOf(value) + (event.key === 'ArrowDown' ? 1 : -1);
    if (next >= 0 && next < TIME_OPTIONS.length) select(TIME_OPTIONS[next]);
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <p id={labelId} className="typography-body-md-semibold text-primary">
        {label}
      </p>
      <div
        ref={listRef}
        role="listbox"
        tabIndex={0}
        aria-labelledby={labelId}
        aria-activedescendant={`${labelId}-${value}`}
        onKeyDown={handleKeyDown}
        className="relative h-60 snap-y snap-mandatory overflow-y-auto overscroll-contain py-24 [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus [&::-webkit-scrollbar]:hidden"
      >
        {TIME_OPTIONS.map((time) => {
          const isSelected = time === value;

          return (
            <div
              key={time}
              id={`${labelId}-${time}`}
              role="option"
              aria-selected={isSelected}
              data-time={time}
              onClick={() => select(time)}
              className={cn(
                'flex h-12 cursor-pointer snap-center items-center justify-center rounded-8 tabular-nums transition-colors duration-fast ease-standard',
                isSelected
                  ? 'typography-body-lg-semibold bg-secondary text-primary'
                  : 'typography-body-lg-medium text-secondary hover:bg-secondary',
              )}
            >
              {time}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface DisplayTimeSheetProps {
  open: boolean;
  initialStart: string;
  initialEnd: string;
  onClose: () => void;
  onConfirm: (range: { start: string; end: string }) => void;
}

export function DisplayTimeSheet({
  open,
  initialStart,
  initialEnd,
  onClose,
  onConfirm,
}: DisplayTimeSheetProps) {
  const [start, setStart] = useState(initialStart || DEFAULT_START);
  const [end, setEnd] = useState(initialEnd || DEFAULT_END);

  const handleConfirm = () => {
    if (!isValidTimeRange(start, end)) {
      toast('종료 시간은 시작 시간보다 늦어야 해요');
      return;
    }

    onConfirm({ start, end });
  };

  return (
    <Overlay
      open={open}
      onClose={onClose}
      title="운영 시간 선택"
      description={
        <span className="typography-body-md-medium text-secondary">
          일반적인 관람 시작·종료 시간을 선택해주세요
        </span>
      }
      footer={
        <button
          type="button"
          onClick={handleConfirm}
          className="typography-body-lg-semibold h-11 w-full rounded-12 bg-interactive-primary text-interactive-inverse transition duration-fast ease-standard hover:bg-interactive-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus active:scale-99"
        >
          선택 완료
        </button>
      }
    >
      <div className="flex gap-3">
        <TimeColumn label="시작 시간" value={start} onChange={setStart} />
        <TimeColumn label="종료 시간" value={end} onChange={setEnd} />
      </div>
    </Overlay>
  );
}
