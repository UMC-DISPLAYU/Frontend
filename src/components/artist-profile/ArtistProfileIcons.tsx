import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function OutlineIcon({ children, strokeWidth = 2, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
      width="20"
      {...props}
    >
      {children}
    </svg>
  );
}

export function BackIcon(props: IconProps) {
  return (
    <OutlineIcon height="24" width="24" {...props}>
      <path d="m15 5-7 7 7 7" />
    </OutlineIcon>
  );
}

export function PencilIcon(props: IconProps) {
  return (
    <OutlineIcon {...props}>
      <path d="m4 20 1-4L16.5 4.5a2 2 0 0 1 3 3L8 19z" />
      <path d="m14.5 6.5 3 3" />
    </OutlineIcon>
  );
}

export function BookmarkIcon(props: IconProps) {
  return (
    <OutlineIcon {...props}>
      <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3.8L6 20V5a1 1 0 0 1 1-1z" />
    </OutlineIcon>
  );
}

export function ExternalLinkIcon(props: IconProps) {
  return (
    <OutlineIcon {...props}>
      <path d="M14 5h5v5M19 5l-8 8" />
      <path d="M17 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h4" />
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
