import { cn } from '@/utils/cn';

// 프로토타입(hub.html · flow.js)의 아이콘 모양을 그대로 쓴다. 선 굵기 기본값 1.8도 프로토타입 `.i`와 같다
const ICON_PATHS = {
  back: <path d="m15 5-7 7 7 7" />,
  chevron: <path d="m9 5 7 7-7 7" />,
  selector: <path d="m8 9.5 4-4 4 4M8 14.5l4 4 4-4" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  folder: (
    <>
      <path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2.2h7a2 2 0 0 1 2 2v7.3a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />
      <path d="M3.5 10.5h17" />
    </>
  ),
  team: (
    <>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3 19c.4-3.4 2.9-5.2 6-5.2s5.6 1.8 6 5.2" />
      <path d="M15.5 5.6a3 3 0 0 1 0 5.8M17.5 14c2 .5 3.2 2.1 3.5 5" />
    </>
  ),
  pencil: (
    <>
      <path d="m4 20 1-4L16.5 4.5a2 2 0 0 1 2.8 0l.2.2a2 2 0 0 1 0 2.8L8 19z" />
      <path d="m14.5 6.5 3 3" />
    </>
  ),
} as const;

export type DisplayHubIconName = keyof typeof ICON_PATHS;

interface DisplayHubIconProps {
  name: DisplayHubIconName;
  className?: string;
  strokeWidth?: number;
}

export function DisplayHubIcon({ name, className, strokeWidth = 1.8 }: DisplayHubIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn('size-6 shrink-0', className)}
    >
      {ICON_PATHS[name]}
    </svg>
  );
}
