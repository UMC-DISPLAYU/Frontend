import type { ButtonHTMLAttributes } from 'react';

import { FOCUS_RING, PRESS_TRANSITION, TAP_BASE } from './artistVerifyStyles';

/** 입력칸 오른쪽 버튼(메일발송 · 재발송 · 인증 확인) */
export function VerifyActionButton({
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${TAP_BASE} ${FOCUS_RING} ${PRESS_TRANSITION} h-11 min-w-[88px] shrink-0 rounded-[12px] bg-[#18181b] px-4 text-[14px] font-semibold whitespace-nowrap text-[#fff] hover:enabled:bg-[#2f2f35] active:enabled:scale-[.97] disabled:bg-[#f4f4f5] disabled:text-[#d4d4d8]`}
      type={type}
      {...props}
    />
  );
}
