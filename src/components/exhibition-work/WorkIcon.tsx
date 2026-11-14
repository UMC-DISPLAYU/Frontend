import type { SVGProps } from 'react';

import { cn } from '@/utils/cn';

/* 프로토타입(works.html · section.html) 아이콘. 선 1.8 · 둥근 끝, 색은 글자색을 따른다 */
const PATHS = {
  back: <path d="m15 5-7 7 7 7" />,
  chev: <path d="m9 5 7 7-7 7" />,
  plus: <path d="M12 5v14M5 12h14" />,
  lines: <path d="M5 9h14M5 15h14" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  trash: <path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12" />,
  image: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2.5" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m5 17 5-4.5 3.5 3L16 13l3 3" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 8v.2" />
    </>
  ),
} as const;

export type WorkIconName = keyof typeof PATHS;

export function WorkIcon({
  name,
  className,
  ...props
}: { name: WorkIconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn('size-6 shrink-0', className)}
      {...props}
    >
      {PATHS[name]}
    </svg>
  );
}
