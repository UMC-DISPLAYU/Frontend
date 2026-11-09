import { useEffect, useId, useRef, useState } from 'react';

import type { DisplayContentOpenType } from '@/api/dto';
import CheckIcon from '@/assets/display-hub/CheckIcon.svg';
import SelectorIcon from '@/assets/display-hub/SelectorIcon.svg';
import { cn } from '@/utils/cn';

import { formatDisplayHubMonthDay } from './displayHubStatus';

const OPTIONS: { label: string; value: DisplayContentOpenType }[] = [
  { label: '심사 승인 시', value: 'IMMEDIATELY' },
  { label: '전시 시작일', value: 'ON_EXHIBITION' },
];

interface VisibilityFieldProps {
  label: string;
  value: DisplayContentOpenType;
  startDate: string;
  disabled: boolean;
  onChange: (value: DisplayContentOpenType) => void;
}

function VisibilityField({ label, value, startDate, disabled, onChange }: VisibilityFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const labelId = useId();
  const selected = OPTIONS.find((option) => option.value === value) ?? OPTIONS[1];

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutside = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener('pointerdown', closeOnOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative flex min-w-0 flex-1 flex-col gap-1">
      <span id={labelId} className="typography-body-lg-semibold text-primary">
        {label}
      </span>
      {/* disabled 는 저장 중 포커스를 잃게 하므로 aria-disabled 로 막는다 */}
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-labelledby={labelId}
        aria-disabled={disabled}
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev);
        }}
        className={cn(
          'flex w-full items-center gap-2 border-b py-3 text-left transition-colors duration-fast ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-disabled:cursor-default',
          isOpen ? 'border-interactive-primary' : 'border-primary',
        )}
      >
        <span className="typography-body-xl-regular min-w-0 flex-1 truncate text-primary">
          {selected.label}
        </span>
        <img src={SelectorIcon} alt="" />
      </button>
      <p className="typography-body-md-medium text-secondary">
        {value === 'IMMEDIATELY'
          ? '승인되면 바로 노출돼요'
          : `${formatDisplayHubMonthDay(startDate)}부터 노출돼요`}
      </p>

      {isOpen && (
        <ul
          aria-labelledby={labelId}
          className="absolute top-full left-0 z-60 -mt-5 w-full animate-fade-in overflow-hidden rounded-12 border border-primary bg-primary-white shadow-card"
        >
          {OPTIONS.map((option) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value}>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    setIsOpen(false);
                    triggerRef.current?.focus();
                    if (!isSelected) onChange(option.value);
                  }}
                  className={cn(
                    'flex h-13 w-full items-center gap-2 px-4 text-left text-primary transition-colors duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus',
                    isSelected
                      ? 'typography-body-xl-semibold bg-secondary'
                      : 'typography-body-xl-regular',
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  {isSelected && <img src={CheckIcon} alt="" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

interface DisplayHubVisibilityProps {
  artworkContentOpen: DisplayContentOpenType;
  exhibitionContentOpen: DisplayContentOpenType;
  startDate: string;
  disabled: boolean;
  onChange: (next: {
    artworkContentOpen: DisplayContentOpenType;
    exhibitionContentOpen: DisplayContentOpenType;
  }) => void;
}

export function DisplayHubVisibility({
  artworkContentOpen,
  exhibitionContentOpen,
  startDate,
  disabled,
  onChange,
}: DisplayHubVisibilityProps) {
  return (
    <section aria-label="공개 시점" className="flex flex-col gap-3 pt-3">
      <h2 className="typography-body-xl-semibold text-primary">공개 시점</h2>
      <div className="flex items-start gap-3">
        <VisibilityField
          label="작품"
          value={artworkContentOpen}
          startDate={startDate}
          disabled={disabled}
          onChange={(value) => onChange({ artworkContentOpen: value, exhibitionContentOpen })}
        />
        <VisibilityField
          label="전시 콘텐츠"
          value={exhibitionContentOpen}
          startDate={startDate}
          disabled={disabled}
          onChange={(value) => onChange({ artworkContentOpen, exhibitionContentOpen: value })}
        />
      </div>
      <p className="typography-body-md-medium text-tertiary">변경 사항은 자동으로 저장돼요</p>
    </section>
  );
}
