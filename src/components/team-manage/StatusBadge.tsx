type MemberStatus = 'owner' | 'member' | 'pending' | 'unverified';

const STATUS_LABEL: Record<MemberStatus, string> = {
  owner: '대표자',
  member: '작가 인증',
  pending: '초대대기',
  unverified: '작가미인증',
};

const isAccent = (status: MemberStatus) => status === 'owner' || status === 'member';

interface StatusBadgeProps {
  status: MemberStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === 'pending') return null;

  const accent = isAccent(status);
  return (
    <span
      className={`typo-body-xs-regular shrink-0 rounded-sm px-2.5 py-1 text-center ${
        accent ? 'bg-[#DBEAFE] text-link' : 'bg-box200 text-main'
      }`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export type { MemberStatus };
