import { cn } from '@/utils/cn';

/* 프로토타입 media.js `.vbadge`: 포스터 왼쪽 위 6 · 높이 20 · 안쪽 4/6 · 모서리 4 · 검정 72% · 재생 아이콘 10 */
export function VideoPosterBadge({ className }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="영상 포스터"
      className={cn(
        'absolute top-1.5 left-1.5 inline-flex h-5 items-center rounded-4 bg-[rgba(0,0,0,0.72)] pr-1.5 pl-1 text-[#fff]',
        className,
      )}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-2.5">
        <path d="M7 4.8v14.4L19 12z" fill="currentColor" />
      </svg>
    </span>
  );
}
