import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

type VerifyLabelProps = {
  children: ReactNode;
  htmlFor?: string;
  id?: string;
};

export function VerifyLabel({ children, htmlFor, id }: VerifyLabelProps) {
  const content = (
    <>
      {children}
      <span aria-hidden className="ml-[3px] text-[#fb2c36]">
        *
      </span>
    </>
  );

  return htmlFor ? (
    <label className="flex items-center text-[14px] font-semibold" htmlFor={htmlFor} id={id}>
      {content}
    </label>
  ) : (
    <span className="flex items-center text-[14px] font-semibold" id={id}>
      {content}
    </span>
  );
}

type VerifyFieldProps = {
  label: string;
  htmlFor: string;
  children: ReactNode;
  className?: string;
};

/** 나타날 때 아래에서 살짝 올라온다(프로토타입 .field) */
export function VerifyField({ label, htmlFor, children, className }: VerifyFieldProps) {
  return (
    <div
      className={cn(
        'mt-6 animate-[artist-verify-rise_.45s_cubic-bezier(.16,1,.3,1)_backwards]',
        className,
      )}
    >
      <VerifyLabel htmlFor={htmlFor}>{label}</VerifyLabel>
      {children}
    </div>
  );
}

type VerifyHelperTextProps = {
  children?: ReactNode;
  id?: string;
  error?: boolean;
};

export function VerifyHelperText({ children, id, error = false }: VerifyHelperTextProps) {
  return (
    <p
      className={cn(
        'mt-1 text-[12px] leading-[1.4] font-medium',
        error ? 'text-[#fb2c36]' : 'text-[#3f3f47]',
      )}
      id={id}
      role={error ? 'alert' : undefined}
    >
      {children}
    </p>
  );
}
