import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

type ArtistVerifyLabelProps = {
  children: ReactNode;
  htmlFor?: string;
  id?: string;
};

export function ArtistVerifyLabel({ children, htmlFor, id }: ArtistVerifyLabelProps) {
  return (
    <label
      className="typography-body-lg-semibold flex items-center gap-1"
      htmlFor={htmlFor}
      id={id}
    >
      <span className="text-primary">{children}</span>
      <span aria-hidden className="text-error">
        *
      </span>
    </label>
  );
}

type ArtistVerifyFieldProps = {
  label: string;
  htmlFor: string;
  children: ReactNode;
  className?: string;
};

export function ArtistVerifyField({ label, htmlFor, children, className }: ArtistVerifyFieldProps) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      <ArtistVerifyLabel htmlFor={htmlFor}>{label}</ArtistVerifyLabel>
      {children}
    </div>
  );
}

type ArtistVerifyHelperTextProps = {
  children?: ReactNode;
  id?: string;
  error?: boolean;
};

export function ArtistVerifyHelperText({
  children,
  id,
  error = false,
}: ArtistVerifyHelperTextProps) {
  return (
    <p
      className={cn('typography-body-md-medium', error ? 'text-error' : 'text-secondary')}
      id={id}
      role={error ? 'alert' : undefined}
    >
      {children}
    </p>
  );
}
