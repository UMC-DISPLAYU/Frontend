import { memo, type ReactNode } from 'react';

interface RequiredLabelProps {
  children: ReactNode;
  required?: boolean;
  htmlFor?: string;
}

export const RequiredLabel = memo(function RequiredLabel({
  children,
  required,
  htmlFor,
}: RequiredLabelProps) {
  return (
    <label htmlFor={htmlFor} className="inline-flex items-center gap-1">
      <span className="text-neutral-900 text-sm font-bold leading-5">{children}</span>
      {required && <span className="text-red-400 text-xs leading-5">*</span>}
    </label>
  );
});
