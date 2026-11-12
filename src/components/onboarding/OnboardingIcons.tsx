import type { SVGProps } from 'react';

/* 프로토타입(onboarding.html)의 선 아이콘. 굵기·끝 모양을 그대로 맞추려고 SVG를 직접 둔다 */
const iconProps: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export function BackIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps} className={className} strokeWidth={1.8}>
      <path d="m15 5-7 7 7 7" />
    </svg>
  );
}

export function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps} className={className} strokeWidth={2}>
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}
