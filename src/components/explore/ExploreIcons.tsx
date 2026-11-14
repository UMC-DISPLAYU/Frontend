import type { ReactNode, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

// 프로토타입 탐색 화면 아이콘(24 그리드, 선 1.7). 상태마다 색이 바뀌어 currentColor 로 그린다
function ExploreIcon({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
      width="20"
      {...props}
    >
      {children}
    </svg>
  );
}

export function ExploreSearchIcon(props: IconProps) {
  return (
    <ExploreIcon {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </ExploreIcon>
  );
}

export function ExploreCloseIcon(props: IconProps) {
  return (
    <ExploreIcon {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </ExploreIcon>
  );
}

export function ExploreChevronIcon(props: IconProps) {
  return (
    <ExploreIcon {...props}>
      <path d="m6 9.5 6 6 6-6" />
    </ExploreIcon>
  );
}
