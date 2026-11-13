import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

/** 프로토타입 시트 머리의 뒤로(닫기) 아이콘 */
export function BackIcon(props: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.7}
      viewBox="0 0 24 24"
      width="20"
      {...props}
    >
      <path d="m15 5-7 7 7 7" />
    </svg>
  );
}
