import type { ReactNode, SVGProps } from 'react';

import { cn } from '@/utils/cn';

/* 프로토타입(team.html · flow.js)의 선 아이콘. 굵기 1.8 · 둥근 끝 · currentColor 를 그대로 옮겼다 */
function LineIcon({
  className,
  children,
  ...props
}: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-6 shrink-0', className)}
      {...props}
    >
      {children}
    </svg>
  );
}

type IconProps = { className?: string };

export const BackIcon = ({ className }: IconProps) => (
  <LineIcon className={className}>
    <path d="m15 5-7 7 7 7" />
  </LineIcon>
);

export const ChevronIcon = ({ className }: IconProps) => (
  <LineIcon className={className}>
    <path d="m9 5 7 7-7 7" />
  </LineIcon>
);

export const CopyIcon = ({ className }: IconProps) => (
  <LineIcon className={className}>
    <rect x="8" y="8" width="11" height="11" rx="2" />
    <path d="M5 15V6a2 2 0 0 1 2-2h8" />
  </LineIcon>
);

export const SearchIcon = ({ className }: IconProps) => (
  <LineIcon className={className}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </LineIcon>
);

export const MoreIcon = ({ className }: IconProps) => (
  <LineIcon className={className}>
    <circle cx="5.5" cy="12" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="18.5" cy="12" r="1.3" fill="currentColor" stroke="none" />
  </LineIcon>
);
