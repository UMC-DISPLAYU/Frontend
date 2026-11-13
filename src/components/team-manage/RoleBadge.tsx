import { cn } from '@/utils/cn';

import { TEAM_ROLE_LABEL, type TeamRole } from './teamMembers';

const ROLE_CLASS: Record<TeamRole, string> = {
  owner: 'bg-info-subtle text-info',
  manager: 'bg-success-subtle text-green-800',
  member: 'bg-tertiary text-tertiary',
};

export function RoleBadge({ role }: { role: TeamRole }) {
  return (
    <span
      className={cn(
        'typography-body-sm-semibold inline-flex h-5 shrink-0 items-center rounded-4 px-1.5',
        ROLE_CLASS[role],
      )}
    >
      {TEAM_ROLE_LABEL[role]}
    </span>
  );
}
