import { useEffect, useRef, useState } from 'react';

import { EXHIBITION_TYPE_LABELS } from '@/constants/exhibition';
import { cn } from '@/utils/cn';

import { FOCUS_CLASS } from './displayRegister.styles';
import { CheckIcon, UpDownIcon } from './DisplayRegisterIcons';

interface DisplayTypeSelectProps {
  labelId: string;
  value: string;
  onChange: (value: (typeof EXHIBITION_TYPE_LABELS)[number]) => void;
}

export function DisplayTypeSelect({ labelId, value, onChange }: DisplayTypeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={labelId}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'mt-1 flex h-[49px] w-full items-center justify-between border-b border-primary text-left transition-colors duration-fast ease-standard focus-within:border-[#18181b]',
          FOCUS_CLASS,
        )}
      >
        <span
          className={cn(
            'typography-body-xl-regular min-w-0 truncate',
            value ? 'text-primary' : 'text-tertiary',
          )}
        >
          {value || '전시 유형'}
        </span>
        <UpDownIcon className="size-5 shrink-0 text-primary" />
      </button>
      {isOpen && (
        <div
          role="listbox"
          aria-labelledby={labelId}
          className="absolute inset-x-0 top-[calc(100%+6px)] z-10 rounded-12 transition-[opacity,translate] duration-fast ease-standard starting:-translate-y-1 starting:opacity-0 border border-primary bg-primary-white py-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.1)]"
        >
          {EXHIBITION_TYPE_LABELS.map((option) => {
            const isSelected = option === value;

            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                  triggerRef.current?.focus();
                }}
                className="typography-body-xl-medium flex h-12 w-full items-center justify-between px-4 text-left text-primary transition-colors duration-[150ms] hover:bg-secondary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus"
              >
                {option}
                <CheckIcon className={cn('size-4.5', !isSelected && 'invisible')} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
