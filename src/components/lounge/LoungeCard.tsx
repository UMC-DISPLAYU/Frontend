import type { ReactNode } from 'react';

type Props = {
  className?: string;
  children: ReactNode;
};

export function LoungeCard({ className = '', children }: Props) {
  return (
    <div
      className={`p-3 bg-box100 rounded-lg overflow-hidden shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04),inset_2px_2px_3px_0px_rgba(0,0,0,0.20),inset_-2px_-2px_3px_0px_rgba(255,255,255,1.00)] ${className}`}
    >
      {children}
    </div>
  );
}
