import { cn } from '@/utils/cn';

import { AvatarGlyph } from './TeamIcons';

/* 기본 프로필: 역할 · 상태와 상관없이 회색 원 + 흰 사람 모양 하나로 통일한다(디자인 확정) */
export function MemberAvatar({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative block size-11.5 shrink-0 overflow-hidden rounded-full bg-[#f0f0f3] text-[#fafafa]',
        className,
      )}
    >
      {/* 프로토타입 .av svg 위치. 아래쪽은 원에 잘린다 */}
      <AvatarGlyph className="absolute top-[19.54%] left-[13.44%] h-[82.34%] w-[74.38%]" />
    </span>
  );
}
