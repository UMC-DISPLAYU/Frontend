import { FALLBACK_PROFILE_IMAGE } from '@/constants';

import { InviteButton } from './InviteButton';
import { type MemberStatus, StatusBadge } from './StatusBadge';

export interface Member {
  id: string;
  name: string;
  nickname: string;
  status: MemberStatus;
  profileImageUrl?: string | null;
}

interface MemberRowProps {
  member: Member;
  /* 검색 결과처럼 초대할 수 있는 행에서만 넘깁니다. 없으면 상태 뱃지를 보여줍니다. */
  onInvite?: () => void;
  inviteDisabled?: boolean;
  inviteLabel?: '초대' | '초대 대기' | '팀원';
}

export function MemberRow({ member, onInvite, inviteDisabled, inviteLabel }: MemberRowProps) {
  return (
    <li className="flex items-center gap-3 rounded-[20px] bg-card px-3 py-5">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <img
          className="size-12 shrink-0 rounded-full object-cover"
          src={member.profileImageUrl || FALLBACK_PROFILE_IMAGE}
          alt={member.name}
          onError={(event) => {
            event.currentTarget.src = FALLBACK_PROFILE_IMAGE;
          }}
        />
        <div className="flex min-w-0 flex-col gap-2">
          <span className="typo-body-sm-bold truncate text-main">{member.name}</span>
          <span className="typo-body-xs-regular truncate text-hint">{member.nickname}</span>
        </div>
      </div>
      {onInvite && inviteLabel ? (
        <InviteButton label={inviteLabel} onClick={onInvite} disabled={inviteDisabled} />
      ) : (
        <StatusBadge status={member.status} />
      )}
    </li>
  );
}
