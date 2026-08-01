import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

interface VerificationTextFieldProps {
  id?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  right?: ReactNode;
  error?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: number;
}

export function VerificationTextField({
  id,
  placeholder,
  value,
  onChange,
  right,
  error,
  inputMode,
  maxLength,
}: VerificationTextFieldProps) {
  return (
    <div
      className={cn(
        'flex h-10 items-center border-b px-3 pb-px',
        error ? 'border-error' : value ? 'border-hint' : 'border-line',
      )}
    >
      <input
        id={id}
        value={value}
        maxLength={maxLength}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent typo-body-sm-regular text-main outline-none placeholder:text-line"
      />
      {right}
    </div>
  );
}
