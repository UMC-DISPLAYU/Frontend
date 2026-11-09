type IconProps = { className?: string };

const OUTLINE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  strokeWidth: 2,
} as const;

export function HomeOutlineIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" {...OUTLINE}>
      <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" />
    </svg>
  );
}

export function HomeSolidIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.8485 2.75147C12.3799 2.28284 11.6201 2.28284 11.1515 2.75147L2.75147 11.1515C2.28284 11.6201 2.28284 12.3799 2.75147 12.8485C3.2201 13.3172 3.9799 13.3172 4.44853 12.8485L4.8 12.4971V20.4C4.8 21.0627 5.33726 21.6 6 21.6H8.4C9.06274 21.6 9.6 21.0627 9.6 20.4V18C9.6 17.3373 10.1373 16.8 10.8 16.8H13.2C13.8627 16.8 14.4 17.3373 14.4 18V20.4C14.4 21.0627 14.9373 21.6 15.6 21.6H18C18.6627 21.6 19.2 21.0627 19.2 20.4V12.4971L19.5515 12.8485C20.0201 13.3172 20.7799 13.3172 21.2485 12.8485C21.7172 12.3799 21.7172 11.6201 21.2485 11.1515L12.8485 2.75147Z" />
    </svg>
  );
}

export function SearchOutlineIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" {...OUTLINE}>
      <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" />
    </svg>
  );
}

export function SearchSolidIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 24 24">
      <path
        clipRule="evenodd"
        d="M9.6 4.8C6.94903 4.8 4.8 6.94903 4.8 9.6C4.8 12.251 6.94903 14.4 9.6 14.4C12.251 14.4 14.4 12.251 14.4 9.6C14.4 6.94903 12.251 4.8 9.6 4.8ZM2.4 9.6C2.4 5.62355 5.62355 2.4 9.6 2.4C13.5765 2.4 16.8 5.62355 16.8 9.6C16.8 11.155 16.3071 12.5949 15.4689 13.7718L21.2485 19.5515C21.7172 20.0201 21.7172 20.7799 21.2485 21.2485C20.7799 21.7172 20.0201 21.7172 19.5515 21.2485L13.7718 15.4689C12.5949 16.3071 11.155 16.8 9.6 16.8C5.62355 16.8 2.4 13.5765 2.4 9.6Z"
        fillRule="evenodd"
      />
    </svg>
  );
}

const USER_PATH =
  'M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7ZM5 21C5 17.134 8.13401 14 12 14C15.866 14 19 17.134 19 21H5Z';

export function UserOutlineIcon({ className }: IconProps) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" {...OUTLINE}>
      <path d={USER_PATH} />
    </svg>
  );
}

// 피그마에 채움 사람 아이콘이 따로 없어, 선 아이콘의 머리 · 몸통을 채우고 같은 선을 둘러 도톰하게 만든 모양이다
export function UserSelectedIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      {...OUTLINE}
      fill="currentColor"
    >
      <path d={USER_PATH} />
    </svg>
  );
}
