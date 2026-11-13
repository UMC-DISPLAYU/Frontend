import { type InputHTMLAttributes, useId } from 'react';

import { cn } from '@/utils/cn';
import type { LinkParseResult } from '@/utils/linkInput';

interface LinkInputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  parsed: LinkParseResult;
  idleHelp: string;
  validHelp: string;
  errorMessage: string;
  /** disabled 일 때 보여줄 안내 */
  lockedHelp?: string;
}

export function LinkInputField({
  label,
  parsed,
  idleHelp,
  validHelp,
  errorMessage,
  lockedHelp,
  ...inputProps
}: LinkInputFieldProps) {
  const inputId = useId();
  const helpId = useId();
  const isLocked = Boolean(inputProps.disabled);
  const isInvalid = !isLocked && parsed.status === 'invalid';
  const help = isLocked
    ? (lockedHelp ?? idleHelp)
    : parsed.status === 'valid'
      ? validHelp
      : isInvalid
        ? errorMessage
        : idleHelp;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={inputId} className="flex items-center gap-1">
        <span className="typography-body-lg-semibold text-primary">{label}</span>
        <span className="typography-body-md-medium text-secondary">· 선택</span>
      </label>
      <div
        className={cn(
          'border-b py-3 transition duration-fast ease-standard',
          isInvalid ? 'border-error' : 'border-primary focus-within:border-interactive-primary',
        )}
      >
        <input
          id={inputId}
          type="text"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          aria-invalid={isInvalid}
          aria-describedby={helpId}
          className="typography-body-xl-regular w-full bg-transparent text-primary outline-none placeholder:text-tertiary disabled:text-secondary"
          {...inputProps}
        />
      </div>
      <p
        id={helpId}
        aria-live="polite"
        className={cn('typography-body-md-medium', isInvalid ? 'text-error' : 'text-secondary')}
      >
        {help}
      </p>
    </div>
  );
}
