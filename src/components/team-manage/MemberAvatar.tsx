import { cn } from '@/utils/cn';

import { AvatarGlyph } from './TeamIcons';
import type { TeamRole } from './teamMembers';

/** 초대 대기는 두 가지 색을 번갈아 쓴다(프로토타입) */
export type MemberAvatarTone = TeamRole | 'pending' | 'pendingAlt';

const TONE_CLASS: Record<MemberAvatarTone, string> = {
  owner: 'bg-[#dbeafe]',
  manager: 'bg-[#dcfce7]',
  member: 'bg-[#f0f0f3]',
  pending: 'bg-[#f0f0f3]',
  pendingAlt: 'bg-[#fee2e2]',
};

interface MemberAvatarProps {
  tone: MemberAvatarTone;
  /** 기본 46px */
  className?: string;
}

export function MemberAvatar({ tone, className }: MemberAvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative block size-11.5 shrink-0 overflow-hidden rounded-full text-[#fafafa]',
        TONE_CLASS[tone],
        className,
      )}
    >
      {/* 프로토타입 .av svg 위치. 아래쪽은 원에 잘린다 */}
      <AvatarGlyph className="absolute top-[19.54%] left-[13.44%] h-[82.34%] w-[74.38%]" />
    </span>
  );
}
