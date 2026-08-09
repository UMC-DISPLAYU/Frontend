type MemberStatus = 'owner' | 'verified' | 'unverified' | 'pending';

interface StatusBadgeProps {
  status: MemberStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === 'owner') {
    return (
      <span className="typo-body-xs-regular shrink-0 rounded-sm bg-link/10 px-2.5 py-1 text-center text-link">
        대표자
      </span>
    );
  }

  if (status === 'verified') {
    return (
      <span className="typo-body-xs-regular shrink-0 rounded-sm bg-tag-gray px-2.5 py-1 text-center text-link">
        작가 인증
      </span>
    );
  }

  if (status === 'pending') {
    return (
      <span className="typo-body-xs-regular shrink-0 rounded-sm bg-bt-gray px-2.5 py-1 text-center text-main">
        초대 대기
      </span>
    );
  }

  return (
    <span className="typo-body-xs-regular shrink-0 rounded-sm bg-bt-gray px-2.5 py-1 text-center text-main">
      작가 미인증
    </span>
  );
}

export type { MemberStatus };
