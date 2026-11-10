import { useEffect, useRef, useState } from 'react';

import { Check } from 'lucide-react';

import SelectorIcon from '@/assets/display-register/SelectorIcon.svg';
import { EXHIBITION_TYPE_LABELS } from '@/constants/exhibition';
import { cn } from '@/utils/cn';

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
          'flex w-full items-center gap-2 border-b py-3 text-left transition duration-fast ease-standard focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
          isOpen ? 'border-interactive-primary' : 'border-primary',
        )}
      >
        <span
          className={cn(
            'typography-body-xl-regular min-w-0 flex-1',
            value || isOpen ? 'text-primary' : 'text-tertiary',
          )}
        >
          {value || '전시 유형'}
        </span>
        <img src={SelectorIcon} alt="" className="size-6 shrink-0" />
      </button>
      {isOpen && (
        <div
          role="listbox"
          aria-labelledby={labelId}
          className="absolute inset-x-0 top-full z-10 mt-1.5 animate-fade-in overflow-hidden rounded-12 border border-primary bg-primary-white shadow-card"
        >
          {EXHIBITION_TYPE_LABELS.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={option === value}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
                triggerRef.current?.focus();
              }}
              className="typography-body-xl-regular flex h-13 w-full items-center gap-2 px-4 text-left text-primary transition duration-fast ease-standard hover:bg-secondary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus"
            >
              <span className="min-w-0 flex-1">{option}</span>
              {option === value && (
                <Check aria-hidden="true" className="size-4.5 shrink-0 text-icon-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
