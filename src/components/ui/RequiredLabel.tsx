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
      <span className="text-dark typo-body-sm-bold leading-5">
        {children}
      </span>
      {required && <span className="text-red-400 typo-body-xs-regular leading-5">*</span>}
    </label>
  );
});
