import AvatarIcon from '@/assets/team-manage/AvatarIcon.svg';
import { cn } from '@/utils/cn';

import type { TeamRole } from './teamMembers';

/** 초대 대기는 두 가지 색을 번갈아 쓴다(프로토타입) */
export type MemberAvatarTone = TeamRole | 'pending' | 'pendingAlt';

const TONE_CLASS: Record<MemberAvatarTone, string> = {
  owner: 'bg-info-subtle',
  manager: 'bg-success-subtle',
  member: 'bg-secondary',
  pending: 'bg-tertiary',
  pendingAlt: 'bg-error-subtle',
};

interface MemberAvatarProps {
  tone: MemberAvatarTone;
  /** 기본 46px. 닉네임 검색 결과는 38px(size-9.5) */
  className?: string;
}

export function MemberAvatar({ tone, className }: MemberAvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative block size-11.5 shrink-0 overflow-hidden rounded-circle',
        TONE_CLASS[tone],
        className,
      )}
    >
      {/* 피그마 Avatar 의 사람 모양 위치 비율(폭 75% · 왼쪽 12.8% · 위 19.5%). 아래쪽은 원에 잘린다 */}
      <img
        src={AvatarIcon}
        alt=""
        className="absolute top-[19.54%] left-[12.82%] h-[82.35%] w-[75%] max-w-none"
      />
    </span>
  );
}
