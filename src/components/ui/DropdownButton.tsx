import type { ButtonHTMLAttributes } from 'react';

import dropdownActiveIcon from '@/assets/icons/DropdownActiveIcon.svg';
import dropdownCloseIcon from '@/assets/icons/DropdownCloseIcon.svg';
import dropdownIcon from '@/assets/icons/DropdownIcon.svg';
import { cn } from '@/utils/cn';

type DropdownButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  label: string;
  open: boolean;
  hasValue: boolean;
};

export function DropdownButton({
  label,
  open,
  hasValue,
  className,
  ...buttonProps
}: DropdownButtonProps) {
  const isActive = open || hasValue;
  const icon = open ? dropdownCloseIcon : hasValue ? dropdownActiveIcon : dropdownIcon;

  return (
    <button
      aria-expanded={open}
      className={cn(
        'flex h-8.75 cursor-pointer items-center justify-center gap-2 rounded-12 border bg-primary-white px-3 py-2',
        isActive ? 'border-icon-tertiary' : 'border-primary',
        className,
      )}
      type="button"
      {...buttonProps}
    >
      <span
        className={cn(
          'typography-body-md-medium whitespace-nowrap',
          isActive ? 'text-primary' : 'text-primary-400',
        )}
      >
        {label}
      </span>
      <img alt="" className="size-4 shrink-0" src={icon} />
    </button>
  );
}
