import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

// 피그마 `Icon / search`와 같은 모양. 포커스 · 상태에 따라 색이 바뀌어 currentColor 로 그린다
export function ExploreSearchIcon(props: IconProps) {
  return (
    <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 20 20" width="20" {...props}>
      <path
        d="M17.5 17.5L12.5 12.5M14.1667 8.33333C14.1667 11.555 11.555 14.1667 8.33333 14.1667C5.11167 14.1667 2.5 11.555 2.5 8.33333C2.5 5.11167 5.11167 2.5 8.33333 2.5C11.555 2.5 14.1667 5.11167 14.1667 8.33333Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

// 피그마 필터 칩 · 정렬의 `화살표`와 같은 모양. 칩 상태(기본 · 적용됨 · 열림)마다 색이 달라 currentColor 로 그린다
export function ExploreChevronIcon(props: IconProps) {
  return (
    <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 20 20" width="20" {...props}>
      <path
        d="M15.8333 7.5L10 13.3333L4.16667 7.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
