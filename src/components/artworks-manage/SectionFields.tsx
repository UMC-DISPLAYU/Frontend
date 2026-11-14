import type { LabelHTMLAttributes } from 'react';

/* 프로토타입 `.field`: 라벨 14 SemiBold, 필수 * 빨강 */
export function SectionFieldLabel({
  required = false,
  children,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label {...props} className="flex items-center text-[14px] font-semibold tracking-[-0.03em]">
      <span>
        {children}
        {required && (
          <span aria-hidden="true" className="ml-[3px] text-[#fb2c36]">
            *
          </span>
        )}
      </span>
    </label>
  );
}

/* 프로토타입 `.ul input`: 밑줄 칸 높이 47 · 라벨 아래 4 · 글자 16 Regular */
export const sectionInputClass =
  'mt-1 block h-[47px] w-full rounded-0 border-0 border-b border-[#d4d4d8] bg-transparent p-0 text-[16px] font-normal tracking-[-0.03em] text-[#18181b] outline-none transition-colors duration-fast placeholder:text-[#71717b] focus:border-[#18181b]';
