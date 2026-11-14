import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/utils/cn';

type VerifyInputProps = InputHTMLAttributes<HTMLInputElement> & {
  right?: ReactNode;
  invalid?: boolean;
  wrapperClassName?: string;
};

/** 밑줄 입력칸. 포커스하면 밑줄이 진해지고 오류면 빨간색이다. */
export const VerifyInput = forwardRef<HTMLInputElement, VerifyInputProps>(
  ({ right, invalid = false, className, wrapperClassName, ...props }, ref) => (
    <div
      className={cn(
        'relative flex h-[47px] min-w-0 flex-1 items-center border-b transition-[border-color] duration-200',
        invalid ? 'border-[#fb2c36]' : 'border-[#d4d4d8] focus-within:border-[#18181b]',
        wrapperClassName,
      )}
    >
      <input
        aria-invalid={invalid || undefined}
        className={cn(
          'h-full min-w-0 flex-1 bg-transparent p-0 text-[16px] font-normal outline-none placeholder:text-[#71717b] disabled:cursor-default',
          className,
        )}
        ref={ref}
        {...props}
      />
      {right}
    </div>
  ),
);

VerifyInput.displayName = 'VerifyInput';
