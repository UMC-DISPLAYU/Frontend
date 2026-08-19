import { useDisplayMembers } from '@/hooks/queries/useDisplayMembers';
import { useUserMe } from '@/hooks/queries/useUserProfile';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/useUserStore';
import type { ExhibitionItem } from '@/types/mypage';

export function ExhibitionMeta({
  ex,
  showBadge = true,
}: {
  ex: ExhibitionItem;
  showBadge?: boolean;
}) {
  const { data: userMeData } = useUserMe();
  const userMe = useAuthStore((s) => s.user);
  const userStoreUserId = useUserStore((s) => s.userId);
  const myUserId = userMeData?.id ?? userMe?.id ?? userStoreUserId;

  const displayId = ex.displayId || Number(ex.id) || 0;
  const { data: membersData } = useDisplayMembers(showBadge && displayId > 0 ? displayId : 0);

  const currentMember = membersData?.members?.find((m) =>
    myUserId != null && m.userId != null ? Number(m.userId) === Number(myUserId) : false,
  );

  const artistName = ex.artistName || currentMember?.displayNickname;

  const roleBase = ex.isLeader === true ? '대표자' : ex.isLeader === false ? '팀원' : null;
  const roleLabel = roleBase ? (artistName ? `${roleBase}(${artistName})` : roleBase) : null;

  const statusLabel = ex.publishStatus === 'PUBLISHED' ? '등록완료' : null;
  const isDraft = ex.publishStatus === 'DRAFT';

  return (
    <div className="flex-1 min-w-0 flex flex-col gap-2">
      {/* 제목 */}
      <h3 className="typo-body-md-bold text-main leading-snug truncate">{ex.title}</h3>

      <div className="flex flex-col gap-1">
        {ex.period && <p className="typo-body-xs-regular truncate text-sub700">{ex.period}</p>}
        {ex.place && <p className="typo-body-xs-regular truncate text-sub700">{ex.place}</p>}
        {showBadge && (roleLabel !== null || statusLabel !== null) && (
          <p className="typo-body-xs-regular truncate text-faint">
            {roleLabel && <span>{roleLabel}</span>}
            {roleLabel && statusLabel && <span> ㅣ </span>}
            {statusLabel && (
              <span className={isDraft ? 'underline' : undefined}>{statusLabel}</span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
