import { type KeyboardEvent, useEffect, useId, useRef, useState } from 'react';

import { cn } from '@/utils/cn';

import { ExploreChevronIcon } from './ExploreIcons';
import type { ExploreOption } from './exploreOptions';

type ExploreFilterMenuProps = {
  /** chip: 전시 유형 · 전시 상태 칩 / sort: 결과 위 정렬 글자 버튼 */
  variant: 'chip' | 'sort';
  /** 칩에 아무것도 고르지 않았을 때 보이는 이름이자 메뉴 이름 */
  label: string;
  options: readonly ExploreOption[];
  selectedLabel: string;
  onSelect: (option: ExploreOption) => void;
};

export function ExploreFilterMenu({
  variant,
  label,
  options,
  selectedLabel,
  onSelect,
}: ExploreFilterMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();

  const isChip = variant === 'chip';
  const isApplied = isChip && selectedLabel !== options[0]?.label;
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.label === selectedLabel),
  );

  useEffect(() => {
    if (!isOpen) return;

    itemRefs.current[selectedIndex]?.focus();

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
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
    // 열릴 때만 고른 항목으로 포커스를 옮긴다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const current = itemRefs.current.findIndex((item) => item === document.activeElement);
    const step = event.key === 'ArrowDown' ? 1 : options.length - 1;
    itemRefs.current[(current + step) % options.length]?.focus();
  };

  return (
    <div className={cn('relative', !isChip && 'ml-auto')} ref={containerRef}>
      <button
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={cn(
          'typography-body-md-medium relative flex cursor-pointer items-center whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#18181b]',
          // 보이는 크기는 그대로 두고 누르는 영역만 44px 로 넓힌다
          'after:absolute after:inset-x-0',
          isChip
            ? 'h-9 gap-1 rounded-full border pr-3 pl-3.5 transition-[background-color,border-color,color,scale] duration-200 after:-inset-y-1 active:scale-96'
            : 'h-8 gap-0.5 pl-2 text-[#18181b] transition-colors duration-200 after:-inset-y-1.5',
          isChip &&
            (isApplied
              ? 'border-[#18181b] bg-[#18181b] text-[#fff]'
              : isOpen
                ? 'border-[#18181b] bg-[#fff] text-[#18181b]'
                : 'border-[#d4d4d8] bg-[#fff] text-[#18181b] [@media(hover:hover)]:hover:border-[#71717b]'),
        )}
        onClick={() => setIsOpen((prev) => !prev)}
        ref={triggerRef}
        type="button"
      >
        {isApplied || !isChip ? selectedLabel : label}
        <ExploreChevronIcon
          className={cn(
            'size-4.5 shrink-0 transition-transform duration-250 ease-standard',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      {isOpen ? (
        <div
          aria-label={label}
          className={cn(
            'absolute top-11 z-40 min-w-[168px] transition-[opacity,translate,scale] duration-220 ease-standard starting:-translate-y-1 starting:scale-98 starting:opacity-0 rounded-[12px] border border-[#f0f0f3] bg-[#fff] p-2 shadow-[0_5px_50px_rgba(0,0,0,0.1)]',
            isChip ? 'left-0 origin-top-left' : 'right-0 origin-top-right',
          )}
          id={menuId}
          onKeyDown={handleMenuKeyDown}
          role="menu"
        >
          {options.map((option, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                aria-checked={isSelected}
                className={cn(
                  'flex h-[42px] w-full cursor-pointer items-center rounded-[8px] px-3 text-left whitespace-nowrap text-[#18181b] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#18181b]',
                  isSelected
                    ? 'typography-body-lg-semibold bg-[#f0f0f3]'
                    : 'typography-body-lg-medium [@media(hover:hover)]:hover:bg-[#f4f4f5]',
                )}
                key={option.label}
                onClick={() => {
                  onSelect(option);
                  setIsOpen(false);
                  triggerRef.current?.focus();
                }}
                ref={(element) => {
                  itemRefs.current[index] = element;
                }}
                role="menuitemradio"
                type="button"
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
