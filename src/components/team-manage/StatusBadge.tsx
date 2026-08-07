type MemberStatus = 'owner' | 'member' | 'pending';

const STATUS_LABEL: Record<MemberStatus, string> = {
  owner: '대표자',
  member: '팀원',
  pending: '초대대기',
};

const isAccent = (status: MemberStatus) => status === 'owner' || status === 'member';

interface StatusBadgeProps {
  status: MemberStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const accent = isAccent(status);
  return (
    <span
      className={`typo-body-xs-regular shrink-0 rounded-sm px-2.5 py-1 text-center ${
        accent ? 'bg-tag-bg text-link' : 'bg-box200 text-main'
      }`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export type { MemberStatus };
