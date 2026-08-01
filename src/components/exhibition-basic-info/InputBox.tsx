import { type ReactNode } from 'react';

const inputBoxClass =
  'flex items-center gap-2 rounded-lg bg-card px-3 py-2.5 outline outline-1 outline-offset-[-1px] outline-line shadow-[0px_0px_8px_0px_rgba(67,0,209,0.05)]';

interface InputBoxProps {
  children: ReactNode;
  className?: string;
}

export function InputBox({ children, className = '' }: InputBoxProps) {
  return <div className={`${inputBoxClass} ${className}`}>{children}</div>;
}
