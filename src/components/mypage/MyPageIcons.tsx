import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function OutlineIcon({ children, strokeWidth = 2, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="24"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
      width="24"
      {...props}
    >
      {children}
    </svg>
  );
}

export function InboxIcon(props: IconProps) {
  return (
    <OutlineIcon strokeWidth={1.7} {...props}>
      <path d="M4 13.5 6.2 6.4A1.5 1.5 0 0 1 7.6 5.3h8.8a1.5 1.5 0 0 1 1.4 1.1L20 13.5V18a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18z" />
      <path d="M4 13.5h4.6a1 1 0 0 1 .9.6l.4.8a1 1 0 0 0 .9.6h2.4a1 1 0 0 0 .9-.6l.4-.8a1 1 0 0 1 .9-.6H20" />
    </OutlineIcon>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <OutlineIcon strokeWidth={1.7} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </OutlineIcon>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <OutlineIcon strokeWidth={1.7} {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </OutlineIcon>
  );
}

export function GridIcon(props: IconProps) {
  return (
    <OutlineIcon {...props}>
      <rect height="5" width="5" x="5" y="5" />
      <rect height="5" width="5" x="14" y="5" />
      <rect height="5" width="5" x="5" y="14" />
      <rect height="5" width="5" x="14" y="14" />
    </OutlineIcon>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <OutlineIcon {...props}>
      <rect height="14" rx="2" width="18" x="3" y="5" />
      <path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8" />
    </OutlineIcon>
  );
}

export function PlusSquareIcon(props: IconProps) {
  return (
    <OutlineIcon {...props}>
      <rect height="16" rx="3.5" width="16" x="4" y="4" />
      <path d="M12 8.5v7M8.5 12h7" />
    </OutlineIcon>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <OutlineIcon {...props}>
      <path d="m9 5 7 7-7 7" />
    </OutlineIcon>
  );
}

export function BookmarkIcon(props: IconProps) {
  return (
    <OutlineIcon strokeWidth={1.7} {...props}>
      <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3.8L6 20V5a1 1 0 0 1 1-1z" />
    </OutlineIcon>
  );
}

// 피그마 `Avatar / 프로필 (무채색)`의 사람 모양. 프로필 사진이 없을 때 회색 원 안에 흰색으로 그린다
export function AvatarSilhouette(props: IconProps) {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 59.5 65.87" {...props}>
      <ellipse cx="29.75" cy="15.94" rx="15.23" ry="15.94" />
      <path d="M0 65.87C0 49.44 13.32 36.12 29.75 36.12S59.5 49.44 59.5 65.87z" />
    </svg>
  );
}
