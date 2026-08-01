import { User } from 'lucide-react';

import { type MemberStatus, StatusBadge } from './StatusBadge';

export interface Member {
  id: string;
  name: string;
  nickname: string;
  status: MemberStatus;
}

interface MemberRowProps {
  member: Member;
}

export function MemberRow({ member }: MemberRowProps) {
  return (
    <li className="flex items-center gap-3 rounded-[20px] bg-card px-3 py-5 shadow-[8px_8px_18px_0px_rgba(67,0,209,0.04)]">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-box outline outline-[1.6px] outline-offset-[-1.6px] outline-line">
          <User className="size-7 translate-y-1 text-white" strokeWidth={1.5} />
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <span className="typo-body-sm-bold truncate text-main">{member.name}</span>
          <span className="typo-body-xs-regular truncate text-hint">{member.nickname}</span>
        </div>
      </div>
      <StatusBadge status={member.status} />
    </li>
  );
}
