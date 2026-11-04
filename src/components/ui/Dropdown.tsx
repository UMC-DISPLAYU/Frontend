import { useEffect, useId, useRef, useState } from 'react';

import sortIcon from '@/assets/icons/SortIcon.svg';
import { cn } from '@/utils/cn';

import { DropdownButton } from './DropdownButton';

export type DropdownOption = {
  label: string;
  value: string | null;
};

type DropdownProps = {
  placeholder: string;
  options: readonly DropdownOption[];
  selectedLabel: string;
  onSelect: (option: DropdownOption) => void;
  variant?: 'outlined' | 'plain';
};

export function Dropdown({
  placeholder,
  options,
  selectedLabel,
  onSelect,
  variant = 'outlined',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const isPlain = variant === 'plain';
  const hasValue = selectedLabel !== options[0]?.label;

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const toggle = () => setIsOpen((prev) => !prev);

  return (
    <div className="relative" ref={containerRef}>
      {isPlain ? (
        <button
          aria-controls={menuId}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          className="flex h-5.25 cursor-pointer items-center gap-2"
          onClick={toggle}
          type="button"
        >
          <span className="typography-body-md-medium whitespace-nowrap text-primary-400">
            {selectedLabel}
          </span>
          <img alt="" className="size-3.5 shrink-0" src={sortIcon} />
        </button>
      ) : (
        <DropdownButton
          aria-controls={menuId}
          aria-haspopup="listbox"
          hasValue={hasValue}
          label={hasValue ? selectedLabel : placeholder}
          onClick={toggle}
          open={isOpen}
        />
      )}

      {isOpen ? (
        <ul
          className={cn(
            'absolute top-full z-30 mt-1 flex min-w-full flex-col gap-1 rounded-12 border border-icon-tertiary bg-primary-white p-1.5',
            isPlain ? 'right-0' : 'left-0',
          )}
          id={menuId}
          role="listbox"
        >
          {options.map((option) => {
            const isSelected = option.label === selectedLabel;
            return (
              <li key={option.label}>
                <button
                  aria-selected={isSelected}
                  className={cn(
                    'typography-body-md-medium w-full cursor-pointer rounded-8 px-3 py-2 text-left whitespace-nowrap',
                    isSelected ? 'bg-tertiary text-primary' : 'bg-primary-white text-primary-400',
                  )}
                  onClick={() => {
                    onSelect(option);
                    setIsOpen(false);
                  }}
                  role="option"
                  type="button"
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
