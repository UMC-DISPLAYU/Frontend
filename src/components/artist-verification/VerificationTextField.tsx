import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

interface VerificationTextFieldProps {
  id?: string;
  placeholder: string;
  value?: string;
  onChange?: (value: string) => void;
  right?: ReactNode;
  error?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: number;
  // react-hook-form 호환성
  name?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  ref?: React.Ref<HTMLInputElement>;
  // RHF 전용 onChange 매핑
  registerOnChange?: React.ChangeEventHandler<HTMLInputElement>;
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
  name,
  onBlur,
  ref,
  registerOnChange,
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
        name={name}
        value={value}
        ref={ref}
        maxLength={maxLength}
        inputMode={inputMode}
        onBlur={onBlur}
        onChange={(event) => {
          registerOnChange?.(event);
          onChange?.(event.target.value);
        }}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent typo-body-sm-regular text-main outline-none placeholder:text-line"
      />
      {right}
    </div>
  );
}
