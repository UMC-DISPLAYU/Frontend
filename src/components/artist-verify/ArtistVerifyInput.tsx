import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/utils/cn';

type ArtistVerifyInputProps = InputHTMLAttributes<HTMLInputElement> & {
  right?: ReactNode;
  invalid?: boolean;
};

export const ArtistVerifyInput = forwardRef<HTMLInputElement, ArtistVerifyInputProps>(
  ({ right, invalid = false, className, ...props }, ref) => (
    <div
      className={cn(
        'flex min-w-0 items-center gap-2 border-b py-3',
        invalid ? 'border-error' : 'border-primary',
      )}
    >
      <input
        aria-invalid={invalid || undefined}
        className={cn(
          'typography-body-xl-regular min-w-0 flex-1 bg-transparent text-primary outline-none placeholder:text-tertiary',
          className,
        )}
        ref={ref}
        {...props}
      />
      {right}
    </div>
  ),
);

ArtistVerifyInput.displayName = 'ArtistVerifyInput';
