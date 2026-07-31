import type { ReactNode } from 'react';

import { RequiredLabel } from '@/components/ui';

interface ArtistVerificationFieldProps {
  children: ReactNode;
  label: string;
  htmlFor?: string;
  helperText?: string;
  helperTone?: 'default' | 'info' | 'error';
  className?: string;
}

const helperToneClass = {
  default: 'text-faint',
  info: 'text-link',
  error: 'text-error',
};

export function ArtistVerificationField({
  children,
  label,
  htmlFor,
  helperText,
  helperTone = 'default',
  className = '',
}: ArtistVerificationFieldProps) {
  return (
    <section className={className}>
      <RequiredLabel htmlFor={htmlFor} required>
        {label}
      </RequiredLabel>
      <div className="mt-3">{children}</div>
      {helperText ? (
        <p className={`mt-1 typo-body-xxs-regular ${helperToneClass[helperTone]}`}>{helperText}</p>
      ) : null}
    </section>
  );
}
