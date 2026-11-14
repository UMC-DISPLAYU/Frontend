import './displayHub.css';

import { useEffect, useId, useRef, useState } from 'react';

import type { DisplayContentOpenType } from '@/api/dto';
import { cn } from '@/utils/cn';

import { DisplayHubIcon } from './DisplayHubIcon';
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
  const valueId = useId();
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
    <div ref={containerRef} className="relative min-w-0">
      <span id={labelId} className="typography-body-md-semibold text-primary">
        {label}
      </span>
      {/* disabled 는 저장 중 포커스를 잃게 하므로 aria-disabled 로 막는다 */}
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={`${labelId} ${valueId}`}
        aria-disabled={disabled}
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev);
        }}
        className="typography-body-xl-regular mt-1 flex h-11 w-full items-center justify-between border-b border-primary text-left text-primary transition-colors duration-fast ease-standard focus:border-interactive-primary focus-visible:rounded-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus aria-disabled:cursor-default"
      >
        <span id={valueId} className="min-w-0 truncate">
          {selected.label}
        </span>
        <DisplayHubIcon name="selector" className="size-5" />
      </button>
      <p className="typography-body-md-medium mt-1.5 text-secondary">
        {value === 'IMMEDIATELY'
          ? '승인되면 바로 노출돼요'
          : `${formatDisplayHubMonthDay(startDate)}부터 노출돼요`}
      </p>

      {isOpen && (
        <div
          role="listbox"
          aria-labelledby={labelId}
          className="absolute top-[calc(100%+4px)] right-0 left-0 z-10 animate-[display-hub-pop_200ms_cubic-bezier(0.16,1,0.3,1)] rounded-12 border border-primary bg-primary-white py-1 shadow-[0_12px_32px_rgba(0,0,0,0.12)]"
        >
          {OPTIONS.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  setIsOpen(false);
                  triggerRef.current?.focus();
                  if (!isSelected) onChange(option.value);
                }}
                className={cn(
                  'flex h-12 w-full items-center justify-between px-3.5 text-left text-primary transition-colors duration-150 hover:bg-secondary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus',
                  isSelected
                    ? 'typography-body-xl-semibold bg-secondary'
                    : 'typography-body-xl-medium',
                )}
              >
                {option.label}
                {isSelected && <DisplayHubIcon name="check" className="size-4.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface DisplayHubVisibilityProps {
  artworkContentOpen: DisplayContentOpenType;
  exhibitionContentOpen: DisplayContentOpenType;
  startDate: string;
  disabled: boolean;
  className?: string;
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
  className,
  onChange,
}: DisplayHubVisibilityProps) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className={className}>
      <h2 id={headingId} className="typography-body-xl-semibold text-primary">
        공개 시점
      </h2>
      <div className="mt-3 grid grid-cols-2 gap-4 desktop:gap-8">
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
      <p className="typography-body-md-medium mt-4 text-tertiary">변경 사항은 자동으로 저장돼요</p>
    </section>
  );
}
