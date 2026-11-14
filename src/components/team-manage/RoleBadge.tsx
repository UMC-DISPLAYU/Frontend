import { cn } from '@/utils/cn';

import { TEAM_ROLE_LABEL, type TeamRole } from './teamMembers';

const ROLE_CLASS: Record<TeamRole, string> = {
  owner: 'bg-[#dbeafe] text-[#2563eb]',
  manager: 'bg-[#dcfce7] text-[#00a846]',
  member: 'bg-[#f0f0f3] text-[#3f3f47]',
};

export function RoleBadge({ role }: { role: TeamRole }) {
  return (
    <span
      className={cn(
        'inline-flex h-5 shrink-0 items-center rounded-[4px] px-2 text-[10px] leading-[1.4] font-semibold tracking-[-0.03em]',
        ROLE_CLASS[role],
      )}
    >
      {TEAM_ROLE_LABEL[role]}
    </span>
  );
}
